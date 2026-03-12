import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface MemberItem {
  id: string;
  display_name: string;
  color: string;
  relationship: string;
}

interface MemberAvatarListProps {
  members: MemberItem[];
  onPress: (id: string) => void;
}

export function MemberAvatarList({ members, onPress }: MemberAvatarListProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  if (members.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("family.title")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.item}
            onPress={() => onPress(member.id)}
          >
            <View
              style={[styles.avatar, { backgroundColor: member.color }]}
            >
              <Text style={styles.avatarText}>
                {member.display_name.charAt(0)}
              </Text>
            </View>
            <Text
              style={[styles.name, { color: colors.text }]}
              numberOfLines={1}
            >
              {member.display_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  item: {
    alignItems: "center",
    width: 64,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  name: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
});
