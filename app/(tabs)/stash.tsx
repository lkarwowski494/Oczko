import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProject, ProjectContextValue } from '../../src/core/project-context';
import {
  StashYarnRecord,
  StashToolRecord,
  listStashYarns,
  listStashTools,
  insertStashYarn,
  insertStashTool,
  updateStashYarnRemaining,
  deleteStashYarn,
  deleteStashTool,
  seedDefaultStashIfEmpty,
  YarnWeightCategory,
  ToolType,
  ToolMaterial,
} from '../../src/core/stash-repository';
import {
  filterStashYarns,
  calculateStashMetrics,
  YARN_WEIGHT_STANDARDS,
  FIBER_FILTER_TAGS,
} from '../../src/core/stash-filter-service';
import YarnUsageEstimatorModal from '../../src/components/YarnUsageEstimatorModal';
import { NeedleGaugeModal } from '../../src/components/NeedleGaugeModal';
import { YarnSubstitutionModal } from '../../src/components/YarnSubstitutionModal';
import { useAppAccess } from '../../src/core/app-access-context';
import { ImpulsePaywallModal } from '../../src/components/ImpulsePaywallModal';
import { useLang, t } from '../../src/core/i18n';
import { useUnitSystem } from '../../src/core/use-unit-system';
import { formatWeight, formatLength, formatNeedleSize } from '../../src/core/unit-converter';
import { autoBackup } from '../../src/core/backup-service';

type StashTab = 'yarn' | 'tools';

