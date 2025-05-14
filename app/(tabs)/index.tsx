import Loader from "@/components/Loader";
import Post from "@/components/Post";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
export default function Index() {
  const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(async () => {
            setRefreshing(false);
        }, 2000);
    }
  const posts = useQuery(api.posts.getPosts);
  const { signOut } = useAuth();
  if (posts === undefined) return <Loader />

  if (posts.length === 0) return <NoPosts />
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>feed</Text>
         <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
         </TouchableOpacity>
      </View>
      <FlatList
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      data={posts}
      renderItem={({item}) => <Post post={item} />}
      keyExtractor={(item) => item._id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 60,
      }}
      />
    </View>
  );
}


const NoPosts = () => {
  const { signOut } = useAuth();
  return (
    <View style={styles.container}>
    <View style={styles.header}>
        <Text style={styles.headerTitle}>feed</Text>
         <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
         </TouchableOpacity>
      </View>
      </View>
  )
}
