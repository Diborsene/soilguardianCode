/**
 * Service de génération de rapports PDF - AGRICULTEURS
 * services/reportService.js
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import api from '../config/api';

class ReportService {
  
  /**
   * Générer et télécharger le rapport PDF agricole
   */
  async generateReport(analysisData) {
    try {
      // Appeler l'API backend avec arraybuffer (compatible React Native)
      const response = await api.post(
        '/reports/generate-agriculture',
        { analysis_data: analysisData },
        {
          responseType: 'arraybuffer',
          timeout: 30000,
          headers: {
            'Accept': 'application/pdf',
            'Content-Type': 'application/json'
          }
        }
      );

      // Nom du fichier
      const timestamp = new Date().getTime();
      const fileName = `Rapport_Sol_${timestamp}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Convertir ArrayBuffer en base64
      const arrayBuffer = response.data;
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64data = btoa(binary);

      // Écrire le fichier sur le téléphone
      await FileSystem.writeAsStringAsync(fileUri, base64data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Ne pas partager automatiquement - le partage se fera depuis la page rapport
      return {
        success: true,
        uri: fileUri,
        fileName: fileName
      };

    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      console.error('❌ Message d\'erreur:', error.message);
      console.error('❌ Réponse serveur:', error.response?.data);
      console.error('❌ Status:', error.response?.status);

      // Message d'erreur convivial
      let errorMessage = 'Impossible de générer le rapport.';

      if (error.message?.includes('timeout')) {
        errorMessage = 'Le serveur met trop de temps à répondre. Veuillez réessayer.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Erreur réseau. Vérifiez que:\n1. Le backend est démarré\n2. L\'URL ngrok est à jour dans config/api.js\n3. Votre connexion internet fonctionne';
      } else if (error.response?.status === 400) {
        errorMessage = 'Données d\'analyse invalides.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur lors de la génération du PDF.';
      }

      Alert.alert('Erreur', errorMessage);
      throw error;
    }
  }

  /**
   * Ouvrir ou partager le PDF
   */
  async openOrSharePDF(fileUri, fileName) {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Afficher le menu de partage natif
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Rapport d\'analyse de sol',
          UTI: 'com.adobe.pdf'
        });

      } else {
        // Fallback pour Android : copier dans Downloads
        if (Platform.OS === 'android') {
          try {
            const downloadUri = `${FileSystem.documentDirectory}../Download/${fileName}`;
            await FileSystem.copyAsync({
              from: fileUri,
              to: downloadUri
            });

            Alert.alert(
              '✅ Rapport enregistré',
              `Le rapport a été enregistré dans :\nTéléchargements/${fileName}`,
              [{ text: 'OK' }]
            );
          } catch (copyError) {
            console.error('⚠️ Impossible de copier dans Downloads:', copyError);
            
            Alert.alert(
              '✅ Rapport généré',
              'Le rapport a été généré avec succès.',
              [{ text: 'OK' }]
            );
          }
        } else {
          Alert.alert(
            '✅ Rapport généré',
            'Le rapport a été généré avec succès.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('❌ Erreur partage:', error);
      
      // Même en cas d'erreur de partage, le fichier existe
      Alert.alert(
        '✅ Rapport généré',
        'Le rapport a été créé mais impossible de l\'ouvrir automatiquement.',
        [{ text: 'OK' }]
      );
    }
  }
}

export default new ReportService();