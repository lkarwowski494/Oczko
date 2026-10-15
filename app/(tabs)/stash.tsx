import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type StashTab = 'yarn' | 'tools';

interface YarnItem {
  id: string;
  brand: string;
  name: string;
  colorway: string;
  weightCategory: 'Fingering' | 'DK' | 'Worsted' | 'Bulky';
  skeins: number;
  weightGrams: number;
  composition: string;
}

interface ToolItem {
  id: string;
  name: string;
  sizeMm: number;
  type: 'Na żyłce (okrągłe)' | 'Proste' | 'Pończosznicze (DPN)' | 'Szydełko';
  material: 'Bambus' | 'Metal' | 'Drewno';
  cableLengthCm?: number;
}

const INITIAL_YARNS: YarnItem[] = [
  {
    id: 'yarn_1',
    brand: 'Drops',
    name: 'Nord',
    colorway: '03 Jasnoszary',
    weightCategory: 'Fingering',
    skeins: 4,
    weightGrams: 200,
    composition: '45% Alpaka, 30% Poliamid, 25% Wełna',
  },
  {
    id: 'yarn_2',
    brand: 'Sandnes Garn',
    name: 'Sunday',
    colorway: '2511 Almond',
    weightCategory: 'Fingering',
    skeins: 2,
    weightGrams: 100,
    composition: '100% Wełna Merino (non-superwash)',
  },
];

const INITIAL_TOOLS: ToolItem[] = [
  {
    id: 'tool_1',
    name: 'KnitPro Zing',
    sizeMm: 3.5,
    type: 'Na żyłce (okrągłe)',
    material: 'Metal',
    cableLengthCm: 80,
  },
  {
    id: 'tool_2',
    name: 'ChiaoGoo Red Lace',
    sizeMm: 4.0,
    type: 'Na żyłce (okrągłe)',
    material: 'Metal',
    cableLengthCm: 100,
  },
  {
    id: 'tool_3',
    name: 'Clover Amour',
    sizeMm: 3.0,
    type: 'Szydełko',
    material: 'Metal',
  },
];

export default function StashScreen() {
  const [activeTab, setActiveTab] = useState<StashTab>('yarn');
  const [yarns] = useState<YarnItem[]>(INITIAL_YARNS);
  const [tools] = useState<ToolItem[]>(INITIAL_TOOLS);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Przełącznik Włóczki / Narzędzia */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'yarn' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('yarn')}
        >
          <Text style={[styles.segmentText, activeTab === 'yarn' && styles.segmentTextActive]}>
            🧶 Włóczki ({yarns.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'tools' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('tools')}
        >
          <Text style={[styles.segmentText, activeTab === 'tools' && styles.segmentTextActive]}>
            🪡 Druty i szydełka ({tools.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'yarn' ? (
        <FlatList
          data={yarns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.itemTitle}>{item.brand} {item.name}</Text>
                <Text style={styles.badge}>{item.weightCategory}</Text>
              </View>
              <Text style={styles.detailRow}>Kolor / Lot: <Text style={styles.detailBold}>{item.colorway}</Text></Text>
              <Text style={styles.detailRow}>Ilość: <Text style={styles.detailBold}>{item.skeins} motki ({item.weightGrams}g)</Text></Text>
              <Text style={styles.compositionText}>{item.composition}</Text>
            </View>
          )}
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
                <Text style={styles.sizeBadge}>{item.sizeMm} mm</Text>
              </View>
              <Text style={styles.detailRow}>Typ: <Text style={styles.detailBold}>{item.type}</Text></Text>
              <Text style={styles.detailRow}>Materiał: <Text style={styles.detailBold}>{item.material}</Text></Text>
              {item.cableLengthCm && (
                <Text style={styles.detailRow}>Żyłka: <Text style={styles.detailBold}>{item.cableLengthCm} cm</Text></Text>
              )}
            </View>
          )}
        />
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
  compositionText: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
