/**
 * Custom Categories Screen - Add, edit, and delete custom word categories
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Category } from '@/data/game-data';
import { useCustomCategories } from '@/hooks/use-custom-categories';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export default function CategoriesScreen() {
  const tint = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const { customCategories, addCategory, updateCategory, removeCategory, isLoading } = useCustomCategories();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [wordsText, setWordsText] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.name);
      setWordsText(editingCategory.words.join('\n'));
    } else {
      setCategoryName('');
      setWordsText('');
    }
  }, [editingCategory]);

  const handleSave = async () => {
    const name = categoryName.trim();
    const words = wordsText
      .split('\n')
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (!name) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (words.length < 5) {
      Alert.alert('Error', 'Please enter at least 5 words (one per line)');
      return;
    }

    if (editingCategory) {
      await updateCategory(editingCategory.id, { name, words });
    } else {
      await addCategory(name, words);
    }

    setShowModal(false);
    setEditingCategory(null);
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeCategory(category.id),
        },
      ]
    );
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.title}>✨ Custom Categories</ThemedText>
        <ThemedText style={styles.subtitle}>
          Create your own word categories for the game
        </ThemedText>

        {customCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyEmoji}>📝</ThemedText>
            <ThemedText style={styles.emptyText}>
              No custom categories yet.{'\n'}Tap the button below to create one!
            </ThemedText>
          </View>
        ) : (
          <View style={styles.categoriesList}>
            {customCategories.map((category) => (
              <View
                key={category.id}
                style={[styles.categoryItem, { borderColor: tint }]}
              >
                <View style={styles.categoryInfo}>
                  <ThemedText style={styles.categoryName}>
                    {category.icon} {category.name}
                  </ThemedText>
                  <ThemedText style={styles.wordCount}>
                    {category.words.length} words
                  </ThemedText>
                </View>
                <View style={styles.categoryActions}>
                  <Pressable
                    style={[styles.actionButton, { borderColor: tint }]}
                    onPress={() => openEditModal(category)}
                  >
                    <ThemedText style={[styles.actionText, { color: tint }]}>Edit</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, { borderColor: '#e74c3c' }]}
                    onPress={() => handleDelete(category)}
                  >
                    <ThemedText style={[styles.actionText, { color: '#e74c3c' }]}>Delete</ThemedText>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.addButton, { backgroundColor: tint }]}
          onPress={openAddModal}
        >
          <ThemedText style={styles.addButtonText} lightColor="#fff" darkColor="#fff">
            + Add New Category
          </ThemedText>
        </Pressable>
      </View>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, { backgroundColor }]}>
            <ThemedText style={styles.modalTitle}>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </ThemedText>

            <ThemedText style={styles.inputLabel}>Category Name</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: tint }]}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="e.g., TV Shows"
              placeholderTextColor="rgba(128,128,128,0.5)"
            />

            <ThemedText style={styles.inputLabel}>Words (one per line, minimum 5)</ThemedText>
            <TextInput
              style={[styles.textArea, { color: textColor, borderColor: tint }]}
              value={wordsText}
              onChangeText={setWordsText}
              placeholder={"Breaking Bad\nFriends\nThe Office\nGame of Thrones\nStranger Things"}
              placeholderTextColor="rgba(128,128,128,0.5)"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: tint }]}
                onPress={handleSave}
              >
                <ThemedText style={styles.saveButtonText} lightColor="#fff" darkColor="#fff">
                  Save
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 24,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  categoryInfo: {
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  wordCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
  },
  addButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.7,
  },
  input: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
    height: 160,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(128,128,128,0.2)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
