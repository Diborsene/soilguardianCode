import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ VÉRIFIEZ QUE L'URL NGROK EST À JOUR
const API_URL = 'https://nonrefined-spencer-incommunicable.ngrok-free.dev/api';

console.log('🌐 URL de l\'API configurée:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Intercepteur pour logger les requêtes
api.interceptors.request.use(
  async (config) => {
    console.log('📤 Requête vers:', config.baseURL + config.url);
    console.log('📤 Méthode:', config.method);
    console.log('📤 Données:', config.data);
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Token ajouté');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour logger les réponses
api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse reçue:', response.status);
    console.log('✅ Données:', response.data);
    return response;
  },
  async (error) => {
    console.error('❌ Erreur de réponse:', error.message);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Données:', error.response?.data);
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;