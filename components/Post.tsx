import { COLORS } from '@/constants/theme'
import { api } from '@/convex/_generated/api'
import { styles } from '@/styles/feed.styles'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery } from 'convex/react'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import CommentsModal from './CommentsModal'



export default function Post({post}: {post: any}) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const toggleLike = useMutation(api.posts.toggleLike);
  const [commentsCount, setCommentCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const toggleBookmark = useMutation(api.posts.toggleBookmark);
  const deletePost = useMutation(api.posts.deletePost);
  const { user } = useUser();

  const currentUser = useQuery(api.users.getUserByClerkId, {clerkId: user?.id ?? "skip"});

  const handleDelete = async () => {
    try {
      await deletePost({postId: post._id});
    } catch (error) {
      console.error(error);
    }
  }

  const handleBookmark = async () => {
    try {
        const isBookmarked = await toggleBookmark({ postId: post._id });
        setIsBookmarked(isBookmarked);
    } catch (error) {
        console.error("Error toggling bookmark:", error);
    }
};
  const handleLike = async () => {
    try {
      const newIsLiked = await toggleLike({postId: post._id});
      setIsLiked(newIsLiked);
      setLikeCount((prev: number) => prev + (newIsLiked ? 1 : -1));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View style={styles.post}>
        <View style={styles.postHeader}>
        <Link href={`/user/${post.author._id}`} asChild>
                <TouchableOpacity style={styles.postHeaderLeft}>
                    <Image
                        source={{uri: post.author.image}}
                        style={styles.postAvatar}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                    />
                    <Text style={styles.postUsername}>{post.author.username}</Text>
                </TouchableOpacity>
            </Link>
            {currentUser?._id === post.userId && (
              <TouchableOpacity onPress={handleDelete}> 
                <Ionicons name="trash-outline" size={20} color={COLORS.white} />
              </TouchableOpacity>
            )}

        </View>
        <Image
            source={post.imageUrl}
            style={styles.postImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
        />
        <View style={styles.postActions}>
            <View style={styles.postActionsLeft}>
                <TouchableOpacity onPress={handleLike}>
                    <Ionicons name={isLiked > 0 ? "heart" : "heart-outline"} size={20} color={isLiked ? COLORS.primary : COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowComments(true)}>
                    <Ionicons name="chatbubble-outline" size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBookmark}>
                    <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"}  size={20} color={isBookmarked ? COLORS.primary : COLORS.white} />
                </TouchableOpacity>
                </View>
        </View>
        <View style={styles.postInfo}>
            {post.likes > 0 ? (
                <Text style={styles.likesText}>{post.likes} likes</Text>
            ) : (
                <Text style={styles.likesText}>Be the first to like</Text>
            )}
            {post.caption && ( 
                <View style={styles.captionContainer}>
                    <Text style={styles.captionUsername}>{post.author.username}</Text>
                    <Text style={styles.captionText}>{post.caption}</Text>
                </View>
            )}
            {post.comments > 0 && (
                <TouchableOpacity onPress={() => setShowComments(true)}>
                    <Text style={styles.commentText}>View all {post.comments} comments</Text>
                </TouchableOpacity>
            )}
            <Text style={styles.timeAgo}>2 hours ago</Text>
        </View>
        <CommentsModal postId={post._id}  visible={showComments} onClose={() => setShowComments(false)} setCommentCount={(prev: number) => setCommentCount(prev + 1)}/>
    </View>
  )
}