import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TermItem {
  id: string;
  abbreviationPL: string;
  abbreviationEN: string;
  namePL: string;
  nameEN: string;
  description: string;
}

const GLOSSARY_DATA: TermItem[] = [
  {
    id: 't_1',
    abbreviationPL: 'o.p.',
    abbreviationEN: 'k',
    namePL: 'Oczko prawe',
    nameEN: 'Knit stitch',
    description: 'Podstawowe oczko ściegu dżersejowego. Wbicie drutu od lewej do prawej.',
  },
  {
    id: 't_2',
    abbreviationPL: 'o.l.',
    abbreviationEN: 'p',
    namePL: 'Oczko lewe',
    nameEN: 'Purl stitch',
    description: 'Włóczka przed robotą, wbicie drutu od prawej do lewej z góry.',
  },
  {
    id: 't_3',
    abbreviationPL: 'narz.',
    abbreviationEN: 'yo',
    namePL: 'Narzut',
    nameEN: 'Yarn over',
    description: 'Owinięcie nitki wokół drutu, tworzy ażurową dziurkę i dodaje jedno oczko.',
  },
  {
    id: 't_4',
    abbreviationPL: '2orazem',
    abbreviationEN: 'k2tog',
    namePL: 'Dwa oczka razem na prawo',
    nameEN: 'Knit 2 together',
    description: 'Redukcja 1 oczka pochylona w prawo (/): przerobienie dwóch oczek jednocześnie.',
  },
  {
    id: 't_5',
    abbreviationPL: 'ssk',
    abbreviationEN: 'ssk',
    namePL: 'Przełóż, przełóż, przerób razem',
    nameEN: 'Slip, slip, knit',
    description: 'Redukcja 1 oczka pochylona w lewo (\\): przełóż 2 oczka jak na prawo i przerób od tyłu.',
  },
  {
    id: 't_6',
    abbreviationPL: 'm1l / m1r',
    abbreviationEN: 'M1L / M1R',
    namePL: 'Dodanie oczka z poprzeczki',
    nameEN: 'Make one left / right',
    description: 'Niewidoczne dodawanie oczka z nitki poprzecznej między oczkami.',
  },
];

export default function LearnScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTerms = GLOSSARY_DATA.filter((term) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      term.abbreviationPL.toLowerCase().includes(q) ||
      term.abbreviationEN.toLowerCase().includes(q) ||
      term.namePL.toLowerCase().includes(q) ||
      term.nameEN.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj skrótu lub techniki (np. k2tog, narz)..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filteredTerms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.trainerBanner}>
            <Text style={styles.trainerTitle}>📖 Słownik dziewiarski (PL ↔ EN)</Text>
            <Text style={styles.trainerSubtitle}>
              Tłumacz wzorów angielskich i polskich z precyzyjnymi opisami wykonań.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.badgeRow}>
              <View style={styles.abbrBadgePL}>
                <Text style={styles.abbrLabel}>PL:</Text>
                <Text style={styles.abbrValue}>{item.abbreviationPL}</Text>
              </View>
              <View style={styles.abbrBadgeEN}>
                <Text style={styles.abbrLabel}>EN:</Text>
                <Text style={styles.abbrValue}>{item.abbreviationEN}</Text>
              </View>
            </View>

            <Text style={styles.termTitle}>
              {item.namePL} <Text style={styles.termTitleEN}>({item.nameEN})</Text>
            </Text>
            <Text style={styles.termDesc}>{item.description}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  trainerBanner: {
    backgroundColor: '#FAF5F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE3DA',
  },
  trainerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5E3C',
    marginBottom: 4,
  },
  trainerSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
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
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  abbrBadgePL: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  abbrBadgeEN: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EBE6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  abbrLabel: {
    fontSize: 11,
    color: '#777777',
    fontWeight: '600',
    marginRight: 4,
  },
  abbrValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  termTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  termTitleEN: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
  },
  termDesc: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 19,
  },
});
