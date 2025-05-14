import { COLORS } from '@/constants/theme'
import { api } from '@/convex/_generated/api'
import { styles } from '@/styles/create.styles'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from 'convex/react'
import * as FileSystem from 'expo-file-system'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function create() {
  const router = useRouter();
  const { user } = useUser();
  const [caption, setCaption] = useState("");
  const [thisImage, setThisImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: .8,
    });

    if (!result.canceled) {
      setThisImage(result.assets[0].uri);
    }
  }

  const generatedUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);
  const handleShare = async () => {
    if (!thisImage) return;

    try {
      setIsLoading(true);
      const uploadUrl = await generatedUploadUrl();
      const uploadResult = await FileSystem.uploadAsync(uploadUrl, thisImage, {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        mimeType: "image/jpeg",
      });

      if (uploadResult.status !== 200) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = JSON.parse(uploadResult.body);

      await createPost({
        storageId,
        caption
      });

      router.push("/(tabs)");

    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!thisImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <View style={{width: 28}}/>
        </View>
        <TouchableOpacity style={styles.emptyImageContainer} onPress={pickImage}>
          <Ionicons name="image-outline" size={48} color={COLORS.grey} />
          <Text style={styles.emptyImageText}>Select a pic</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            setThisImage(null);
            setCaption("");
          }} disabled={isLoading}>
            <Ionicons name="close-outline" size={28} color={isLoading ? COLORS.grey : COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity style={[styles.shareButton, isLoading && styles.shareButtonDisabled]}  disabled={isLoading || !thisImage} onPress={handleShare}>
            {isLoading ? (<ActivityIndicator size="small" color={COLORS.white} />) : (<Text style={styles.shareText}>Share</Text>)}
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled" contentOffset={{x:0,y: 100}}>
          <View style={[styles.content, isLoading && styles.contentDisabled]}>
              <View style={styles.imageSection}>
                <Image
                  source={thisImage}
                  style={styles.previewImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <TouchableOpacity style={styles.changeImageButton} onPress={pickImage} disabled={isLoading}>
                  <Ionicons name="image-outline" size={20} color={COLORS.white} />
                  <Text style={styles.changeImageText}>Change</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputSection}>
                <TextInput
                  style={styles.captionInput}
                  placeholder="Add a caption..."
                  placeholderTextColor={COLORS.grey}
                  value={caption}
                  onChangeText={setCaption}
                  editable={!isLoading}
                  multiline={true}
                />
              </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}