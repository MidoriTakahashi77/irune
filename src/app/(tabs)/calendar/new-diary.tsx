import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/hooks/useAuth";
import { useCreateDiaryEntry } from "@/hooks/useDiaryEntries";
import { useCalendarStore } from "@/hooks/useCalendarStore";
import { uploadMedia } from "@/services/storage";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { diarySchema, type DiaryFormData } from "@/utils/validation";

const MOODS = ["😊", "😐", "😢", "😡", "🤒", "😴"];

export default function NewDiaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { selectedDate } = useCalendarStore();
  const createDiary = useCreateDiaryEntry();
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DiaryFormData>({
    resolver: zodResolver(diarySchema),
    defaultValues: {
      title: "",
      entry_date: selectedDate,
      body: "",
      mood: "",
      location: "",
      tags: [],
    },
  });

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  }

  async function onSubmit(data: DiaryFormData) {
    if (!profile?.family_id) return;
    setUploading(true);
    try {
      const entry = await createDiary.mutateAsync({
        ...data,
        family_id: profile.family_id,
        created_by: profile.id,
      });

      // Upload images
      for (const image of images) {
        const fileName = image.uri.split("/").pop() ?? "photo.jpg";
        const storagePath = await uploadMedia(
          profile.family_id,
          fileName,
          image.uri,
          image.mimeType ?? "image/jpeg"
        );
        await supabase.from("diary_media").insert({
          diary_id: entry.id,
          storage_path: storagePath,
          media_type: "image",
        });
      }

      router.back();
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Button
              title={t("common.cancel")}
              onPress={() => router.back()}
              variant="ghost"
            />
            <Text style={[styles.title, { color: colors.text }]}>
              {t("diary.create")}
            </Text>
            <View style={{ width: 80 }} />
          </View>

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("diary.title")}
                placeholder={t("diary.titlePlaceholder")}
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="body"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("diary.body")}
                placeholder={t("diary.bodyPlaceholder")}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={5}
                style={{ height: 120, textAlignVertical: "top" }}
              />
            )}
          />

          <Controller
            control={control}
            name="mood"
            render={({ field: { onChange, value } }) => (
              <View style={styles.moodContainer}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  {t("diary.mood")}
                </Text>
                <View style={styles.moodRow}>
                  {MOODS.map((mood) => (
                    <TouchableOpacity
                      key={mood}
                      style={[
                        styles.moodButton,
                        {
                          backgroundColor:
                            value === mood
                              ? colors.primaryLight
                              : colors.backgroundElement,
                        },
                      ]}
                      onPress={() => onChange(value === mood ? "" : mood)}
                    >
                      <Text style={styles.moodEmoji}>{mood}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("diary.location")}
                placeholder={t("diary.locationPlaceholder")}
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {/* Photo picker */}
          <View style={styles.photoSection}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("diary.addPhoto")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photoRow}>
                {images.map((img, i) => (
                  <Image key={i} source={{ uri: img.uri }} style={styles.thumbnail} />
                ))}
                <TouchableOpacity
                  style={[
                    styles.addPhotoButton,
                    { backgroundColor: colors.backgroundElement },
                  ]}
                  onPress={pickImage}
                >
                  <Ionicons
                    name="camera-outline"
                    size={32}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          <Button
            title={t("diary.save")}
            onPress={handleSubmit(onSubmit)}
            loading={createDiary.isPending || uploading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  moodContainer: {
    marginBottom: Spacing.md,
  },
  moodRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  moodButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  moodEmoji: {
    fontSize: 24,
  },
  photoSection: {
    marginBottom: Spacing.lg,
  },
  photoRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