const FALLBACK_YARNS: StashYarnRecord[] = [
  {
    id: 'yarn_1',
    brand: 'Drops',
    name: 'Nord',
    colorway: '03 Jasnoszary',
    dyeLot: '1240',
    weightCategory: 'Fingering',
    skeinsTotal: 4,
    skeinsRemaining: 4,
    weightGramsPerSkein: 50,
    lengthMetersPerSkein: 170,
    composition: '45% Alpaka, 30% Poliamid, 25% Wełna',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'yarn_2',
    brand: 'Sandnes Garn',
    name: 'Sunday',
    colorway: '2511 Almond',
    dyeLot: '8910',
    weightCategory: 'Fingering',
    skeinsTotal: 2,
    skeinsRemaining: 2,
    weightGramsPerSkein: 50,
    lengthMetersPerSkein: 235,
    composition: '100% Wełna Merino (non-superwash)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const FALLBACK_TOOLS: StashToolRecord[] = [
  {
    id: 'tool_1',
    name: 'KnitPro Zing 3.5 mm',
    sizeMm: 3.5,
    toolType: 'circular',
    material: 'metal',
    cableLengthCm: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tool_2',
    name: 'ChiaoGoo Red Lace 4.0 mm',
    sizeMm: 4.0,
    toolType: 'circular',
    material: 'metal',
    cableLengthCm: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function StashScreen() {
  let projectCtx: ProjectContextValue | null = null;
  try {
    projectCtx = useProject();
  } catch (_e) {
    projectCtx = null;
  }

  const db = projectCtx?.db;

  const [activeTab, setActiveTab] = useState<StashTab>('yarn');
  const [yarns, setYarns] = useState<StashYarnRecord[]>(FALLBACK_YARNS);
  const [tools, setTools] = useState<StashToolRecord[]>(FALLBACK_TOOLS);

  // Zaawansowane filtry i wyszukiwanie włóczek (BR-MAG-002, BR-MAG-003)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeight, setSelectedWeight] = useState<YarnWeightCategory | 'ALL'>('ALL');
  const [selectedFiberTag, setSelectedFiberTag] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Formularz dodawania
  const [modalVisible, setModalVisible] = useState(false);
  // Modal kalkulatora zużycia włóczki
  const [yarnEstimatorVisible, setYarnEstimatorVisible] = useState(false);
  // Modal miarki drutów i przelicznika jednostek
  const [needleGaugeVisible, setNeedleGaugeVisible] = useState(false);
  // Modal kalkulatora zamienników włóczki i WPI
  const [yarnSubstitutionVisible, setYarnSubstitutionVisible] = useState(false);

  // Pola dla włóczki
  const [yarnBrand, setYarnBrand] = useState('');
  const [yarnName, setYarnName] = useState('');
  const [yarnColorway, setYarnColorway] = useState('');
  const [yarnDyeLot, setYarnDyeLot] = useState('');
  const [yarnSkeins, setYarnSkeins] = useState('1');
  const [yarnComposition, setYarnComposition] = useState('');
  const [yarnWeightCategory, setYarnWeightCategory] = useState<YarnWeightCategory>('DK');
  const [yarnWeightGrams, setYarnWeightGrams] = useState('50');
  const [yarnLengthMeters, setYarnLengthMeters] = useState('170');

  // Pola dla narzędzia
  const [toolName, setToolName] = useState('');
  const [toolSizeMm, setToolSizeMm] = useState('4.0');
  const [toolType, setToolType] = useState<ToolType>('circular');
  const [toolMaterial, setToolMaterial] = useState<ToolMaterial>('metal');
  const [toolCableLength, setToolCableLength] = useState('80');

  const loadStashFromDb = useCallback(async () => {
    if (!db) return;
    try {
      await seedDefaultStashIfEmpty(db);
      const loadedYarns = await listStashYarns(db);
      const loadedTools = await listStashTools(db);
      if (loadedYarns.length > 0) setYarns(loadedYarns);
      if (loadedTools.length > 0) setTools(loadedTools);
    } catch (_e) {
      // obsługa błędów bazy
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      loadStashFromDb();
    }
  }, [db, loadStashFromDb]);

  // Przefiltrowana kolekcja włóczek (BR-MAG-003)
  const filteredYarns = useMemo(() => {
    return filterStashYarns(yarns, {
      query: searchQuery,
      weightCategory: selectedWeight,
      fiberTag: selectedFiberTag,
      inStockOnly,
    });
  }, [yarns, searchQuery, selectedWeight, selectedFiberTag, inStockOnly]);

  const { evaluation, openPaywall } = useAppAccess();
  const currentLang = useLang();
  const unitSystem = useUnitSystem();

  const stashMetrics = useMemo(() => {
    return calculateStashMetrics(filteredYarns);
  }, [filteredYarns]);

  const handleAddYarn = async () => {
    if (!yarnBrand.trim() || !yarnName.trim()) return;
    if (!evaluation.canCreateNewProject) {
      setModalVisible(false);
      openPaywall();
      return;
    }
    const skeins = parseFloat(yarnSkeins) || 1;
    const grams = parseFloat(yarnWeightGrams) || 50;
    const meters = parseFloat(yarnLengthMeters) || 170;
    const now = new Date().toISOString();

    const newYarn: StashYarnRecord = {
      id: `yarn_${Date.now()}`,
      brand: yarnBrand.trim(),
      name: yarnName.trim(),
      colorway: yarnColorway.trim() || 'Domyślny',
      dyeLot: yarnDyeLot.trim() || undefined,
      weightCategory: yarnWeightCategory,
      composition: yarnComposition.trim() || '100% Wełna',
      skeinsTotal: skeins,
      skeinsRemaining: skeins,
      weightGramsPerSkein: grams,
      lengthMetersPerSkein: meters,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await insertStashYarn(db, newYarn);
      await loadStashFromDb();
      autoBackup(db).catch(() => {});
    } else {
      setYarns((prev) => [newYarn, ...prev]);
    }

    setYarnBrand('');
    setYarnName('');
    setYarnColorway('');
    setYarnDyeLot('');
    setYarnSkeins('1');
    setYarnComposition('');
    setYarnWeightGrams('50');
    setYarnLengthMeters('170');
    setModalVisible(false);
  };

  const handleAddTool = async () => {
    if (!toolName.trim()) return;
    if (!evaluation.canCreateNewProject) {
      setModalVisible(false);
      openPaywall();
      return;
    }
    const size = parseFloat(toolSizeMm) || 4.0;
    const cable = parseInt(toolCableLength, 10);
    const now = new Date().toISOString();
    const newTool: StashToolRecord = {
      id: `tool_${Date.now()}`,
      name: toolName.trim(),
      toolType,
      sizeMm: size,
      material: toolMaterial,
      cableLengthCm: !isNaN(cable) && cable > 0 ? cable : undefined,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await insertStashTool(db, newTool);
      await loadStashFromDb();
      autoBackup(db).catch(() => {});
    } else {
      setTools((prev) => [newTool, ...prev]);
    }

    setToolName('');
    setModalVisible(false);
  };

  const handleUseSkein = async (yarn: StashYarnRecord) => {
    if (yarn.skeinsRemaining <= 0) return;
    const updated = Math.max(0, yarn.skeinsRemaining - 1);
    if (db) {
      await updateStashYarnRemaining(db, yarn.id, updated);
      await loadStashFromDb();
    } else {
      setYarns((prev) =>
        prev.map((y) => (y.id === yarn.id ? { ...y, skeinsRemaining: updated } : y))
      );
    }
  };

  const handleDeleteYarn = async (id: string) => {
    if (db) {
      await deleteStashYarn(db, id);
      await loadStashFromDb();
    } else {
      setYarns((prev) => prev.filter((y) => y.id !== id));
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (db) {
      await deleteStashTool(db, id);
      await loadStashFromDb();
    } else {
      setTools((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedWeight('ALL');
    setSelectedFiberTag('all');
    setInStockOnly(false);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Pasek statusu dostępu i monetyzacji impulsowej Apps4Brew */}
      <View style={styles.accessStatusBar}>
        {evaluation.isPremium ? (
          <Text style={styles.accessStatusTextPremium}>
            ✨ Apps4Brew Studio Pass: {evaluation.activePlan === 'lifetime' ? t('Lifetime (Na zawsze)') : t('Aktywny')}
          </Text>
        ) : evaluation.canCreateNewProject ? (
          <Text style={styles.accessStatusTextTrial}>
            ⏳ Trial: {t('Zostało')} {evaluation.trialDaysRemaining} {t('dni')} ({evaluation.trialProjectsRemaining} {t('wolne projekty')})
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.accessStatusBannerExpired}
            onPress={openPaywall}
            accessibilityRole="button"
            accessibilityLabel={t('Odblokuj pełny dostęp')}
          >
            <Text style={styles.accessStatusTextExpired}>
              🔒 {t('Historia: Tylko do odczytu • Odblokuj pełny dostęp ($4.99/rok)')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Przełącznik Włóczki / Narzędzia */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'yarn' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('yarn')}
        >
          <Text style={[styles.segmentText, activeTab === 'yarn' && styles.segmentTextActive]}>
            🧶 {t('Włóczki')} ({yarns.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'tools' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('tools')}
        >
          <Text style={[styles.segmentText, activeTab === 'tools' && styles.segmentTextActive]}>
            🪡 {t('Druty i szydełka')} ({tools.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topActionRow}>
        <Text style={styles.sectionTitle}>
          {activeTab === 'yarn' ? t('Twoje Zapasy Włóczek') : t('Twoje Narzędzia')}
        </Text>
        <View style={styles.topActionsGroup}>
          {activeTab === 'yarn' && (
            <>
              <TouchableOpacity
                style={styles.estimatorButton}
                activeOpacity={0.8}
                onPress={() => {
                  if (!evaluation.canCreateNewProject) {
                    openPaywall();
                  } else {
                    setYarnSubstitutionVisible(true);
                  }
                }}
                accessibilityLabel={t('Otwórz kalkulator zamienników włóczek i WPI')}
                accessibilityRole="button"
              >
                <Text style={styles.estimatorButtonText}>{t('🔄 Zamiennik')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.estimatorButton}
                activeOpacity={0.8}
                onPress={() => {
                  if (!evaluation.canCreateNewProject) {
                    openPaywall();
                  } else {
                    setYarnEstimatorVisible(true);
                  }
                }}
                accessibilityLabel={t('Otwórz kalkulator zużycia włóczki')}
                accessibilityRole="button"
              >
                <Text style={styles.estimatorButtonText}>{t('⚖️ Zużycie')}</Text>
              </TouchableOpacity>
            </>
          )}
          {activeTab === 'tools' && (
            <TouchableOpacity
              style={styles.estimatorButton}
              activeOpacity={0.8}
              onPress={() => {
                if (!evaluation.canCreateNewProject) {
                  openPaywall();
                } else {
                  setNeedleGaugeVisible(true);
                }
              }}
              accessibilityLabel={t('Otwórz miarkę drutów i przelicznik jednostek')}
              accessibilityRole="button"
            >
              <Text style={styles.estimatorButtonText}>{t('📏 Miarka drutów')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => {
              if (!evaluation.canCreateNewProject) {
                openPaywall();
                return;
              }
              setModalVisible(true);
            }}
          >
            <Text style={styles.addButtonText}>
              {activeTab === 'yarn' ? `+ ${t('Dodaj włóczkę')}` : `+ ${t('Dodaj druty')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pasek filtrów i wyszukiwarki włóczek (BR-MAG-002, BR-MAG-003) */}
      {activeTab === 'yarn' && (
        <View style={styles.filterSection}>
          {/* Pasek wyszukiwania tekstowego i po numerze lotu */}
          <View style={styles.searchBarRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('🔍 Szukaj marki, koloru, lotu (np. 1240)...')}
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => setSearchQuery('')}
                accessibilityLabel={t('Wyczyść wyszukiwanie')}
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Poziome chipsy grubości CYC (BR-MAG-002) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsScroll}
          >
            <TouchableOpacity
              style={[styles.filterChip, selectedWeight === 'ALL' && styles.filterChipActive]}
              onPress={() => setSelectedWeight('ALL')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedWeight === 'ALL' && styles.filterChipTextActive,
                ]}
              >
                {t('Wszystkie grubości')}
              </Text>
            </TouchableOpacity>
            {YARN_WEIGHT_STANDARDS.map((std) => (
              <TouchableOpacity
                key={std.category}
                style={[
                  styles.filterChip,
                  selectedWeight === std.category && styles.filterChipActive,
                ]}
                onPress={() => setSelectedWeight(std.category)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedWeight === std.category && styles.filterChipTextActive,
                  ]}
                >
                  {`${std.category} (${std.cycNumber})`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Poziome chipsy surowców oraz przełącznik dostępności */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fiberChipsScroll}
          >
            <TouchableOpacity
              style={[styles.stockToggleChip, inStockOnly && styles.stockToggleChipActive]}
              onPress={() => setInStockOnly((prev) => !prev)}
            >
              <Text
                style={[styles.stockToggleText, inStockOnly && styles.stockToggleTextActive]}
              >
                {inStockOnly ? t('✓ Tylko na stanie') : t('Wszystkie (w tym 0)')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fiberChip, selectedFiberTag === 'all' && styles.fiberChipActive]}
              onPress={() => setSelectedFiberTag('all')}
            >
              <Text
                style={[
                  styles.fiberChipText,
                  selectedFiberTag === 'all' && styles.fiberChipTextActive,
                ]}
              >
                {t('Wszystkie surowce')}
              </Text>
            </TouchableOpacity>

            {FIBER_FILTER_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[styles.fiberChip, selectedFiberTag === tag.id && styles.fiberChipActive]}
                onPress={() => setSelectedFiberTag(tag.id)}
              >
                <Text
                  style={[
                    styles.fiberChipText,
                    selectedFiberTag === tag.id && styles.fiberChipTextActive,
                  ]}
                >
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Podsumowanie przefiltrowanych zasobów */}
          <View style={styles.metricsSummaryBar}>
            <Text style={styles.metricsSummaryText}>
              {`${t('Znaleziono:')} ${stashMetrics.totalItems} ${t('poz.')} • ${stashMetrics.totalSkeins} ${t('motków')}`}
              {stashMetrics.totalGrams > 0 ? ` • ${formatWeight(stashMetrics.totalGrams, unitSystem)}` : ''}
              {stashMetrics.totalMeters > 0 ? ` • ${formatLength(stashMetrics.totalMeters, unitSystem)}` : ''}
            </Text>
          </View>
        </View>
      )}

      {activeTab === 'yarn' ? (
        <FlatList
          data={filteredYarns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>🧶</Text>
              <Text style={styles.emptyStateTitle}>{t('Brak pasujących włóczek')}</Text>
              <Text style={styles.emptyStateSubtitle}>
                {t('Żadna włóczka w Twoim magazynie nie spełnia wybranych kryteriów wyszukiwania lub filtrów.')}
              </Text>
              <TouchableOpacity style={styles.resetFiltersBtn} onPress={handleResetFilters}>
                <Text style={styles.resetFiltersBtnText}>{t('Resetuj wszystkie filtry')}</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const weightStd = YARN_WEIGHT_STANDARDS.find((s) => s.category === item.weightCategory);

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.itemTitle}>
                    {item.brand} {item.name}
                  </Text>
                  <View style={styles.badgeGroup}>
                    {weightStd && (
                      <View style={styles.cycBadge}>
                        <Text style={styles.cycBadgeText}>{`CYC ${weightStd.cycNumber}`}</Text>
                      </View>
                    )}
                    <Text style={styles.badge}>{item.weightCategory}</Text>
                  </View>
                </View>

                <Text style={styles.detailRow}>
                  {t('Kolor / Lot:')} <Text style={styles.detailBold}>{item.colorway}</Text>
                  {item.dyeLot ? ` (${t('Lot:')} ${item.dyeLot})` : ''}
                </Text>

                <Text style={styles.detailRow}>
                  {t('Pozostało motków:')}{' '}
                  <Text style={styles.detailBold}>
                    {item.skeinsRemaining} {t('z')} {item.skeinsTotal}
                  </Text>
                  {(item.weightGramsPerSkein || item.lengthMetersPerSkein) && (
                    <Text style={styles.specsText}>
                      {` • ${item.weightGramsPerSkein ? formatWeight(item.weightGramsPerSkein, unitSystem) : ''}${
                        item.lengthMetersPerSkein ? ' / ' + formatLength(item.lengthMetersPerSkein, unitSystem) : ''
                      }`}
                    </Text>
                  )}
                </Text>

                <Text style={styles.compositionText}>{item.composition}</Text>

                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.useButton}
                    onPress={() => handleUseSkein(item)}
                    disabled={item.skeinsRemaining <= 0}
                  >
                    <Text style={styles.useButtonText}>{t('Zużyj 1 motek (-1)')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteYarn(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>{t('Usuń')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={tools}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.sizeBadge}>{formatNeedleSize(item.sizeMm, unitSystem)}</Text>
              </View>
              <Text style={styles.detailRow}>
                {t('Typ:')} <Text style={styles.detailBold}>{item.toolType}</Text>
              </Text>
              <Text style={styles.detailRow}>
                {t('Materiał:')} <Text style={styles.detailBold}>{item.material}</Text>
              </Text>
              {item.cableLengthCm && (
                <Text style={styles.detailRow}>
                  {t('Długość żyłki:')}{' '}
                  <Text style={styles.detailBold}>
                    {unitSystem === 'imperial'
                      ? `${Math.round(item.cableLengthCm / 2.54)} in (${item.cableLengthCm} cm)`
                      : `${item.cableLengthCm} cm`}
                  </Text>
                </Text>
              )}

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTool(item.id)}
                >
                  <Text style={styles.deleteButtonText}>{t('Usuń z magazynu')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal dodawania do magazynu */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {activeTab === 'yarn' ? t('Dodaj włóczkę do schowka') : t('Dodaj druty / szydełko')}
            </Text>

            <ScrollView>
              {activeTab === 'yarn' ? (
                <>
                  <Text style={styles.inputLabel}>{t('Marka')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('np. Drops / Sandnes Garn')}
                    placeholderTextColor="#999999"
                    value={yarnBrand}
                    onChangeText={setYarnBrand}
                  />

                  <Text style={styles.inputLabel}>{t('Nazwa włóczki')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('np. Air / Sunday / Merino')}
                    placeholderTextColor="#999999"
                    value={yarnName}
                    onChangeText={setYarnName}
                  />

                  <View style={styles.twoColumnRow}>
                    <View style={styles.columnHalf}>
                      <Text style={styles.inputLabel}>{t('Kolorystyka (Colorway)')}</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('np. 01 Biały')}
                        placeholderTextColor="#999999"
                        value={yarnColorway}
                        onChangeText={setYarnColorway}
                      />
                    </View>
                    <View style={styles.columnHalf}>
                      <Text style={styles.inputLabel}>{t('Numer partii / lotu (Dye Lot)')}</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('np. 1240')}
                        placeholderTextColor="#999999"
                        value={yarnDyeLot}
                        onChangeText={setYarnDyeLot}
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>{t('Grubość przędzy (CYC)')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weightSelectorScroll}>
                    {YARN_WEIGHT_STANDARDS.map((std) => (
                      <TouchableOpacity
                        key={std.category}
                        style={[
                          styles.weightSelectChip,
                          yarnWeightCategory === std.category && styles.weightSelectChipActive,
                        ]}
                        onPress={() => setYarnWeightCategory(std.category)}
                      >
                        <Text
                          style={[
                            styles.weightSelectChipText,
                            yarnWeightCategory === std.category && styles.weightSelectChipTextActive,
                          ]}
                        >
                          {`${std.category} (${std.cycNumber})`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.twoColumnRow}>
                    <View style={styles.columnHalf}>
                      <Text style={styles.inputLabel}>{t('Liczba zakupionych motków')}</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('np. 4')}
                        placeholderTextColor="#999999"
                        keyboardType="numeric"
                        value={yarnSkeins}
                        onChangeText={setYarnSkeins}
                      />
                    </View>
                    <View style={styles.columnHalf}>
                      <Text style={styles.inputLabel}>{t('Waga motka')}</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="50"
                        placeholderTextColor="#999999"
                        keyboardType="numeric"
                        value={yarnWeightGrams}
                        onChangeText={setYarnWeightGrams}
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>{t('Długość motka')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. 175"
                    placeholderTextColor="#999999"
                    keyboardType="numeric"
                    value={yarnLengthMeters}
                    onChangeText={setYarnLengthMeters}
                  />

                  <Text style={styles.inputLabel}>{t('Skład surowcowy (np. 100% Wełna)')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('np. 100% Wełna Merino')}
                    placeholderTextColor="#999999"
                    value={yarnComposition}
                    onChangeText={setYarnComposition}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>{t('Nazwa narzędzia')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('np. KnitPro Zing na żyłce')}
                    placeholderTextColor="#999999"
                    value={toolName}
                    onChangeText={setToolName}
                  />

                  <Text style={styles.inputLabel}>{t('Rozmiar')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. 4.0"
                    placeholderTextColor="#999999"
                    keyboardType="numeric"
                    value={toolSizeMm}
                    onChangeText={setToolSizeMm}
                  />

                  <Text style={styles.inputLabel}>{t('Długość żyłki (opcjonalnie)')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="np. 80"
                    placeholderTextColor="#999999"
                    keyboardType="numeric"
                    value={toolCableLength}
                    onChangeText={setToolCableLength}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel={t('Anuluj')}
              >
                <Text style={styles.cancelButtonText}>{t('Anuluj')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={activeTab === 'yarn' ? handleAddYarn : handleAddTool}
              >
                <Text style={styles.submitButtonText}>
                  {t('Zapisz w magazynie')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal kalkulatora zużycia włóczki i Yarn Chicken */}
      <YarnUsageEstimatorModal
        visible={yarnEstimatorVisible}
        onClose={() => setYarnEstimatorVisible(false)}
        availableYarns={yarns}
      />

      {/* Modal kalkulatora rozmiarów drutów i jednostek */}
      <NeedleGaugeModal
        visible={needleGaugeVisible}
        onClose={() => setNeedleGaugeVisible(false)}
      />

      {/* Modal kalkulatora zamienników włóczki i WPI */}
      <YarnSubstitutionModal
        visible={yarnSubstitutionVisible}
        onClose={() => setYarnSubstitutionVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  accessStatusBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  accessStatusTextPremium: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E24AA',
  },
  accessStatusTextTrial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  accessStatusBannerExpired: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  accessStatusTextExpired: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C62828',
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
    fontWeight: '600',
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  topActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  estimatorButton: {
    backgroundColor: '#F0ECE8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8C8BE',
  },
  estimatorButtonText: {
    color: '#8B5E3C',
    fontWeight: '700',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 38,
    fontSize: 13,
    color: '#1A1A1A',
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '700',
  },
  filterChipsScroll: {
    gap: 6,
    paddingVertical: 3,
    marginBottom: 6,
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F0ECE8',
  },
  filterChipActive: {
    backgroundColor: '#8B5E3C',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fiberChipsScroll: {
    gap: 6,
    paddingVertical: 3,
    marginBottom: 6,
  },
  stockToggleChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EBE7E2',
    borderWidth: 1,
    borderColor: '#D4CDC5',
  },
  stockToggleChipActive: {
    backgroundColor: '#4A6B53',
    borderColor: '#4A6B53',
  },
  stockToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
  },
  stockToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fiberChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FAF7F4',
    borderWidth: 1,
    borderColor: '#EAE5DF',
  },
  fiberChipActive: {
    backgroundColor: '#B85D19',
    borderColor: '#B85D19',
  },
  fiberChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666666',
  },
  fiberChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metricsSummaryBar: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F2EE',
  },
  metricsSummaryText: {
    fontSize: 11,
    color: '#8A8684',
    fontWeight: '600',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cycBadge: {
    backgroundColor: '#EBE4DC',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cycBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#634832',
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5E3C',
    backgroundColor: '#F7EFEA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sizeBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B2D42',
    backgroundColor: '#EDF2F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailRow: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  detailBold: {
    color: '#222222',
    fontWeight: '500',
  },
  specsText: {
    fontSize: 12,
    color: '#777777',
    fontWeight: '400',
  },
  compositionText: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 10,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
    marginTop: 6,
  },
  useButton: {
    backgroundColor: '#FAF5F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  useButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#DC3545',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 10,
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2A29',
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetFiltersBtn: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resetFiltersBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 4,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FCFCFC',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  columnHalf: {
    flex: 1,
  },
  weightSelectorScroll: {
    gap: 6,
    marginVertical: 4,
  },
  weightSelectChip: {
    backgroundColor: '#F0ECE8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 6,
  },
  weightSelectChipActive: {
    backgroundColor: '#8B5E3C',
  },
  weightSelectChipText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '500',
  },
  weightSelectChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 14,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#666666',
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#8B5E3C',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
