// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing    from 'expo-sharing';
import reportService from '../../services/reportService';

export default function RapportScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPDF();
  }, []);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les données d'analyse depuis les params
      if (!params.data) {
        throw new Error('Aucune donnée d\'analyse fournie');
      }

      const analysisData = JSON.parse(params.data);
      console.log('📄 Génération du PDF pour affichage...');

      // Générer le PDF
      const result = await reportService.generateReport(analysisData);

      if (result.success && result.uri) {
        console.log('✅ PDF prêt à afficher:', result.uri);
        setPdfUri(result.uri);
      } else {
        throw new Error('Échec de la génération du PDF');
      }

    } catch (err) {
      console.error('❌ Erreur chargement PDF:', err);
      setError(err.message || 'Impossible de charger le PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!pdfUri) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Télécharger ou partager le rapport',
          UTI: 'com.adobe.pdf'
        });

        console.log('✅ Menu de téléchargement/partage ouvert');
      } else {
        Alert.alert('Info', 'Le téléchargement n\'est pas disponible sur cet appareil');
      }
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      Alert.alert('Erreur', 'Impossible de télécharger le PDF');
    }
  };

  const handleReload = () => {
    loadPDF();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rapport PDF</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ecc71" />
          <Text style={styles.loadingText}>Génération du rapport en cours...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rapport PDF</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rapport PDF</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleShare} style={styles.headerIconButton}>
            <Ionicons name="download-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* PDF Viewer - Affichage simplifié pour mobile */}
      {pdfUri && Platform.OS === 'android' ? (
        <View style={styles.androidPdfContainer}>
          <View style={styles.pdfPlaceholder}>
            <Ionicons name="document-text" size={100} color="#2ecc71" />
            <Text style={styles.pdfTitle}>Rapport PDF généré avec succès</Text>
            <Text style={styles.pdfSubtitle}>
              Utilisez le bouton de téléchargement ci-dessus pour ouvrir le rapport dans votre lecteur PDF préféré
            </Text>

            <TouchableOpacity
              style={styles.openPdfButton}
              onPress={handleShare}
            >
              <Ionicons name="open-outline" size={24} color="#fff" />
              <Text style={styles.openPdfButtonText}>Ouvrir le rapport</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : pdfUri ? (
        <WebView
          source={{ uri: pdfUri }}
          style={styles.webview}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            setError('Erreur lors du chargement du PDF');
          }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2ecc71" />
            </View>
          )}
        />
      ) : null}

      {/* Note de téléchargement */}
      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          💡 Cliquez sur l'icône de téléchargement (en haut à droite) pour enregistrer ou partager le rapport
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2ecc71',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  androidPdfContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pdfPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
  },
  pdfTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  pdfSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  openPdfButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  openPdfButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  noteContainer: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ffc107',
  },
  noteText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
});
