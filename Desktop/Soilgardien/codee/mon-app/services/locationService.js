import api from '../config/api';
import * as Location from 'expo-location';

class LocationService {
  // Demander la permission et obtenir la position actuelle
  async getCurrentPosition() {
    try {
      // Demander la permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Permission de localisation refusée');
      }

      // Obtenir la position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Erreur lors de l\'obtention de la position:', error);
      throw error;
    }
  }

  // Obtenir l'adresse à partir des coordonnées via notre API
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await api.post('/location/reverse-geocode', {
        latitude,
        longitude,
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors du reverse geocoding:', error);
      throw error.response?.data || { message: 'Erreur réseau' };
    }
  }

  // Obtenir les coordonnées à partir d'une adresse
  async geocode(adresse) {
    try {
      const response = await api.post('/location/geocode', {
        adresse,
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors du geocoding:', error);
      throw error.response?.data || { message: 'Erreur réseau' };
    }
  }

  // Calculer la distance entre deux points
  async calculateDistance(lat1, lon1, lat2, lon2) {
    try {
      const response = await api.get('/location/distance', {
        params: { lat1, lon1, lat2, lon2 },
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors du calcul de distance:', error);
      throw error.response?.data || { message: 'Erreur réseau' };
    }
  }

  // Fonction complète : obtenir position + adresse
  async getCurrentLocationWithAddress() {
    try {
      // Obtenir la position GPS
      const position = await this.getCurrentPosition();
      
      // Obtenir l'adresse correspondante
      const locationData = await this.reverseGeocode(
        position.latitude,
        position.longitude
      );

      return {
        ...position,
        ...locationData.data,
      };
    } catch (error) {
      console.error('Erreur complète:', error);
      throw error;
    }
  }
}

export default new LocationService();