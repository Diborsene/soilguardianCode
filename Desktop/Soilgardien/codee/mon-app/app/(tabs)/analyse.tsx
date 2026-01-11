// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AnalyseScreen() {
  const params = useLocalSearchParams();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('agriculteur');

  useEffect(() => {
    const loadData = () => {
      if (params.data) {
        try {
          const data = JSON.parse(params.data);
          console.log('📊 Données d\'analyse:', data);
          setAnalysisData(data);

          // Récupérer le type d'utilisateur depuis les données
          if (data.donnees_parcelle?.type_utilisateur) {
            setUserType(data.donnees_parcelle.type_utilisateur);
          }

          setLoading(false);
        } catch (error) {
          console.error('Erreur parsing:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [params.data]);

  /**
   * Fonction pour afficher le rapport PDF
   */
  const handleViewReport = () => {
    // Naviguer vers la page rapport avec les données
    router.push({
      pathname: '/(tabs)/rapport',
      params: {
        data: JSON.stringify(analysisData)
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Chargement de l'analyse...</Text>
      </View>
    );
  }

  if (!analysisData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="leaf-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Aucune analyse disponible</Text>
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={() => router.push('/(tabs)/location')}
        >
          <Text style={styles.emptyButtonText}>Faire une analyse</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { donnees_brutes, analyse } = analysisData;

  const getStatusColor = (optimal) => {
    return optimal ? '#2ecc71' : '#f39c12';
  };

  const getStatusBadge = (optimal) => {
    return optimal ? 'Optimal' : 'À améliorer';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {userType === 'promoteur' ? 'Analyse du terrain' : 'Paramètres du sol'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {userType === 'promoteur'
            ? 'Étude de faisabilité pour votre projet de construction'
            : 'Analyse détaillée de votre parcelle agricole'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Informations de la parcelle */}
        {analysisData.donnees_parcelle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations de la parcelle</Text>
            <View style={styles.infoCard}>
              {analysisData.donnees_parcelle.position?.address && (
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={20} color="#2ecc71" />
                  <Text style={styles.infoLabel}>Localisation :</Text>
                  <Text style={styles.infoValue}>{analysisData.donnees_parcelle.position.address}</Text>
                </View>
              )}
              {analysisData.donnees_parcelle.superficie && (
                <View style={styles.infoRow}>
                  <Ionicons name="resize" size={20} color="#3498db" />
                  <Text style={styles.infoLabel}>Superficie :</Text>
                  <Text style={styles.infoValue}>{analysisData.donnees_parcelle.superficie} ha</Text>
                </View>
              )}
              {analysisData.donnees_parcelle.usage_sol && (
                <View style={styles.infoRow}>
                  <Ionicons name="leaf" size={20} color="#27ae60" />
                  <Text style={styles.infoLabel}>Usage du sol :</Text>
                  <Text style={styles.infoValue}>{analysisData.donnees_parcelle.usage_sol}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Paramètres mesurés */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres mesurés</Text>

          {/* pH */}
          {analyse?.ph && (
            <View style={styles.paramCard}>
              <View style={styles.paramHeader}>
                <View style={[styles.paramIcon, { backgroundColor: '#e3f2fd' }]}>
                  <Ionicons name="water" size={24} color="#2196f3" />
                </View>
                <View style={styles.paramInfo}>
                  <Text style={styles.paramName}>pH du sol</Text>
                  <Text style={styles.paramValue}>{analyse.ph.valeur}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(analyse.ph.optimal) }]}>
                  <Text style={styles.statusText}>{getStatusBadge(analyse.ph.optimal)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Conductivité électrique */}
          {donnees_brutes?.conductivite_electrique_dS_m != null && (
            <View style={styles.paramCard}>
              <View style={styles.paramHeader}>
                <View style={[styles.paramIcon, { backgroundColor: '#fff3e0' }]}>
                  <Ionicons name="flash" size={24} color="#ff9800" />
                </View>
                <View style={styles.paramInfo}>
                  <Text style={styles.paramName}>Conductivité électrique (Salinité)</Text>
                  <Text style={styles.paramValue}>{donnees_brutes.conductivite_electrique_dS_m} dS/m</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(analyse?.salinite?.optimal) }]}>
                  <Text style={styles.statusText}>{getStatusBadge(analyse?.salinite?.optimal)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Matière organique */}
          {donnees_brutes?.matiere_organique_percent != null && (
            <View style={styles.paramCard}>
              <View style={styles.paramHeader}>
                <View style={[styles.paramIcon, { backgroundColor: '#e8f5e9' }]}>
                  <Ionicons name="leaf" size={24} color="#4caf50" />
                </View>
                <View style={styles.paramInfo}>
                  <Text style={styles.paramName}>Matière organique</Text>
                  <Text style={styles.paramValue}>{donnees_brutes.matiere_organique_percent} %</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#fff59d' }]}>
                  <Text style={styles.statusText}>À améliorer</Text>
                </View>
              </View>
            </View>
          )}

          {/* Azote */}
          {donnees_brutes?.azote_total != null && (
            <View style={styles.paramCard}>
              <View style={styles.paramHeader}>
                <View style={[styles.paramIcon, { backgroundColor: '#f3e5f5' }]}>
                  <Ionicons name="analytics" size={24} color="#9c27b0" />
                </View>
                <View style={styles.paramInfo}>
                  <Text style={styles.paramName}>Azote (N)</Text>
                  <Text style={styles.paramValue}>{donnees_brutes.azote_total} %</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(true) }]}>
                  <Text style={styles.statusText}>Optimal</Text>
                </View>
              </View>
            </View>
          )}

          {/* Phosphore */}
          {donnees_brutes?.phosphore_ppm != null && (
            <View style={styles.paramCard}>
              <View style={styles.paramHeader}>
                <View style={[styles.paramIcon, { backgroundColor: '#fce4ec' }]}>
                  <Ionicons name="triangle" size={24} color="#e91e63" />
                </View>
                <View style={styles.paramInfo}>
                  <Text style={styles.paramName}>Phosphore (P)</Text>
                  <Text style={styles.paramValue}>{donnees_brutes.phosphore_ppm} ppm</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(analyse?.phosphore?.optimal) }]}>
                  <Text style={styles.statusText}>{getStatusBadge(analyse?.phosphore?.optimal)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Potassium */}
          {donnees_brutes?.potassium_ppm != null && (
            <View style={styles.paramCard}>
              <View style={styles.paramHeader}>
                <View style={[styles.paramIcon, { backgroundColor: '#fff3e0' }]}>
                  <Ionicons name="grid" size={24} color="#ff9800" />
                </View>
                <View style={styles.paramInfo}>
                  <Text style={styles.paramName}>Potassium (K)</Text>
                  <Text style={styles.paramValue}>{donnees_brutes.potassium_ppm} ppm</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(analyse?.potassium?.optimal) }]}>
                  <Text style={styles.statusText}>{getStatusBadge(analyse?.potassium?.optimal)}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Graphique Texture du sol (Barres simples) */}
        {donnees_brutes?.texture && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Texture du sol</Text>
            <View style={styles.chartCard}>
              <View style={styles.barChart}>
                <View style={styles.barItem}>
                  <Text style={styles.barLabel}>Sable</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { 
                      width: `${(donnees_brutes.texture.sable_percent || 0)}%`,
                      backgroundColor: '#2ecc71'
                    }]} />
                  </View>
                  <Text style={styles.barValue}>{donnees_brutes.texture.sable_percent || 0}%</Text>
                </View>
                <View style={styles.barItem}>
                  <Text style={styles.barLabel}>Limon</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { 
                      width: `${(donnees_brutes.texture.limon_percent || 0)}%`,
                      backgroundColor: '#3498db'
                    }]} />
                  </View>
                  <Text style={styles.barValue}>{donnees_brutes.texture.limon_percent || 0}%</Text>
                </View>
                <View style={styles.barItem}>
                  <Text style={styles.barLabel}>Argile</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { 
                      width: `${(donnees_brutes.texture.argile_percent || 0)}%`,
                      backgroundColor: '#e74c3c'
                    }]} />
                  </View>
                  <Text style={styles.barValue}>{donnees_brutes.texture.argile_percent || 0}%</Text>
                </View>
              </View>
              <Text style={styles.chartDescription}>
                {analyse?.texture?.texture || 'Sol équilibré'} : bonne rétention d'eau et nutriments
              </Text>
            </View>
          </View>
        )}

        {/* Score de fertilité */}
        {analyse?.score_fertilite && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Score de fertilité</Text>
            <View style={styles.scoreCard}>
              <View style={styles.scoreCircle}>
                <Text style={[styles.scoreValue, { color: getStatusColor(analyse.score_fertilite.score >= 60) }]}>
                  {analyse.score_fertilite.score}
                </Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
              <Text style={[styles.scoreLevel, { color: getStatusColor(analyse.score_fertilite.score >= 60) }]}>
                {analyse.score_fertilite.niveau}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { 
                  width: `${analyse.score_fertilite.score}%`,
                  backgroundColor: getStatusColor(analyse.score_fertilite.score >= 60)
                }]} />
              </View>
            </View>
          </View>
        )}

        {/* Indicateurs complémentaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicateurs complémentaires</Text>

          {/* Humidité du sol */}
          <View style={styles.indicatorCard}>
            <View style={styles.indicatorHeader}>
              <Text style={styles.indicatorName}>Humidité du sol</Text>
              <Text style={styles.indicatorValue}>32%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '32%', backgroundColor: '#2196f3' }]} />
            </View>
          </View>

          {/* Vie microbienne */}
          <View style={styles.indicatorCard}>
            <View style={styles.indicatorHeader}>
              <Text style={styles.indicatorName}>Vie microbienne</Text>
              <Text style={[styles.indicatorBadge, { backgroundColor: '#4caf50' }]}>Élevée</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '80%', backgroundColor: '#4caf50' }]} />
            </View>
          </View>

          {/* Capacité portante */}
          <View style={styles.indicatorCard}>
            <View style={styles.indicatorHeader}>
              <Text style={styles.indicatorName}>Capacité portante</Text>
              <Text style={[styles.indicatorBadge, { backgroundColor: '#2ecc71' }]}>Bonne</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '65%', backgroundColor: '#2ecc71' }]} />
            </View>
          </View>
        </View>

        {/* Risques géotechniques */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={24} color="#ff9800" />
            <Text style={styles.warningTitle}>Risques géotechniques</Text>
          </View>
          <View style={styles.warningItem}>
            <Text style={styles.warningBullet}>•</Text>
            <Text style={styles.warningText}>Zones inondables : <Text style={styles.warningValue}>Faible risque</Text></Text>
          </View>
          <View style={styles.warningItem}>
            <Text style={styles.warningBullet}>•</Text>
            <Text style={styles.warningText}>Phénomène de retrait : <Text style={styles.warningValue}>Non détecté</Text></Text>
          </View>
          <View style={styles.warningItem}>
            <Text style={styles.warningBullet}>•</Text>
            <Text style={styles.warningText}>Boulance : <Text style={styles.warningValue}>Risque négligeable</Text></Text>
          </View>
        </View>

        {/* Bouton Recommandations */}
        <TouchableOpacity
          style={styles.recommendationButton}
          onPress={() => router.push({
            pathname: '/(tabs)/conseils',
            params: {
              data: JSON.stringify(analysisData)
            }
          })}
        >
          <Ionicons name="bulb" size={24} color="#fff" />
          <Text style={styles.recommendationText}>Voir les recommandations</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Bouton Voir le rapport PDF */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleViewReport}
        >
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.downloadText}>Voir le rapport PDF</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 10,
    marginRight: 5,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  paramCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  paramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paramIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paramInfo: {
    flex: 1,
  },
  paramName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paramValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  barChart: {
    gap: 15,
  },
  barItem: {
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  barContainer: {
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 15,
  },
  barValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
    textAlign: 'right',
  },
  chartDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 16,
    color: '#999',
  },
  scoreLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  indicatorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  indicatorName: {
    fontSize: 14,
    color: '#666',
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  indicatorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  warningItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  warningBullet: {
    fontSize: 16,
    color: '#4caf50',
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  warningValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  recommendationButton: {
    flexDirection: 'row',
    backgroundColor: '#f39c12',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  recommendationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  downloadButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});