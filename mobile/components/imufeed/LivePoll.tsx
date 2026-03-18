/**
 * LivePoll — Sondage interactif en live
 *
 * Permet au host de créer un sondage et aux viewers de voter.
 * Affiche les résultats en temps réel avec des barres de progression.
 *
 * Sprint S17 — Co-host, Replay, Modération, Sondages
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type {
  LivePollOption,
  LivePoll as LivePollType,
} from "@/types/live-streaming";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Poll Creation Form ───────────────────────────────────────

export interface PollCreatorProps {
  onCreatePoll: (
    question: string,
    options: string[],
    durationSeconds: number,
  ) => void;
  onClose: () => void;
}

export function PollCreator({ onCreatePoll, onClose }: PollCreatorProps) {
  const colors = useColors();
  const { t } = useI18n();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(60);

  const DURATIONS = [30, 60, 120, 300, 0];

  const canCreate =
    question.trim().length >= 3 &&
    options.filter((o) => o.trim().length > 0).length >= 2;

  const handleAddOption = useCallback(() => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  }, [options]);

  const handleRemoveOption = useCallback(
    (index: number) => {
      if (options.length > 2) {
        setOptions(options.filter((_, i) => i !== index));
      }
    },
    [options],
  );

  const handleOptionChange = useCallback(
    (index: number, text: string) => {
      const updated = [...options];
      updated[index] = text;
      setOptions(updated);
    },
    [options],
  );

  const handleCreate = useCallback(() => {
    if (!canCreate) return;
    const validOptions = options.filter((o) => o.trim().length > 0);
    onCreatePoll(question.trim(), validOptions, duration);
  }, [question, options, duration, canCreate, onCreatePoll]);

  const formatDuration = (s: number) => {
    if (s === 0) return t("live.poll.unlimited", { defaultValue: "Illimité" });
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}min`;
  };

  return (
    <View
      testID="poll-creator"
      style={[styles.creatorContainer, { backgroundColor: colors.card }]}
    >
      <View style={styles.creatorHeader}>
        <Text style={[styles.creatorTitle, { color: colors.text }]}>
          {t("live.poll.create", { defaultValue: "Créer un sondage" })}
        </Text>
        <TouchableOpacity testID="poll-creator-close" onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TextInput
        testID="poll-question-input"
        style={[
          styles.questionInput,
          { color: colors.text, borderColor: colors.border },
        ]}
        value={question}
        onChangeText={setQuestion}
        placeholder={t("live.poll.questionPlaceholder", {
          defaultValue: "Pose ta question...",
        })}
        placeholderTextColor={colors.textSecondary}
        maxLength={150}
      />

      {options.map((opt, index) => (
        <View key={`opt-${index}`} style={styles.optionRow}>
          <TextInput
            testID={`poll-option-input-${index}`}
            style={[
              styles.optionInput,
              { color: colors.text, borderColor: colors.border },
            ]}
            value={opt}
            onChangeText={(text) => handleOptionChange(index, text)}
            placeholder={`${t("live.poll.option", { defaultValue: "Option" })} ${index + 1}`}
            placeholderTextColor={colors.textSecondary}
            maxLength={80}
          />
          {options.length > 2 && (
            <TouchableOpacity
              testID={`poll-remove-option-${index}`}
              onPress={() => handleRemoveOption(index)}
            >
              <Ionicons name="remove-circle" size={22} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {options.length < 6 && (
        <TouchableOpacity
          testID="poll-add-option"
          style={styles.addOptionBtn}
          onPress={handleAddOption}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={{ color: colors.primary, fontSize: 14 }}>
            {t("live.poll.addOption", { defaultValue: "Ajouter une option" })}
          </Text>
        </TouchableOpacity>
      )}

      {/* Duration selector */}
      <Text style={[styles.durationLabel, { color: colors.textSecondary }]}>
        {t("live.poll.duration", { defaultValue: "Durée" })}
      </Text>
      <View testID="poll-duration-selector" style={styles.durationRow}>
        {DURATIONS.map((d) => (
          <TouchableOpacity
            key={d}
            testID={`poll-duration-${d}`}
            style={[
              styles.durationChip,
              {
                borderColor: duration === d ? colors.primary : colors.border,
                backgroundColor:
                  duration === d ? `${colors.primary}20` : "transparent",
              },
            ]}
            onPress={() => setDuration(d)}
          >
            <Text
              style={{
                color: duration === d ? colors.primary : colors.textSecondary,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {formatDuration(d)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        testID="poll-create-button"
        style={[
          styles.createButton,
          { backgroundColor: canCreate ? colors.primary : "#666" },
        ]}
        onPress={handleCreate}
        disabled={!canCreate}
      >
        <Text style={styles.createButtonText}>
          {t("live.poll.launch", { defaultValue: "Lancer le sondage" })}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Poll Voting/Results ──────────────────────────────────────

export interface LivePollDisplayProps {
  poll: LivePollType;
  onVote: (optionIndex: number) => void;
  onClose?: () => void;
  isHost: boolean;
}

export default function LivePollDisplay({
  poll,
  onVote,
  onClose,
  isHost,
}: LivePollDisplayProps) {
  const colors = useColors();
  const { t } = useI18n();

  const getPercentage = (option: LivePollOption) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((option.voteCount / poll.totalVotes) * 100);
  };

  return (
    <View testID="poll-display" style={styles.pollContainer}>
      {/* Header */}
      <View style={styles.pollHeader}>
        <Ionicons name="stats-chart" size={16} color="#FFD700" />
        <Text style={styles.pollBadge}>
          {t("live.poll.badge", { defaultValue: "SONDAGE" })}
        </Text>
        {!poll.isActive && (
          <Text style={styles.pollClosed}>
            {t("live.poll.closed", { defaultValue: "Terminé" })}
          </Text>
        )}
        {isHost && onClose && poll.isActive && (
          <TouchableOpacity testID="poll-close-button" onPress={onClose}>
            <Ionicons name="close-circle" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Question */}
      <Text testID="poll-question" style={styles.pollQuestion}>
        {poll.question}
      </Text>

      {/* Options */}
      {poll.options.map((option, index) => {
        const pct = getPercentage(option);
        const isVoted = poll.votedOptionIndex === index;
        const canVote = poll.isActive && !poll.hasVoted;

        return (
          <TouchableOpacity
            key={option.id}
            testID={`poll-option-${index}`}
            style={styles.pollOption}
            onPress={() => canVote && onVote(index)}
            disabled={!canVote}
            activeOpacity={canVote ? 0.6 : 1}
          >
            {/* Progress bar background */}
            <View
              testID={`poll-bar-${index}`}
              style={[
                styles.pollBar,
                {
                  width: `${pct}%` as any,
                  backgroundColor: isVoted
                    ? "rgba(106,84,163,0.5)"
                    : "rgba(255,255,255,0.15)",
                },
              ]}
            />
            <View style={styles.pollOptionContent}>
              <Text
                style={[
                  styles.pollOptionText,
                  isVoted && styles.pollOptionTextVoted,
                ]}
              >
                {option.text}
              </Text>
              {(poll.hasVoted || !poll.isActive) && (
                <Text style={styles.pollPct}>{pct}%</Text>
              )}
            </View>
            {isVoted && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#6A54A3"
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        );
      })}

      {/* Total votes */}
      <Text style={styles.totalVotes}>
        {poll.totalVotes} {t("live.poll.votes", { defaultValue: "votes" })}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Creator
  creatorContainer: {
    borderRadius: 16,
    padding: 16,
    margin: 12,
    gap: 10,
  },
  creatorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creatorTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  questionInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  durationLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  durationRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  durationChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  createButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  // Display
  pollContainer: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    gap: 6,
  },
  pollHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pollBadge: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    flex: 1,
  },
  pollClosed: {
    color: "#FF4444",
    fontSize: 11,
    fontWeight: "700",
  },
  pollQuestion: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  pollOption: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    minHeight: 40,
    justifyContent: "center",
  },
  pollBar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 10,
  },
  pollOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pollOptionText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  pollOptionTextVoted: {
    fontWeight: "700",
  },
  pollPct: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },
  checkIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -8,
  },
  totalVotes: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    textAlign: "right",
  },
});
