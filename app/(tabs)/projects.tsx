import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProjectItem {
  id: string;
  name: string;
  category: 'sweter' | 'czapka' | 'szal' | 'inne';
  partsCount: number;
  activePartName: string;
  currentRow: number;
  targetRow?: number;
  lastUpdated: string;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_1',
    name: 'Mój Sweter Raglanowy',
    category: 'sweter',
    partsCount: 4,
    activePartName: 'Korpus',
    currentRow: 42,
    targetRow: 120,
    lastUpdated: 'Dzisiaj, 11:30',
  },
  {
    id: 'proj_2',
    name: 'Czapka Wełniana',
    category: 'czapka',
    partsCount: 1,
    activePartName: 'Ściągacz',
    currentRow: 18,
    targetRow: 60,
    lastUpdated: 'Wczoraj',
  },
];

export default function ProjectsScreen() {
  const [projects] = useState<ProjectItem[]>(INITIAL_PROJECTS);

  const renderProjectItem = ({ item }: { item: ProjectItem }) => {
    const progressPercent = item.targetRow
      ? Math.min(100, Math.round((item.currentRow / item.targetRow) * 100))
      : null;

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <Text style={styles.projectName}>{item.name}</Text>
          <Text style={styles.categoryBadge}>{item.category.toUpperCase()}</Text>
        </View>

        <Text style={styles.partInfo}>
          Część: <Text style={styles.partName}>{item.activePartName}</Text> ({item.partsCount} części ogółem)
        </Text>

        <View style={styles.progressRow}>
          <Text style={styles.rowNumbers}>
            Rząd: <Text style={styles.rowHighlight}>{item.currentRow}</Text>
            {item.targetRow ? ` / ${item.targetRow}` : ''}
          </Text>
          {progressPercent !== null && (
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          )}
        </View>

        {progressPercent !== null && (
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        )}

        <Text style={styles.timestamp}>Edytowano: {item.lastUpdated}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>Twoje Robótki</Text>
        <TouchableOpacity style={styles.newButton} activeOpacity={0.8}>
          <Text style={styles.newButtonText}>+ Nowy projekt</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProjectItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Brak projektów. Rozpocznij dodając pierwszy projekt!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  newButton: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5E3C',
    backgroundColor: '#F5EBE6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  partInfo: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 10,
  },
  partName: {
    color: '#1A1A1A',
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowNumbers: {
    fontSize: 14,
    color: '#444444',
  },
  rowHighlight: {
    fontWeight: '700',
    color: '#1A1A1A',
    fontSize: 16,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#EAEAEA',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5E3C',
    borderRadius: 3,
  },
  timestamp: {
    fontSize: 11,
    color: '#999999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888888',
    textAlign: 'center',
    fontSize: 15,
  },
});
