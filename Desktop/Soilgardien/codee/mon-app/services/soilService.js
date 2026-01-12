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
   * Analyser le sol pour une position avec retry automatique
   */
  async analyzeSoil(latitude, longitude, radius = 10, retries = 2) {
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await api.post('/soil/analyze', {
          latitude,
          longitude,
          radius
        });

        return response.data;
      } catch (error) {
        lastError = error;
        const errorData = error.response?.data;

        // Si c'est une erreur 404 (pas de données trouvées) et qu'il reste des tentatives
        if (error.response?.status === 404 && attempt < retries) {
          // Attendre 2 secondes avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        // Pour les autres erreurs ou la dernière tentative, on lance l'erreur
        console.error('❌ Erreur lors de l\'analyse:', errorData || error.message);
        throw errorData || {
          success: false,
          message: 'Erreur réseau. Vérifiez votre connexion.'
        };
      }
    }

    // Si on arrive ici, toutes les tentatives ont échoué
    throw lastError.response?.data || {
      success: false,
      message: 'Impossible de récupérer les données après plusieurs tentatives.'
    };
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