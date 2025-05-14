import Loader from '@/components/Loader';
import ViewPost from '@/components/ViewPost';
import { COLORS } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { styles } from '@/styles/notifications.styles';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
export default function Notifications() {
  const notifications = useQuery(api.notifications.getNotifications);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(async () => {
      setRefreshing(false);
    }, 2000);
  }

  if (notifications === undefined) {
    return (
      <Loader />
    )
  }

  
  if (notifications.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="notifications-outline" size={48} color={COLORS.primary} />
        <Text style={{color: COLORS.white, fontSize: 20, fontWeight: "bold"}}>No notifications</Text>
      </View>
    )
  }

  

  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
      data={notifications}
      renderItem={({item}) => <NotificationItem notification={item} />}
      keyExtractor={(item) => item._id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      
    </View>
  )
}

function NotificationItem({notification}: {notification: any}) {
  const [showPost, setShowPost] = useState(false);

  const onClose = () => {
    setShowPost(false);
  }
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Link href={`/user/${notification.sender._id}`} asChild>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={notification.sender.image}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <View style={styles.iconBadge}>
              {notification.type === "like" && <Ionicons name="heart" size={14} color={COLORS.primary} />}
              {notification.type === "comment" && <Ionicons name="chatbubble-ellipses" size={14} color={COLORS.primary} />}
            </View>
          </TouchableOpacity>
        </Link>

        <View style={styles.notificationInfo}>
          <Link href={`/user/${notification.sender._id}`} asChild>
            <TouchableOpacity>
              <Text style={styles.username}>{notification.sender.username}</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.action}>
            {notification.type === "like" 
              ? "liked" 
              : notification.type === "comment" 
                ? `commented "${notification.comment}" on` 
                : ""
            } your post
          </Text>
          <Text style={styles.timeAgo}>{formatDistanceToNow(notification._creationTime, {addSuffix: true})}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => setShowPost(true)}>
        <Image
          source={notification.post.imageUrl}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
          <View>
          <Modal visible={showPost} transparent={false} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalContainer5}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer4}>
                    <View style={styles.modalHeader3}>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle3}>Post</Text>
                        <View style={{width: 24}}>
                        </View>
                    </View>
                    <ViewPost post={{...notification.post, author: notification.receiver}}/>
            </KeyboardAvoidingView>
            </View>
            </Modal>
            </View>
        </TouchableOpacity>
    </View>
  )
}