import ClerkAndConvexProvider from '@/providers/ClerkAndConvexProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import InitialLayout from "../components/initialLayout";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after resources are loaded
    SplashScreen.hideAsync();
  }, []);

  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor: "#000"}}>
        <InitialLayout />
      </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
        
  );
}