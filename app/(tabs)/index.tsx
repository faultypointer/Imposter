/**
 * Lobby Screen - Manage players and settings
 */

import { CategoryCard } from '@/components/category-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGame } from '@/contexts/game-context';
import { PREDEFINED_CATEGORIES } from '@/data/game-data';
import { useCustomCategories } from '@/hooks/use-custom-categories';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

export default function LobbyScreen() {
  const tint = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  const {
    players,
    addPlayer,
    removePlayer,
    updatePlayerName,
    selectedCategories,
    toggleCategory,
    randomizeStartingPlayer,
    setRandomizeStartingPlayer,
    startGame,
  } = useGame();

  const { customCategories } = useCustomCategories();
  const allCategories = [...PREDEFINED_CATEGORIES, ...customCategories];

  const handleStartGame = () => {
    if (selectedCategories.length === 0) return;
    startGame();
    router.push('/reveal');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>🕵️ Game Lobby</ThemedText>
          <ThemedText style={styles.subtitle}>
            Setup players and categories
          </ThemedText>
        </View>

        {/* Player List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Players ({players.length})</ThemedText>
            {players.length < 12 && (
              <Pressable onPress={() => addPlayer('')} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color={tint} />
                <ThemedText style={[styles.addButtonText, { color: tint }]}>Add</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.playerList}>
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerRow}>
                <View style={styles.playerAvatar}>
                  <ThemedText style={styles.avatarText}>
                    {player.name.charAt(0).toUpperCase() || '?'}
                  </ThemedText>
                </View>
                <TextInput
                  style={[styles.nameInput, { color: textColor }]}
                  value={player.name}
                  onChangeText={(text) => updatePlayerName(player.id, text)}
                  placeholder={`Player ${index + 1}`}
                  placeholderTextColor={iconColor}
                />
                {players.length > 3 && (
                  <Pressable onPress={() => removePlayer(player.id)} style={styles.removeButton}>
                    <Ionicons name="close-circle-outline" size={22} color="#ff4444" />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
          <View style={[styles.settingRow, { borderColor: 'rgba(128,128,128,0.2)' }]}>
            <ThemedText style={styles.settingLabel}>Randomize Starting Player</ThemedText>
            <Switch
              value={randomizeStartingPlayer}
              onValueChange={setRandomizeStartingPlayer}
              trackColor={{ false: '#767577', true: tint }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
            {selectedCategories.length > 0 && (
              <View style={[styles.selectionBadge, { backgroundColor: tint }]}>
                <ThemedText style={styles.selectionBadgeText} lightColor="#fff" darkColor="#fff">
                  {selectedCategories.length} selected
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.categoryGrid}>
            {allCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategories.some(c => c.id === category.id)}
                onPress={toggleCategory}
              />
            ))}
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Start Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.startButton,
            { backgroundColor: tint },
            selectedCategories.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleStartGame}
          disabled={selectedCategories.length === 0}
        >
          <ThemedText style={styles.startButtonText} lightColor="#fff" darkColor="#fff">
            Start Game
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerList: {
    gap: 12,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(150,150,150,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
  },
  startButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

