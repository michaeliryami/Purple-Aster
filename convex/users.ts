import { v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

export const createUser = mutation({
    args: {
        username: v.string(),
        fullName: v.string(),
        email: v.string(),
        bio: v.optional(v.string()),
        image: v.string(),
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId)).first();
        if (existingUser) return

        await ctx.db.insert("users", {
            username: args.username,
            fullName: args.fullName,
            email: args.email,
            bio: args.bio,
            image: args.image,
            followers: 0,
            following: 0,
            clerkId: args.clerkId,
            posts: 0,
        })
    }
})

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthorized");
    }

    const currentUser = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).first();
    
    if (!currentUser) {
        throw new Error("User not found");
    }

    return currentUser;
}

export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
        
        return user;
    },
});   

export const updateProfile = mutation({
    args: {
        username: v.string(),
        bio: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const currentUser = await getAuthenticatedUser(ctx);

        await ctx.db.patch(currentUser._id, {
            username: args.username,
            bio: args.bio,
        })
    }
})  

export const getUserProfile = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        return user;
    }
})