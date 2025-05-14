export function getAssetUrl(storageId: string) {
    return `${process.env.EXPO_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;
} 