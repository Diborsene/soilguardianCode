import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="location"
      screenOptions={{
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: Platform.OS === 'ios' ? 90 : 90,  // ✅ Plus de hauteur
          paddingBottom: Platform.OS === 'ios' ? 30 : 30,  // ✅ Beaucoup plus de padding en bas
          paddingTop: 10,  // ✅ Plus d'espace en haut
          position: 'absolute',  // ✅ Important pour Android
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 5,  // ✅ Marge en bas
        },
        tabBarIconStyle: {
          marginTop: 5,  // ✅ Espace au-dessus des icônes
        },
      }}
    >
      <Tabs.Screen
        name="location"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color={color} />  // ✅ Taille fixe
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analyse"
        options={{
          title: 'Analyse',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="conseils"
        options={{
          title: 'Conseils',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rapport"
        options={{
          title: 'Rapport',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}