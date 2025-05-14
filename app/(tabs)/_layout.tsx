import { COLORS } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import React from 'react'

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{
        tabBarShowLabel:false, 
        headerShown: false, 
        tabBarActiveTintColor: COLORS.primary, 
        tabBarInactiveTintColor: COLORS.grey,
        tabBarStyle: {
          backgroundColor: "black",
          borderTopWidth: 0,
          position: "absolute",
          elevation: 0,
          height: 40,
          paddingBottom: 80
        }
    }}>
        <Tabs.Screen name="index" options={{tabBarIcon: () => <Ionicons name="home" size={30} color={COLORS.primary}/>}}/>
        <Tabs.Screen name="bookmarks" options={{tabBarIcon: () => <Ionicons name="bookmark" size={30} color={COLORS.primary}/>}}/>
        <Tabs.Screen name="create" options={{tabBarIcon: () => <Ionicons name="add-circle" size={30} color={COLORS.primary}/>}}/>
        <Tabs.Screen name="notifications" options={{tabBarIcon: () => <Ionicons name="heart" size={30} color={COLORS.primary}/>}}/>
        <Tabs.Screen name="profile" options={{tabBarIcon: () => <Ionicons name="person-circle" size={30} color={COLORS.primary}/>}}/>
    </Tabs>
  )
} 