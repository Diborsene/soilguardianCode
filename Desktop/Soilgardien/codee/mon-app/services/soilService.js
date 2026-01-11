import api from '../config/api';

class SoilService {
  /**
   * Trouver les sols les plus proches
   */
  async findNearestSoil(latitude, longitude, radius = 10, limit = 5) {
    try {
      console.log(`🔍 Recherche de sols proches de: ${latitude}, ${longitude}`);
      
      const response = await api.post('/soil/find-nearest', {
        latitude,
        longitude,
        radius,
        limit
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur réseau' };
    }
  }

  /**
   * Analyser le sol pour une position
   */
  async analyzeSoil(latitude, longitude, radius = 10) {
    try {
      console.log(`🌱 Analyse de sol pour: ${latitude}, ${longitude}`);
      
      const response = await api.post('/soil/analyze', {
        latitude,
        longitude,
        radius
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur réseau' };
    }
  }

  /**
   * Obtenir un rapport détaillé
   */
  async getDetailedReport(latitude, longitude, culture_souhaitee = null, radius = 10) {
    try {
      console.log(`📄 Génération de rapport pour: ${latitude}, ${longitude}`);
      
      const response = await api.post('/soil/report', {
        latitude,
        longitude,
        culture_souhaitee,
        radius
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur réseau' };
    }
  }
}

export default new SoilService();