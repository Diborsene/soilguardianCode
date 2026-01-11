import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // Inscription
  async register(userData) {
    try {
      console.log('📝 Tentative d\'inscription pour:', userData.email);
      
      const response = await api.post('/auth/inscription', {  // ✅ /auth/inscription
        email: userData.email,
        mot_de_passe: userData.password,
        nom_complet: userData.nom_complet,
        telephone: userData.telephone,
        type_utilisateur: userData.type_utilisateur || 'agriculteur',
        ville: userData.ville,
        region: userData.region,
        pays: 'Sénégal',
      });

      console.log('✅ Réponse du serveur:', response.data);

      if (response.data.success) {
        // Sauvegarder le token et les infos utilisateur
        await AsyncStorage.setItem('userToken', response.data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.utilisateur));
      }

      return response.data;
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur réseau' };
    }
  }

  // Connexion
  async login(email, password) {
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      
      const response = await api.post('/auth/connexion', {  // ✅ /auth/connexion
        email,
        mot_de_passe: password,
      });

      console.log('✅ Réponse du serveur:', response.data);

      if (response.data.success) {
        // Sauvegarder le token et les infos utilisateur
        await AsyncStorage.setItem('userToken', response.data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.utilisateur));  // ✅ utilisateur (pas user)
      }

      return response.data;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur réseau' };
    }
  }

  // Déconnexion
  async logout() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      console.log('👋 Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  // Récupérer le profil
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur réseau' };
    }
  }

  // Vérifier si l'utilisateur est connecté
  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Récupérer l'utilisateur sauvegardé
  async getUser() {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();