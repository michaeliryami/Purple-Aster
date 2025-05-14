import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        fullName: v.string(),
        image: v.optional(v.string()),
        username: v.string(),
        bio: v.optional(v.string()),
        followers: v.number(),
        following: v.number(),
        posts: v.number()
    }).index("by_clerk_id", ["clerkId"]),

    posts: defineTable({
        userId: v.id("users"),
        imageUrl: v.string(),
        storageId: v.string(),
        caption: v.string(),
        likes: v.optional(v.number()),
        comments: v.optional(v.number()),
    }).index("by_user_id", ["userId"]),

    comments: defineTable({
        userId: v.id("users"),
        postId: v.id("posts"),
        content: v.string(),
    }).index("by_post", ["postId"]),

    likes: defineTable({
        userId: v.id("users"),
        postId: v.id("posts"),
    }).index("by_post", ["postId"]).index("by_user", ["userId"]).index("by_both", ["userId", "postId"]),

    follows: defineTable({
        followerId: v.id("users"),
        followingId: v.id("users"),
    }).index("by_follower", ["followerId"]).index("by_following", ["followingId"]).index("by_both", ["followerId", "followingId"]),

    notifications: defineTable({
        receiverId: v.id("users"),
        senderId: v.id("users"),
        type: v.union(v.literal("follow"), v.literal("like"), v.literal("comment")),
        postId: v.optional(v.id("posts")),
        commentId: v.optional(v.id("comments")),
    }).index("by_receiver", ["receiverId"]).index("by_post", ["postId"]).index("by_comment", ["commentId"]),

    bookmarks: defineTable({
        userId: v.id("users"),
        postId: v.id("posts"),
    }).index("by_user", ["userId"]).index("by_post", ["postId"]).index("by_both", ["userId", "postId"]),
    
})
