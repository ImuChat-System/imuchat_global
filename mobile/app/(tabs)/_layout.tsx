import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";

// Tab Bar Icon Component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      testID="tabs-container"
      screenOptions={{
        tabBarActiveTintColor: "#ec4899", // ImuChat primary color
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
        tabBarStyle: {
          backgroundColor: "#0f0a1a",
          borderTopColor: "rgba(255,255,255,0.1)",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerShown: false,
        headerStyle: {
          backgroundColor: "#0f0a1a",
        },
        headerTintColor: "#ffffff",
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      {/* Chats Tab */}
      <Tabs.Screen
        name="chats"
        options={{
          tabBarTestID: "tab-chats",
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="comments" color={color} />
          ),
          tabBarBadge: 3, // Example unread count
        }}
      />

      {/* Calls Tab */}
      <Tabs.Screen
        name="calls"
        options={{
          title: "Appels",
          tabBarIcon: ({ color }) => <TabBarIcon name="phone" color={color} />,
        }}
      />

      {/* Contacts Tab */}
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="address-book" color={color} />
          ),
        }}
      />

      {/* Social Tab */}
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />

      {/* Notifications Tab */}
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarTestID: "tab-notifications",
          title: "Notifs",
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
        }}
      />

      {/* Watch Tab */}
      <Tabs.Screen
        name="watch"
        options={{
          title: "Watch",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="play-circle" color={color} />
          ),
        }}
      />

      {/* Store Tab */}
      <Tabs.Screen
        name="store"
        options={{
          title: "Store",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="shopping-bag" color={color} />
          ),
        }}
      />

      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarTestID: "tab-settings",
          title: "Paramètres",
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />

      {/* Profile Tab - caché de la tab bar */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarTestID: "tab-profile",
          title: "Profil",
          href: null,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
