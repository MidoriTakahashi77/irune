import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { NoteCard } from "./NoteCard";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface NoteWithPageCount {
  id: string;
  note_type: string;
  title: string;
  created_at: string;
  is_locked: boolean;
  notebook_pages?: { count: number }[];
}

interface FreeNoteListProps {
  notes: NoteWithPageCount[];
  onPress: (id: string) => void;
}

export const FreeNoteList = memo(function FreeNoteList({ notes, onPress }: FreeNoteListProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const freeNotes = notes.filter(
    (n) => !n.note_type.startsWith("life_")
  );

  if (freeNotes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t("common.empty")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {freeNotes.map((note) => {
        const pageCount = note.notebook_pages?.[0]?.count;
        return (
          <NoteCard
            key={note.id}
            title={note.title}
            noteType={note.note_type}
            createdAt={note.created_at}
            isLocked={note.is_locked}
            pageCount={pageCount}
            onPress={() => onPress(note.id)}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  empty: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.md,
  },
});
