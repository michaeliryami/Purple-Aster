import Loader from "@/components/Loader";
import Post from "@/components/Post";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useQuery } from "convex/react";
import { useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
export default function Bookmarks() {
  const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(async () => {
            setRefreshing(false);
        }, 2000);
    }
  const posts = useQuery(api.posts.getBookmarkedPosts);
  if (posts === undefined) return <Loader />

  if (posts.length === 0) return <NoPosts />
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>bookmarks</Text>
      </View>
      <FlatList
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      data={posts}
      renderItem={({item}) => <Post post={item} />}
      keyExtractor={(item) => item?._id.toString() ?? ""}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 60,
      }}
      />
    </View>
  );
}


const NoPosts = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>no bookmarks</Text>
      </View>
    </View>
  )
}
