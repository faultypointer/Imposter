/**
 * Category Card - Displays a selectable category with icon and word count
 */

import { ThemedText } from '@/components/themed-text';
import type { Category } from '@/data/game-data';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Pressable, StyleSheet, View } from 'react-native';

interface CategoryCardProps {
    category: Category;
    isSelected: boolean;
    onPress: (category: Category) => void;
}

export function CategoryCard({ category, isSelected, onPress }: CategoryCardProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tint = useThemeColor({}, 'tint');

    return (
        <Pressable
            style={[
                styles.card,
                {
                    backgroundColor: isSelected ? tint : backgroundColor,
                    borderColor: isSelected ? tint : 'rgba(128,128,128,0.3)',
                    shadowColor: isSelected ? tint : '#000',
                    shadowOpacity: isSelected ? 0.3 : 0.08,
                },
            ]}
            onPress={() => onPress(category)}
        >
            {/* Selection checkmark */}
            {isSelected && (
                <View style={styles.checkBadge}>
                    <ThemedText style={styles.checkIcon} lightColor="#fff" darkColor="#fff">
                        ✓
                    </ThemedText>
                </View>
            )}
            <ThemedText
                style={styles.icon}
                lightColor={isSelected ? '#fff' : undefined}
                darkColor={isSelected ? '#fff' : undefined}
            >
                {category.icon}
            </ThemedText>
            <ThemedText
                style={styles.name}
                lightColor={isSelected ? '#fff' : undefined}
                darkColor={isSelected ? '#fff' : undefined}
            >
                {category.name}
            </ThemedText>
            <ThemedText
                style={styles.count}
                lightColor={isSelected ? 'rgba(255,255,255,0.8)' : undefined}
                darkColor={isSelected ? 'rgba(255,255,255,0.8)' : undefined}
            >
                {category.words.length} words
            </ThemedText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '47%',
        paddingVertical: 20,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        marginBottom: 14,
        position: 'relative',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    checkBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkIcon: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    icon: {
        fontSize: 36,
        marginBottom: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    count: {
        fontSize: 13,
        marginTop: 6,
        opacity: 0.7,
    },
});
