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

export default function ConseilsScreen() {
  const params = useLocalSearchParams();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('agriculteur');

  useEffect(() => {
    const loadData = () => {
      if (params.data) {
        try {
          const data = JSON.parse(params.data);
          console.log('💡 Données pour conseils:', data);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f39c12" />
        <Text style={styles.loadingText}>Chargement des recommandations...</Text>
      </View>
    );
  }

  if (!analysisData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bulb-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Aucune recommandation disponible</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/(tabs)/location')}
        >
          <Text style={styles.emptyButtonText}>Faire une analyse</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { analyse, cultures_suggerees, score_fertilite } = analysisData;

  const renderRecommendationCard = (title, icon, color, recommandations, interpretation) => {
    if (!recommandations || recommandations.length === 0) return null;

    return (
      <View style={styles.recommendationCard} key={title}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={28} color={color} />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>

        {interpretation && (
          <View style={styles.interpretationBox}>
            <Ionicons name="information-circle" size={18} color="#666" />
            <Text style={styles.interpretationText}>{interpretation}</Text>
          </View>
        )}

        <View style={styles.recommendationsList}>
          {recommandations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color={color} />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#8bc34a';
    if (score >= 40) return '#ff9800';
    if (score >= 20) return '#ff5722';
    return '#f44336';
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
          {userType === 'promoteur' ? 'Recommandations Construction' : 'Recommandations'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {userType === 'promoteur'
            ? 'Conseils pour votre projet de construction'
            : 'Conseils personnalisés pour votre parcelle agricole'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score de fertilité */}
        {score_fertilite && (
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Ionicons name="star" size={32} color="#f39c12" />
              <Text style={styles.scoreTitle}>Score de fertilité</Text>
            </View>
            <View style={styles.scoreContent}>
              <Text style={styles.scoreValue}>{score_fertilite.score}/100</Text>
              <Text style={styles.scoreLevel}>{score_fertilite.niveau}</Text>
            </View>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  { width: `${score_fertilite.score}%`, backgroundColor: getScoreColor(score_fertilite.score) }
                ]}
              />
            </View>
          </View>
        )}

        {/* Recommandations par paramètre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandations détaillées</Text>

          {analyse?.ph &&
            renderRecommendationCard(
              'pH du sol',
              'water',
              '#2196f3',
              analyse.ph.recommandations,
              analyse.ph.interpretation
            )}

          {analyse?.salinite &&
            renderRecommendationCard(
              'Salinité',
              'flash',
              '#ff9800',
              analyse.salinite.recommandations,
              analyse.salinite.interpretation
            )}

          {analyse?.phosphore &&
            renderRecommendationCard(
              'Phosphore (P)',
              'leaf',
              '#4caf50',
              analyse.phosphore.recommandations,
              analyse.phosphore.interpretation
            )}

          {analyse?.potassium &&
            renderRecommendationCard(
              'Potassium (K)',
              'nutrition',
              '#9c27b0',
              analyse.potassium.recommandations,
              analyse.potassium.interpretation
            )}

          {analyse?.texture &&
            renderRecommendationCard(
              'Texture du sol',
              'layers',
              '#795548',
              analyse.texture.recommandations,
              analyse.texture.interpretation
            )}

          {analyse?.matiere_organique &&
            renderRecommendationCard(
              'Matière organique',
              'flower',
              '#8bc34a',
              analyse.matiere_organique.recommandations,
              analyse.matiere_organique.interpretation
            )}
        </View>

        {/* Cultures suggérées - Uniquement pour les agriculteurs */}
        {userType === 'agriculteur' && cultures_suggerees && cultures_suggerees.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cultures recommandées</Text>
            <View style={styles.culturesGrid}>
              {cultures_suggerees.map((culture, index) => (
                <View key={index} style={styles.cultureCard}>
                  <View style={styles.cultureIcon}>
                    <Ionicons name="leaf" size={24} color="#2ecc71" />
                  </View>
                  <Text style={styles.cultureName}>{culture.nom}</Text>
                  <View style={styles.cultureDetails}>
                    <Text style={styles.cultureLabel}>Adaptation</Text>
                    <Text style={styles.cultureValue}>{culture.adaptation}</Text>
                  </View>
                  <View style={styles.cultureDetails}>
                    <Text style={styles.cultureLabel}>Rendement</Text>
                    <Text style={styles.cultureValue}>{culture.rendement_potentiel}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recommandations générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conseils généraux</Text>
          <View style={styles.generalCard}>
            {userType === 'agriculteur' ? (
              <>
                <View style={styles.generalItem}>
                  <Ionicons name="water-outline" size={24} color="#2196f3" />
                  <View style={styles.generalContent}>
                    <Text style={styles.generalTitle}>Irrigation</Text>
                    <Text style={styles.generalText}>
                      Adaptez la fréquence d'irrigation en fonction de la texture de votre sol et des besoins de la culture.
                    </Text>
                  </View>
                </View>

                <View style={styles.generalItem}>
                  <Ionicons name="calendar-outline" size={24} color="#4caf50" />
                  <View style={styles.generalContent}>
                    <Text style={styles.generalTitle}>Rotation des cultures</Text>
                    <Text style={styles.generalText}>
                      Pratiquez la rotation avec des légumineuses pour améliorer la structure et la fertilité du sol.
                    </Text>
                  </View>
                </View>

                <View style={styles.generalItem}>
                  <Ionicons name="shield-checkmark-outline" size={24} color="#f39c12" />
                  <View style={styles.generalContent}>
                    <Text style={styles.generalTitle}>Protection du sol</Text>
                    <Text style={styles.generalText}>
                      Utilisez des couvertures végétales pour protéger le sol de l'érosion et maintenir l'humidité.
                    </Text>
                  </View>
                </View>

                <View style={styles.generalItem}>
                  <Ionicons name="analytics-outline" size={24} color="#9c27b0" />
                  <View style={styles.generalContent}>
                    <Text style={styles.generalTitle}>Suivi régulier</Text>
                    <Text style={styles.generalText}>
                      Effectuez une analyse de sol tous les 2-3 ans pour ajuster vos pratiques de fertilisation.
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.generalItem}>
                  <Ionicons name="construct-outline" size={24} color="#e74c3c" />
                  <View style={styles.generalContent}>
                    <Text style={styles.generalTitle}>Fondations adaptées</Text>
                    <Text style={styles.generalText}>
                      Choisissez un type de fondation adapté à la capacité portante du sol. Sols argileux : fondations profondes. Sols sableux : semelles filantes renforcées.
                    </Text>
                  </View>
                </View>

                <View style={styles.generalItem}>
                  <Ionicons name="hand-left-outline" size={24} color="#2196f3" />
                  <View style={styles.generalContent}>
                    <Text style={styles.generalTitle}>Drainage du terrain</Text>
                    <Text style={styles.generalText}>
                      Installez un système de drainage périphérique pour évacuer les eaux pluviales et protéger les fondations de l'humidité.
                    </Text>
                  </View>
                </View>

                <View style={styles.generalItem}>
                  <Ionicons name="warning-outline" size={24} color="#f39c12" />
                  <View style={styles.generalContent}>
                    <Text style={styles.generalTitle}>Étude géotechnique</Text>
                    <Text style={styles.generalText}>
                      Faites réaliser une étude géotechnique complète avant tout projet de construction pour dimensionner correctement les fondations.
                    </Text>
                  </View>
                </View>

                <View style={styles.generalItem}>
                  <Ionicons name="layers-outline" size={24} color="#9c27b0" />
                  <View style={styles.generalContent}>
                    <Text style={styles.generalTitle}>Tassement différentiel</Text>
                    <Text style={styles.generalText}>
                      Surveillez les risques de tassement différentiel, particulièrement en sols argileux ou compressibles. Prévoir des joints de dilatation.
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

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
    backgroundColor: '#f39c12',
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
    backgroundColor: '#f39c12',
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
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  scoreLevel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  scoreBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  interpretationBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 10,
  },
  interpretationText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  recommendationsList: {
    gap: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  culturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cultureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: (width - 45) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cultureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cultureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cultureDetails: {
    marginTop: 5,
  },
  cultureLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  cultureValue: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  generalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    gap: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  generalItem: {
    flexDirection: 'row',
    gap: 15,
  },
  generalContent: {
    flex: 1,
  },
  generalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  generalText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
