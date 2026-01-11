import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import authService from '../services/authService';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const loggedIn = await authService.isLoggedIn();
      console.log('🔍 État de connexion:', loggedIn);
      
      // Petit délai pour la stabilité de la navigation
      setTimeout(() => {
        if (loggedIn) {
          router.replace('/(tabs)/location' as any);
        } else {
          router.replace('/login' as any);
        }
      }, 100);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      router.replace('/login' as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌱</Text>
      <Text style={styles.title}>Soil Guardian</Text>
      <ActivityIndicator size="large" color="#2ecc71" style={styles.loader} />
      <Text style={styles.loadingText}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
});