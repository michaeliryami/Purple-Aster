import Loader from '@/components/Loader';
import ViewPost from '@/components/ViewPost';
import { COLORS } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { Image } from "expo-image";
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/profile.styles';

export default function Profile() {

  const { user } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, {clerkId: user?.id ?? "skip"});
  const posts = useQuery(api.profile.getUserPosts);

  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(async () => {
            setRefreshing(false);
        }, 2000);
    }



  const likes = async () => {
    let totalLikes = 0;
    for (const post of posts ?? []) {
      totalLikes += post.likes ?? 0;
    }
    return totalLikes;
  }

  if (posts === undefined) {
    return <Loader />
  }

  const onClose = () => {
    setSelectedPost(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.username}>{currentUser?.username}</Text>
      </View>
      <View style={styles.headerLeft}>
        <View style={styles.avatarAndStats}>
        <View style={styles.avatarContainer}>
          <Image
            source={{uri: currentUser?.image ?? ""}}
            style={styles.avatar}
            contentFit="cover"
          />
          
        </View>
        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.white }]}>{posts.length}</Text>
              <Text style={[styles.statLabel, { color: COLORS.grey }]}>posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.white }]}>{likes()}</Text>
              <Text style={[styles.statLabel, { color: COLORS.grey }]}>likes</Text>
            </View>

          </View>
        </View>
      </View>
      <Text style={styles.name}>{currentUser?.fullName}</Text>
    <FlatList
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      data={posts}
      numColumns={3}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPost(item.imageUrl)}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.gridImage}
            contentFit="cover"
          />
          <View>
          <Modal visible={selectedPost == item.imageUrl} transparent={false} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalContainer3}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer2}>
                    <View style={styles.modalHeader2}>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle2}>Post</Text>
                        <View style={{width: 24}}>
                        </View>
                    </View>
                    <ViewPost post={item}/>
            </KeyboardAvoidingView>
            </View>
            </Modal>
            </View>
        </TouchableOpacity>

      )}
      style={{ flex: 1, paddingTop: 12 }}
    />
  
</View>
  )
}