/**
 * Game Settings Screen - Configure imposter modes and game options
 */

import { Layout } from '@/constants/theme';
import { ImposterWordMode, useGame } from '@/contexts/game-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Divider,
    IconButton,
    List,
    RadioButton,
    Surface,
    Switch,
    Text,
    useTheme
} from 'react-native-paper';

export default function SettingsScreen() {
    const theme = useTheme();
    const {
        imposterCount,
        imposterWordMode,
        randomizeStartingPlayer,
        isVotingEnabled,
        players,
        setImposterCount,
        setImposterWordMode,
        setRandomizeStartingPlayer,
        setVotingEnabled,
    } = useGame();

    const maxImposters = Math.max(1, Math.floor(players.length / 3));

    const handleWordModeChange = (value: string) => {
        setImposterWordMode(value as ImposterWordMode);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
                        Settings
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, opacity: 0.8 }}>
                        Configure your match experience
                    </Text>
                </View>
                {/* Imposter Word Mode Section */}
                <List.Section>
                    <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold', letterSpacing: 0.5 }}>MATCH MODE</List.Subheader>
                    <Surface style={{ borderRadius: 28, backgroundColor: theme.colors.surfaceVariant, overflow: 'hidden', marginTop: 8, padding: 10 }}>
                        <RadioButton.Group
                            onValueChange={(val) => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                handleWordModeChange(val);
                            }}
                            value={imposterWordMode}
                        >
                            <List.Item
                                title="Hidden Imposter"
                                titleStyle={{ fontWeight: '600' }}
                                description="Imposter gets a different word and doesn't know they are the imposter"
                                left={props => (
                                    <View style={{ justifyContent: 'center' }}>
                                        <List.Icon {...props} icon="incognito" />
                                    </View>
                                )}
                                right={() => (
                                    <View style={{ justifyContent: 'center' }}>
                                        <RadioButton value="hidden" />
                                    </View>
                                )}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    handleWordModeChange('hidden');
                                }}
                            />
                            <Divider horizontalInset />
                            <List.Item
                                title="No Hints"
                                titleStyle={{ fontWeight: '600' }}
                                description="Imposter knows they are the imposter but gets no hint"
                                left={props => (
                                    <View style={{ justifyContent: 'center' }}>
                                        <List.Icon {...props} icon="eye-off-outline" />
                                    </View>
                                )}
                                right={() => (
                                    <View style={{ justifyContent: 'center' }}>
                                        <RadioButton value="no_hint" />
                                    </View>
                                )}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    handleWordModeChange('no_hint');
                                }}
                            />
                            <Divider horizontalInset />
                            <List.Item
                                title="With Hint"
                                titleStyle={{ fontWeight: '600' }}
                                description="Imposter knows they are the imposter and sees the category as a hint"
                                left={props => (
                                    <View style={{ justifyContent: 'center' }}>
                                        <List.Icon {...props} icon="lightbulb-outline" />
                                    </View>
                                )}
                                right={() => (
                                    <View style={{ justifyContent: 'center' }}>
                                        <RadioButton value="category_hint" />
                                    </View>
                                )}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    handleWordModeChange('category_hint');
                                }}
                            />
                            <Divider horizontalInset />
                            <List.Item
                                title="From Players"
                                titleStyle={{ fontWeight: '600' }}
                                description="Imposter knows they are the imposter and sees a random hint from other players"
                                left={props => (
                                    <View style={{ justifyContent: 'center' }}>
                                        <List.Icon {...props} icon="account-group-outline" />
                                    </View>
                                )}
                                right={() => (
                                    <View style={{ justifyContent: 'center' }}>
                                        <RadioButton value="user_hint" />
                                    </View>
                                )}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    handleWordModeChange('user_hint');
                                }}
                            />
                        </RadioButton.Group>
                    </Surface>
                </List.Section>

                <Divider style={styles.sectionDivider} />

                {/* Number of Imposters */}
                <List.Section>
                    <List.Subheader>Number of Imposters</List.Subheader>
                    <View style={styles.imposterCountRow}>
                        <IconButton
                            icon="minus"
                            mode="contained-tonal"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setImposterCount(imposterCount - 1);
                            }}
                            disabled={imposterCount <= 1}
                        />
                        <View style={styles.countDisplay}>
                            <Text variant="displayLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{imposterCount}</Text>
                            <Text
                                variant="labelLarge"
                                style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}
                            >
                                {imposterCount === 1 ? 'IMPOSTER' : 'IMPOSTERS'}
                            </Text>
                        </View>
                        <IconButton
                            icon="plus"
                            mode="contained-tonal"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setImposterCount(imposterCount + 1);
                            }}
                            disabled={imposterCount >= maxImposters}
                        />
                    </View>
                    <Text
                        variant="bodySmall"
                        style={[styles.helperText, { color: theme.colors.onSurfaceVariant, opacity: 0.7 }]}
                    >
                        Maximum {maxImposters} for {players.length} players
                    </Text>
                </List.Section>

                <Divider style={styles.sectionDivider} />

                {/* Other Settings */}
                <List.Section>
                    <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold', letterSpacing: 0.5 }}>MATCH OPTIONS</List.Subheader>
                    <Surface style={{ borderRadius: 28, backgroundColor: theme.colors.surfaceVariant, overflow: 'hidden', marginTop: 8, padding: 10 }}>
                        <List.Item
                            title="Randomize Starting Player"
                            description="Randomly pick who speaks first each round"
                            titleStyle={{ fontWeight: '600' }}
                            left={props => (
                                <View style={{ justifyContent: 'center' }}>
                                    <List.Icon {...props} icon="shuffle" />
                                </View>
                            )}
                            right={() => (
                                <Switch
                                    value={randomizeStartingPlayer}
                                    onValueChange={(val) => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setRandomizeStartingPlayer(val);
                                    }}
                                />
                            )}
                        />
                        <Divider horizontalInset />
                        <List.Item
                            title="Enable Voting"
                            description="Allow players to vote for the imposter"
                            titleStyle={{ fontWeight: '600' }}
                            left={props => (
                                <View style={{ justifyContent: 'center' }}>
                                    <List.Icon {...props} icon="vote" />
                                </View>
                            )}
                            right={() => (
                                <Switch
                                    value={isVotingEnabled}
                                    onValueChange={(val) => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setVotingEnabled(val);
                                    }}
                                />
                            )}
                        />
                    </Surface>
                </List.Section>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Done Button */}
            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={() => router.back()}
                    style={styles.doneButton}
                    contentStyle={styles.doneButtonContent}
                    labelStyle={styles.doneButtonLabel}
                    icon="check"
                >
                    Done
                </Button>
            </View>
        </View>
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
        marginBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    closeButton: {
        margin: 0,
    },
    sectionDivider: {
        marginVertical: 8,
    },
    imposterCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    countDisplay: {
        alignItems: 'center',
        marginHorizontal: 32,
    },
    helperText: {
        textAlign: 'center',
        marginTop: 8,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: Layout.floatingBar.bottom,
        left: 0,
        right: 0,
        marginHorizontal: Layout.floatingBar.marginHorizontal,
        height: Layout.floatingBar.height,
        borderRadius: Layout.floatingBar.borderRadius,
        backgroundColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: Layout.floatingBar.shadowOffset,
        shadowOpacity: Layout.floatingBar.shadowOpacity,
        shadowRadius: Layout.floatingBar.shadowRadius,
    },
    doneButton: {
        flex: 1,
        borderRadius: 32,
        height: '100%',
        justifyContent: 'center',
    },
    doneButtonContent: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row-reverse',
    },
    doneButtonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
