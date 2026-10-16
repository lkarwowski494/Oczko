import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLang, t } from '../../src/core/i18n';
import {
  KNITTING_GLOSSARY,
  GlossaryCategory,
  GlossaryTerm,
  searchGlossary,
} from '../../src/core/glossary-data';
import {
  TRAINER_EXERCISES,
  TrainerExercise,
  PatternTrainerEngine,
} from '../../src/core/pattern-trainer';
import {
  getQuestionByStep,
  identifyStitch,
  StitchMatchResult,
} from '../../src/core/stitch-identifier';
import {
  EmergencyProcedure,
  diagnoseEmergency,
  CraftDiscipline,
} from '../../src/core/knitting-doctor';

type ActiveTab = 'glossary' | 'trainer' | 'identifier' | 'doctor';

const CATEGORY_CHIPS: Array<{ key: GlossaryCategory | 'all'; label: string }> = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'basic', label: 'Podstawowe' },
  { key: 'decrease', label: 'Redukcje (-)' },
  { key: 'increase', label: 'Dodawanie (+)' },
  { key: 'cable', label: 'Warkocze' },
  { key: 'short_rows', label: 'Rzędy skrócone' },
  { key: 'crochet', label: 'Szydełko' },
];

export default function LearnScreen() {
  const _lang = useLang();
  const [activeTab, setActiveTab] = useState<ActiveTab>('glossary');

  // Stan słownika
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');

  // Stan Doktora Błędów (BR-BIB-010..015)
  const [doctorQuery, setDoctorQuery] = useState('');
  const [doctorCraftFilter, setDoctorCraftFilter] = useState<CraftDiscipline>('both');
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyProcedure | null>(null);

  // Stan trenażera powtórzeń
  const [activeExercise, setActiveExercise] = useState<TrainerExercise>(TRAINER_EXERCISES[0]);
  const [trainerEngine, setTrainerEngine] = useState<PatternTrainerEngine>(
    () => new PatternTrainerEngine(TRAINER_EXERCISES[0])
  );
  const [trainerState, setTrainerState] = useState(() => trainerEngine.getState());

  // Stan klucza identyfikacji ściegów (DEC-16)
  const [identifierStep, setIdentifierStep] = useState(0);
  const [identifierAnswers, setIdentifierAnswers] = useState<Record<string, string>>({});
  const [identifierResult, setIdentifierResult] = useState<StitchMatchResult | null>(null);

  const handleSelectIdentifierOption = (questionId: string, optionId: string) => {
    const updated = { ...identifierAnswers, [questionId]: optionId };
    setIdentifierAnswers(updated);
    if (identifierStep < 2) {
      setIdentifierStep(identifierStep + 1);
    } else {
      const result = identifyStitch(updated);
      setIdentifierResult(result);
      setIdentifierStep(3);
    }
  };

  const handleIdentifierBack = () => {
    if (identifierStep > 0) {
      setIdentifierStep(identifierStep - 1);
    }
  };

  const handleIdentifierReset = () => {
    setIdentifierAnswers({});
    setIdentifierResult(null);
    setIdentifierStep(0);
  };

  const handleSelectExercise = (exercise: TrainerExercise) => {
    const newEngine = new PatternTrainerEngine(exercise);
    setActiveExercise(exercise);
    setTrainerEngine(newEngine);
    setTrainerState(newEngine.getState());
  };

  const handleTrainerNextStep = () => {
    trainerEngine.nextStep();
    setTrainerState({ ...trainerEngine.getState() });
  };

  const handleTrainerReset = () => {
    trainerEngine.reset();
    setTrainerState({ ...trainerEngine.getState() });
  };

  // Filtrowanie słownika
  const searchedTerms = searchGlossary(searchQuery);
  const filteredTerms = selectedCategory === 'all'
    ? searchedTerms
    : searchedTerms.filter((term) => term.category === selectedCategory);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Przełącznik główny: Słownik / Trenażer powtórzeń / Co widzisz? */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'glossary' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('glossary')}
          accessibilityRole="button"
          accessibilityLabel={t('Słownik i symbole')}
        >
          <Text style={[styles.segmentText, activeTab === 'glossary' && styles.segmentTextActive]}>
            📖 {t('Słownik & Symbole')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'trainer' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('trainer')}
          accessibilityRole="button"
          accessibilityLabel={t('Trenażer powtórzeń')}
        >
          <Text style={[styles.segmentText, activeTab === 'trainer' && styles.segmentTextActive]}>
            🎯 {t('Trenażer powtórzeń')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'identifier' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('identifier')}
          accessibilityRole="button"
          accessibilityLabel={t('Klucz rozpoznawania ściegów: Co widzisz?')}
        >
          <Text style={[styles.segmentText, activeTab === 'identifier' && styles.segmentTextActive]}>
            🔍 {t('Co widzisz?')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'doctor' && styles.segmentButtonActive]}
          onPress={() => {
            setActiveTab('doctor');
            setSelectedEmergency(null);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('Doktor błędów i ratowanie dzianiny')}
        >
          <Text style={[styles.segmentText, activeTab === 'doctor' && styles.segmentTextActive]}>
            🩺 {t('Doktor Błędów')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'glossary' && (
        <View style={styles.tabContent}>
          {/* Wyszukiwarka */}
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('Szukaj skrótu lub techniki (np. k2tog, narz, c6f)...')}
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Filtry kategorii */}
          <View style={styles.chipsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
              {CATEGORY_CHIPS.map((chip) => (
                <TouchableOpacity
                  key={chip.key}
                  style={[
                    styles.chip,
                    selectedCategory === chip.key && styles.chipActive,
                  ]}
                  onPress={() => setSelectedCategory(chip.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategory === chip.key && styles.chipTextActive,
                    ]}
                  >
                    {t(chip.label)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Lista haseł */}
          <FlatList
            data={filteredTerms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.badgeRow}>
                    <View style={styles.abbrBadgePL}>
                      <Text style={styles.abbrLabel}>PL:</Text>
                      <Text style={styles.abbrValue}>{item.abbreviationPL}</Text>
                    </View>
                    <View style={styles.abbrBadgeEN}>
                      <Text style={styles.abbrLabel}>EN:</Text>
                      <Text style={styles.abbrValue}>{item.abbreviationEN}</Text>
                    </View>
                    {item.abbreviationDE && (
                      <View style={styles.abbrBadgeDE}>
                        <Text style={styles.abbrLabel}>DE:</Text>
                        <Text style={styles.abbrValueDE}>{item.abbreviationDE}</Text>
                      </View>
                    )}
                  </View>

                  {item.symbolGlyph && (
                    <View style={styles.glyphBadge}>
                      <Text style={styles.glyphText}>{item.symbolGlyph}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.termTitle}>
                  {item.namePL} <Text style={styles.termTitleEN}>({item.nameEN})</Text>
                </Text>
                <Text style={styles.termDesc}>{item.description}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Widok: Trenażer powtórzeń (DEC-17) */}
      {activeTab === 'trainer' && (
        <ScrollView contentContainerStyle={styles.trainerScrollContent}>
          {/* Wybór ćwiczenia */}
          <Text style={styles.sectionHeader}>WYBIERZ WZORZEC DO ĆWICZENIA</Text>
          <View style={styles.exerciseChips}>
            {TRAINER_EXERCISES.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                style={[
                  styles.exerciseChip,
                  activeExercise.id === ex.id && styles.exerciseChipActive,
                ]}
                onPress={() => handleSelectExercise(ex)}
              >
                <Text
                  style={[
                    styles.exerciseChipText,
                    activeExercise.id === ex.id && styles.exerciseChipTextActive,
                  ]}
                >
                  {ex.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Karta ćwiczenia */}
          <View style={styles.trainerHeaderCard}>
            <Text style={styles.trainerExerciseTitle}>{activeExercise.name}</Text>
            <Text style={styles.trainerExerciseDesc}>{activeExercise.description}</Text>
            <Text style={styles.stitchesInfo}>Oczek w rzędzie: {activeExercise.totalStitches}</Text>
          </View>

          {/* Główna interaktywna stacja trenażera */}
          <View style={styles.trainerStationCard}>
            {trainerState.isCompleted ? (
              <View style={styles.completedBox}>
                <Text style={styles.completedIcon}>🎉</Text>
                <Text style={styles.completedTitle}>Wzorzec ukończony!</Text>
                <Text style={styles.completedDesc}>
                  Wszystkie {trainerState.totalStepsCompleted} kroków sekwencji wykonane pomyślnie.
                </Text>
                <TouchableOpacity style={styles.restartButton} onPress={handleTrainerReset}>
                  <Text style={styles.restartButtonText}>Powtórz ćwiczenie</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.statusMetaRow}>
                  <Text style={styles.rowBadge}>
                    Rząd {trainerState.currentRowNumber} ({trainerState.currentSide === 'RS' ? 'Prawa strona' : 'Lewa strona'})
                  </Text>
                  <Text style={styles.repeatBadge}>
                    Powtórzenie {trainerState.currentRepeatNumber} z {trainerState.totalRepeatsInRow}
                  </Text>
                </View>

                {/* Duża instrukcja bieżącego kroku */}
                <View style={styles.stepInstructionBox}>
                  {trainerState.currentInstruction.glyph && (
                    <Text style={styles.stepGlyph}>{trainerState.currentInstruction.glyph}</Text>
                  )}
                  <Text style={styles.stepCode}>{trainerState.currentInstruction.code}</Text>
                  <Text style={styles.stepDesc}>{trainerState.currentInstruction.description}</Text>
                  <Text style={styles.stepCount}>
                    ({trainerState.currentInstruction.stitchesCount} {trainerState.currentInstruction.stitchesCount === 1 ? 'oczko' : 'oczka'})
                  </Text>
                </View>

                {/* Duży przycisk postępu kroku */}
                <TouchableOpacity
                  style={styles.stepButton}
                  activeOpacity={0.85}
                  onPress={handleTrainerNextStep}
                >
                  <Text style={styles.stepButtonText}>Zalicz krok (+)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetButton} onPress={handleTrainerReset}>
                  <Text style={styles.resetButtonText}>Zresetuj ćwiczenie</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      )}

      {activeTab === 'identifier' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.identifierScrollContent}>
          {identifierStep < 3 ? (
            (() => {
              const currentQuestion = getQuestionByStep(identifierStep);
              if (!currentQuestion) return null;
              return (
                <View style={styles.identifierCard}>
                  <View style={styles.identifierHeaderRow}>
                    <Text style={styles.identifierStepBadge}>
                      {`Krok ${currentQuestion.stepNumber} z ${currentQuestion.totalSteps}`}
                    </Text>
                    {identifierStep > 0 && (
                      <TouchableOpacity
                        style={styles.identifierBackButton}
                        onPress={handleIdentifierBack}
                        accessibilityRole="button"
                        accessibilityLabel="Cofnij do poprzedniego pytania"
                      >
                        <Text style={styles.identifierBackButtonText}>◀ Cofnij</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.identifierTitle}>{currentQuestion.title}</Text>
                  <Text style={styles.identifierSubtitle}>{currentQuestion.subtitle}</Text>

                  <View style={styles.optionsList}>
                    {currentQuestion.options.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.optionCard,
                          identifierAnswers[currentQuestion.id] === option.id && styles.optionCardSelected,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleSelectIdentifierOption(currentQuestion.id, option.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`${option.label}: ${option.description}`}
                      >
                        <View style={styles.optionHeader}>
                          <Text style={styles.optionLabel}>{option.label}</Text>
                          {option.badge && <Text style={styles.optionBadge}>{option.badge}</Text>}
                        </View>
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.identifierResetButton}
                    onPress={handleIdentifierReset}
                    accessibilityRole="button"
                    accessibilityLabel="Zresetuj identyfikację"
                  >
                    <Text style={styles.identifierResetButtonText}>↺ Zacznij od początku</Text>
                  </TouchableOpacity>
                </View>
              );
            })()
          ) : (
            identifierResult && (
              <View style={styles.resultContainer}>
                <View style={styles.resultHeaderCard}>
                  <View style={styles.resultBadgeRow}>
                    <Text style={styles.resultCategoryBadge}>
                      {identifierResult.craftType === 'knitting' ? '🧶 Druty' : '🪡 Szydełko'} • {identifierResult.category.toUpperCase()}
                    </Text>
                    <Text style={styles.resultConfidenceBadge}>✓ Pewne dopasowanie</Text>
                  </View>

                  <Text style={styles.resultTitlePl}>{identifierResult.namePl}</Text>
                  <Text style={styles.resultTitleEn}>({identifierResult.nameEn})</Text>
                  <Text style={styles.resultDescription}>{identifierResult.description}</Text>
                </View>

                {/* Sekcja porad liczenia rzędów */}
                <View style={styles.tipCard}>
                  <Text style={styles.tipHeader}>🔢 Jak liczyć rzędy w tym ściegu?</Text>
                  <Text style={styles.tipText}>{identifierResult.rowCountingTip}</Text>
                </View>

                {/* Sekcja rad dot. brzegów i blokowania */}
                {identifierResult.curlingAdvice && (
                  <View style={styles.adviceCard}>
                    <Text style={styles.adviceHeader}>💡 Wskazówka techniczna & brzegi</Text>
                    <Text style={styles.adviceText}>{identifierResult.curlingAdvice}</Text>
                  </View>
                )}

                {/* Przyciski akcji łączące moduł nauki */}
                <View style={styles.resultActions}>
                  {identifierResult.glossaryTermQuery && (
                    <TouchableOpacity
                      style={styles.actionPrimaryButton}
                      onPress={() => {
                        setActiveTab('glossary');
                        setSearchQuery(identifierResult.glossaryTermQuery!);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Zobacz definicję w słowniku"
                    >
                      <Text style={styles.actionPrimaryButtonText}>📖 Pokaż definicję w słowniku</Text>
                    </TouchableOpacity>
                  )}

                  {identifierResult.trainerExerciseId && (
                    <TouchableOpacity
                      style={styles.actionSecondaryButton}
                      onPress={() => {
                        const ex = TRAINER_EXERCISES.find((e) => e.id === identifierResult.trainerExerciseId);
                        if (ex) {
                          handleSelectExercise(ex);
                          setActiveTab('trainer');
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Przejdź do ćwiczenia w trenażerze"
                    >
                      <Text style={styles.actionSecondaryButtonText}>🎯 Poćwicz ten ścieg w trenażerze</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.restartIdentifierButton}
                    onPress={handleIdentifierReset}
                    accessibilityRole="button"
                    accessibilityLabel="Zidentyfikuj inny ścieg"
                  >
                    <Text style={styles.restartIdentifierButtonText}>🔍 Zidentyfikuj inny ścieg</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}
        </ScrollView>
      )}

      {activeTab === 'doctor' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.doctorScrollContent}>
          {selectedEmergency ? (
            <View style={styles.procedureDetailsContainer}>
              <TouchableOpacity
                style={styles.doctorBackButton}
                onPress={() => setSelectedEmergency(null)}
                accessibilityRole="button"
                accessibilityLabel="Wróć do listy problemów"
              >
                <Text style={styles.doctorBackButtonText}>← Wróć do listy problemów</Text>
              </TouchableOpacity>

              <View style={styles.procedureHeaderCard}>
                <View style={styles.procedureBadgeRow}>
                  <Text
                    style={[
                      styles.dangerBadge,
                      selectedEmergency.dangerLevel === 'critical'
                        ? styles.dangerBadgeCritical
                        : selectedEmergency.dangerLevel === 'moderate'
                        ? styles.dangerBadgeModerate
                        : styles.dangerBadgeLow,
                    ]}
                  >
                    {selectedEmergency.dangerLevel === 'critical'
                      ? '🔴 Poziom: Krytyczny'
                      : selectedEmergency.dangerLevel === 'moderate'
                      ? '🟠 Poziom: Umiarkowany'
                      : '🟡 Poziom: Niski'}
                  </Text>
                  <Text style={styles.craftBadge}>
                    {selectedEmergency.craftType === 'knitting'
                      ? '🧶 Druty'
                      : selectedEmergency.craftType === 'crochet'
                      ? '🪢 Szydełko'
                      : '🧶 Druty & Szydełko'}
                  </Text>
                </View>

                <Text style={styles.procedureTitle}>{selectedEmergency.title}</Text>
                <Text style={styles.procedureSummary}>{selectedEmergency.summary}</Text>

                <View style={styles.toolsCard}>
                  <Text style={styles.toolsHeader}>🧰 Potrzebne narzędzia:</Text>
                  {selectedEmergency.toolsNeeded.map((t, idx) => (
                    <Text key={idx} style={styles.toolItemText}>• {t}</Text>
                  ))}
                </View>
              </View>

              <View style={styles.stepsContainer}>
                <Text style={styles.stepsSectionTitle}>Procedura ratunkowa krok po kroku:</Text>
                {selectedEmergency.steps.map((st) => (
                  <View key={st.stepNumber} style={styles.stepCard}>
                    <View style={styles.stepHeader}>
                      <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>{st.stepNumber}</Text>
                      </View>
                      <Text style={styles.stepTitleText}>{st.title}</Text>
                    </View>
                    <Text style={styles.stepInstructionText}>{st.instruction}</Text>
                    {st.tip && (
                      <View style={styles.stepTipBox}>
                        <Text style={styles.stepTipText}>💡 Porada: {st.tip}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.preventionCard}>
                <Text style={styles.preventionHeader}>🛡️ Jak zapobiegać w przyszłości:</Text>
                <Text style={styles.preventionText}>{selectedEmergency.preventionTip}</Text>
              </View>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setSelectedEmergency(null)}
                accessibilityRole="button"
                accessibilityLabel="Zrozumiałam, usterka naprawiona"
              >
                <Text style={styles.doneButtonText}>✅ Zrozumiałam, usterka naprawiona!</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.doctorHomeContainer}>
              <View style={styles.doctorIntroCard}>
                <Text style={styles.doctorIntroTitle}>🩺 Pogotowie Dziewiarskie</Text>
                <Text style={styles.doctorIntroSubtitle}>
                  Spokojnie! W rękodziele niemal każdy błąd można bezpiecznie naprawić bez prucia całej robótki.
                </Text>
              </View>

              {/* Wyszukiwarka objawów */}
              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Opisz problem (np. drabinka, dziura, pętla, spuszczone)..."
                  placeholderTextColor="#999999"
                  value={doctorQuery}
                  onChangeText={setDoctorQuery}
                  clearButtonMode="while-editing"
                />
              </View>

              {/* Filtry dyscypliny */}
              <View style={styles.craftFilterRow}>
                {(['both', 'knitting', 'crochet'] as const).map((cf) => (
                  <TouchableOpacity
                    key={cf}
                    style={[
                      styles.craftFilterButton,
                      doctorCraftFilter === cf && styles.craftFilterButtonActive,
                    ]}
                    onPress={() => setDoctorCraftFilter(cf)}
                    accessibilityRole="button"
                    accessibilityLabel={cf === 'both' ? 'Wszystkie techniki' : cf === 'knitting' ? 'Tylko druty' : 'Tylko szydełko'}
                  >
                    <Text
                      style={[
                        styles.craftFilterText,
                        doctorCraftFilter === cf && styles.craftFilterTextActive,
                      ]}
                    >
                      {cf === 'both' ? 'Wszystkie' : cf === 'knitting' ? '🧶 Druty' : '🪢 Szydełko'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Lista procedur */}
              <View style={styles.emergencyList}>
                {diagnoseEmergency(doctorQuery, doctorCraftFilter).length === 0 ? (
                  <View style={styles.emptyDoctorBox}>
                    <Text style={styles.emptyDoctorText}>
                      Nie znaleziono pasującej procedury awaryjnej.
                    </Text>
                    <Text style={styles.emptyDoctorSubtext}>
                      Spróbuj wyszukać inne słowo kluczowe (np. "oczko", "pętla", "drabinka").
                    </Text>
                  </View>
                ) : (
                  diagnoseEmergency(doctorQuery, doctorCraftFilter).map((proc) => (
                    <TouchableOpacity
                      key={proc.id}
                      style={styles.emergencyCard}
                      onPress={() => setSelectedEmergency(proc)}
                      accessibilityRole="button"
                      accessibilityLabel={`Procedura: ${proc.title}`}
                    >
                      <View style={styles.emergencyCardHeader}>
                        <Text style={styles.emergencyTitle}>{proc.title}</Text>
                        <Text
                          style={[
                            styles.emergencyDangerBadge,
                            proc.dangerLevel === 'critical'
                              ? styles.dangerBadgeCritical
                              : proc.dangerLevel === 'moderate'
                              ? styles.dangerBadgeModerate
                              : styles.dangerBadgeLow,
                          ]}
                        >
                          {proc.dangerLevel === 'critical'
                            ? '🔴 Krytyczny'
                            : proc.dangerLevel === 'moderate'
                            ? '🟠 Umiarkowany'
                            : '🟡 Niski'}
                        </Text>
                      </View>
                      <Text style={styles.emergencySummary} numberOfLines={2}>
                        {proc.summary}
                      </Text>
                      <View style={styles.emergencySymptomsRow}>
                        {proc.symptoms.slice(0, 3).map((sym, sIdx) => (
                          <View key={sIdx} style={styles.symptomChip}>
                            <Text style={styles.symptomChipText}>{sym}</Text>
                          </View>
                        ))}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  segmentTextActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  chipsWrapper: {
    marginBottom: 8,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
  },
  chipActive: {
    backgroundColor: '#8B5E3C',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555555',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  abbrBadgePL: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  abbrBadgeEN: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EBE6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  abbrBadgeDE: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  abbrLabel: {
    fontSize: 10,
    color: '#777777',
    fontWeight: '600',
    marginRight: 3,
  },
  abbrValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  abbrValueDE: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444444',
  },
  glyphBadge: {
    backgroundColor: '#FAF5F0',
    borderWidth: 1,
    borderColor: '#EBDCD0',
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5E3C',
  },
  termTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  termTitleEN: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666666',
  },
  termDesc: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
  },
  trainerScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  exerciseChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  exerciseChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  exerciseChipActive: {
    backgroundColor: '#8B5E3C',
    borderColor: '#8B5E3C',
  },
  exerciseChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444444',
  },
  exerciseChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  trainerHeaderCard: {
    backgroundColor: '#FAF5F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE3DA',
  },
  trainerExerciseTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#8B5E3C',
    marginBottom: 4,
  },
  trainerExerciseDesc: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 8,
  },
  stitchesInfo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  trainerStationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statusMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rowBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2B2D42',
    backgroundColor: '#EDF2F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  repeatBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5E3C',
    backgroundColor: '#F7EFEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stepInstructionBox: {
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    backgroundColor: '#FCFCFC',
    marginBottom: 20,
  },
  stepGlyph: {
    fontSize: 32,
    color: '#8B5E3C',
    marginBottom: 8,
  },
  stepCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  stepCount: {
    fontSize: 12,
    color: '#888888',
  },
  stepButton: {
    backgroundColor: '#8B5E3C',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  stepButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resetButtonText: {
    fontSize: 13,
    color: '#888888',
  },
  completedBox: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#28A745',
    marginBottom: 6,
  },
  completedDesc: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Style klucza identyfikacji ściegów (DEC-16)
  identifierScrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  identifierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  identifierHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  identifierStepBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5E3C',
    backgroundColor: '#F5EDE4',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  identifierBackButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  identifierBackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  identifierTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  identifierSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    minHeight: 64,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionCardSelected: {
    borderColor: '#8B5E3C',
    backgroundColor: '#FDFBF9',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  optionBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5E3C',
    backgroundColor: '#F5EDE4',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  optionDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  identifierResetButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  identifierResetButtonText: {
    fontSize: 13,
    color: '#888888',
  },
  resultContainer: {
    gap: 12,
  },
  resultHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultCategoryBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A6073',
    backgroundColor: '#EBF4F6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  resultConfidenceBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#28A745',
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  resultTitlePl: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  resultTitleEn: {
    fontSize: 14,
    color: '#777777',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  resultDescription: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 21,
  },
  tipCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  tipHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#0C4A6E',
    lineHeight: 19,
  },
  adviceCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  adviceHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 19,
  },
  resultActions: {
    gap: 10,
    marginTop: 4,
  },
  actionPrimaryButton: {
    minHeight: 48,
    backgroundColor: '#8B5E3C',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  actionPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionSecondaryButton: {
    minHeight: 48,
    backgroundColor: '#3A6073',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  actionSecondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  restartIdentifierButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  restartIdentifierButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  // Style Doktora Błędów (BR-BIB-010..015)
  doctorScrollContent: {
    paddingBottom: 32,
  },
  doctorHomeContainer: {
    gap: 12,
  },
  doctorIntroCard: {
    backgroundColor: '#FDF2F8',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  doctorIntroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#9D174D',
    marginBottom: 4,
  },
  doctorIntroSubtitle: {
    fontSize: 13,
    color: '#831843',
    lineHeight: 18,
  },
  craftFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  craftFilterButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  craftFilterButtonActive: {
    backgroundColor: '#9D174D',
    borderColor: '#9D174D',
  },
  craftFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  craftFilterTextActive: {
    color: '#FFFFFF',
  },
  emergencyList: {
    gap: 10,
  },
  emptyDoctorBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyDoctorText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyDoctorSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  emergencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 44,
  },
  emergencyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  emergencyDangerBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  emergencySummary: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  emergencySymptomsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  symptomChipText: {
    fontSize: 11,
    color: '#64748B',
  },
  // Szczegóły procedury
  procedureDetailsContainer: {
    gap: 12,
  },
  doctorBackButton: {
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 2,
  },
  doctorBackButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9D174D',
  },
  procedureHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  procedureBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dangerBadgeCritical: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  dangerBadgeModerate: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
  dangerBadgeLow: {
    backgroundColor: '#FEF9C3',
    color: '#854D0E',
  },
  craftBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  procedureTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  procedureSummary: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 12,
  },
  toolsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  toolItemText: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 17,
  },
  stepsContainer: {
    gap: 8,
  },
  stepsSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9D174D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  stepInstructionText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  stepTipBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  stepTipText: {
    fontSize: 12,
    color: '#1E40AF',
    fontStyle: 'italic',
  },
  preventionCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  preventionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  preventionText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 18,
  },
  doneButton: {
    minHeight: 48,
    backgroundColor: '#9D174D',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

