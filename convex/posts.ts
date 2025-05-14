import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthorized");
    }
    return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
    args: {
        caption: v.optional(v.string()),
        storageId: v.id("_storage"), 
    },

    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const imageUrl = await ctx.storage.getUrl(args.storageId);

        if (!imageUrl) {
            throw new Error("Failed to get image URL");
        }

        const postId = await ctx.db.insert("posts", {
            userId: currentUser._id,
            imageUrl,
            caption: args.caption || "",
            storageId: args.storageId,
            likes: 0,
            comments: 0,
        });

        await ctx.db.patch(currentUser._id, {
            posts: currentUser.posts + 1
        });

        return postId;
    }
});

export const getPosts = query({
    handler: async (ctx) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const posts = await ctx.db.query("posts").order("desc").collect();

        if (posts.length === 0) {
            return [];
        }

        const postsWithInfo = await Promise.all(posts.map(async (post) => {
            const postAuthor = (await ctx.db.get(post.userId))!;
                

            const like = await ctx.db.query("likes")
                .withIndex("by_both", (q) => q.eq("userId", currentUser._id).eq("postId", post._id))
                .first();

            const bookmark = await ctx.db.query("bookmarks")
                .withIndex("by_both", (q) => q.eq("userId", currentUser._id).eq("postId", post._id))
                .first();

            return {
                ...post,
                author: {
                    _id: postAuthor?._id,
                    username: postAuthor?.username,
                    image: postAuthor?.image,
                },
                isLiked: !!like,
                isBookmarked: !!bookmark,
            };
        }));
        return postsWithInfo;
    },
})

export const toggleLike = mutation({ 
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const existing = await ctx.db.query("likes")
            .withIndex("by_both", (q) => q.eq("userId", currentUser._id).eq("postId", args.postId))
            .first();

        const post = await ctx.db.get(args.postId);
        if (!post) {
            throw new Error("Post not found");
        }

        if (existing) {
            await ctx.db.delete(existing._id);
            await ctx.db.patch(post._id, {
                likes: (post.likes ?? 0) - 1,
            });
            return false;
        } else {
            await ctx.db.insert("likes", { 
                userId: currentUser._id,
                postId: args.postId,
            });
            await ctx.db.patch(post._id, {
                likes: (post.likes ?? 0) + 1,
            });
            
            if (post.userId !== currentUser._id) {
                await ctx.db.insert("notifications", {
                    receiverId: post.userId,
                    senderId: currentUser._id,
                    type: "like",
                    postId: args.postId,
                });
            }
            
            return true;
        }
    }
});

export const toggleBookmark = mutation({ 
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const existing = await ctx.db.query("bookmarks")
            .withIndex("by_both", (q) => q.eq("userId", currentUser._id).eq("postId", args.postId))
            .first();

        const post = await ctx.db.get(args.postId);
        if (!post) {
            throw new Error("Post not found");
        }

        if (existing) {
            await ctx.db.delete(existing._id);
            return false;
        } else {
            await ctx.db.insert("bookmarks", { 
                userId: currentUser._id,
                postId: args.postId,
            });
            return true;
        }
    }
}); 

export const getBookmarkedPosts = query({
    handler: async (ctx) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const userId = currentUser._id;
        const bookmarkedPosts = await ctx.db.query("bookmarks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const posts = await Promise.all(bookmarkedPosts.map(async (bookmark) => {
            const post = await ctx.db.get(bookmark.postId);
            if (!post) return null;

            const author = await ctx.db.get(post.userId);
            if (!author) return null;

            const like = await ctx.db.query("likes")
                .withIndex("by_both", (q) => q.eq("userId", currentUser._id).eq("postId", post._id))
                .first();

            return {
                ...post,
                author: {
                    _id: author._id,
                    username: author.username,
                    image: author.image,
                },
                isLiked: !!like,
                isBookmarked: true
            };
        }));
            
        return posts;
    }
}) 

export const deletePost = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const post = await ctx.db.get(args.postId);
        if (!post) {
            throw new Error("Post not found");
        }
        
        if (post.userId !== currentUser._id) {
            throw new Error("Unauthorized");
        }

        const comments = await ctx.db.query("comments")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        const likes = await ctx.db.query("likes")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();
        
        const bookmarks = await ctx.db.query("bookmarks")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        const notifications = await ctx.db.query("notifications")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }

        for (const like of likes) {
            await ctx.db.delete(like._id);
        }

        for (const bookmark of bookmarks) {
            await ctx.db.delete(bookmark._id);
        }

        for (const notification of notifications) {
            await ctx.db.delete(notification._id);
        }

        await ctx.storage.delete(post.storageId);

        await ctx.db.delete(args.postId);
        
        await ctx.db.patch(currentUser._id, {
            posts: currentUser.posts - 1,
        });

        return true;
    }
})

export const getPostById = query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const post = await ctx.db.get(args.postId);
        if (!post) {
            throw new Error("Post not found");
        }   
        
        const author = await ctx.db.get(post.userId);
        if (!author) {
            throw new Error("Author not found");
        }

        const like = await ctx.db.query("likes")
            .withIndex("by_both", (q) => q.eq("userId", currentUser._id).eq("postId", args.postId))
            .first();

        const bookmark = await ctx.db.query("bookmarks")
            .withIndex("by_both", (q) => q.eq("userId", currentUser._id).eq("postId", args.postId))
            .first();
        
        return {
            ...post,
            author: {
                _id: author._id,
                username: author.username,
                image: author.image,
            },
            isLiked: !!like,
            isBookmarked: !!bookmark,
        };
    }
}) 

export const getPostsByUserId = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const posts = await ctx.db.query("posts")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .collect();

        if (posts.length === 0) {
            return [];
        }
        
        const postsWithInfo = await Promise.all(posts.map(async (post) => {
        
        const author = await ctx.db.get(post.userId);
        if (!author) {
            throw new Error("Author not found");
        }

        const like = await ctx.db.query("likes")
            .withIndex("by_both", (q) => q.eq("userId", currentUser._id).eq("postId", post._id))
            .first();

        const bookmark = await ctx.db.query("bookmarks")
            .withIndex("by_both", (q) => q.eq("userId", currentUser._id).eq("postId", post._id))
            .first();
        
        return {
            ...post,
            author: {
                _id: author._id,
                username: author.username,
                image: author.image,
            },
            isLiked: !!like,
            isBookmarked: !!bookmark,
        };
        }));

        return postsWithInfo;
    }
}) 
