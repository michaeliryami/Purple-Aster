import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const addComment = mutation({
    args: {
        postId: v.id("posts"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const post = await ctx.db.get(args.postId);
        if (!post) {
            throw new Error("Post not found");
        }

        const commentId = await ctx.db.insert("comments", {
            postId: args.postId,
            content: args.content,
            userId: currentUser._id,
        });

        await ctx.db.patch(args.postId, {
            comments: (post.comments || 0) + 1,
        });

        if (post.userId !== currentUser._id) {
            await ctx.db.insert("notifications", {
                receiverId: post.userId,
                senderId: currentUser._id,
                type: "comment",
                postId: args.postId,
                commentId: commentId,
            });
        }

        return commentId;
    }
});

export const getComments = query({
    args: {
        postId: v.id("posts"),
    },
    handler: async (ctx, args) => {
        const comments = await ctx.db.query("comments")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        const commentsWithInfo = await Promise.all(comments.map(async (comment) => {
            const commentAuthor = await ctx.db.get(comment.userId);
            if (!commentAuthor) return null;
            
            return {
                ...comment,
                author: {
                    _id: commentAuthor._id,
                    username: commentAuthor.username,
                    image: commentAuthor.image,
                }
            };
        }));

        return commentsWithInfo.filter(Boolean);
    } 
});