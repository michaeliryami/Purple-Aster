import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import Comment from "./Comment";
import Loader from "./Loader";


type CommentsModal = {
    postId: Id<"posts">;
    visible: boolean;
    onClose: () => void;
    setCommentCount: (prev: number) => void;
}

export default function CommentsModal({postId, visible, onClose, setCommentCount}: CommentsModal) {
    const [newComment, setNewComment] = useState("");
    const comments = useQuery(api.comments.getComments, {postId});
    const addComment = useMutation(api.comments.addComment);
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            await addComment({
                postId,
                content: newComment,
            });
        } catch (error) {
            console.log(error);
        }   
    }
    return (
        <View>
            <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Comments</Text>
                        <View style={{width: 24}}>
                        </View>
                    </View>
                    {comments === undefined ? (
                        <Loader />
                    ) : (
                        <FlatList 
                            data={comments} 
                            renderItem={({item}) => <Comment comment={item}/>} 
                            keyExtractor={(item) => item?._id.toString() ?? ""}
                        />
                    )}

                    <View style={styles.commentInput}>
                        <TextInput
                            placeholder="Add a comment..."
                            value={newComment}
                            onChangeText={setNewComment}
                            style={styles.input}
                            placeholderTextColor={COLORS.grey}
                            multiline={true}
                        />
                        <TouchableOpacity onPress={handleAddComment} disabled={!newComment.trim()}>
                            <Ionicons name="send" size={24} color={COLORS.white} style={[styles.postButton, !newComment.trim() && styles.postButtonDisabled]}/>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

            </Modal>
        </View>
    )
}