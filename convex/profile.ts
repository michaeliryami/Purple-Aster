import { query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";


export const getUserPosts = query({
    handler: async (ctx) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const posts = await ctx.db.query("posts").withIndex("by_user_id", (q) => q.eq("userId", currentUser._id)).order("desc").collect();

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

