//@ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import soilService from '../../services/soilService';
import authService from '../../services/authService';


const { width, height } = Dimensions.get('window');


export default function LocationAndParcelScreen() {
  const [loading, setLoading] = useState(false);
  const [analyzingLocation, setAnalyzingLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 14.6937,
    longitude: -17.4441,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [userType, setUserType] = useState('agriculteur'); // Type d'utilisateur

  // Données du formulaire
  const [usageSol, setUsageSol] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [historique, setHistorique] = useState('');
  const [cultureSouhaitee, setCultureSouhaitee] = useState('');

  const mapRef = useRef<MapView>(null);

  // Récupérer le type d'utilisateur au chargement
  useEffect(() => {
    const loadUserType = async () => {
      try {
        const user = await authService.getUser();
        if (user && user.type_utilisateur) {
          setUserType(user.type_utilisateur);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du type utilisateur:', error);
      }
    };
    loadUserType();
  }, []);

  // Fonction pour obtenir l'adresse à partir des coordonnées
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationParts = [];

        if (address.district) locationParts.push(address.district);
        if (address.city) locationParts.push(address.city);
        if (address.subregion) locationParts.push(address.subregion);
        if (address.region) locationParts.push(address.region);
        if (address.country) locationParts.push(address.country);

        const fullAddress = locationParts.join(', ') || 'Localisation inconnue';
        setLocationAddress(fullAddress);
        return fullAddress;
      }
      return 'Localisation inconnue';
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      return 'Localisation inconnue';
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'L\'accès à la localisation est nécessaire pour cette fonctionnalité.'
        );
        setLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setAnalyzingLocation(newLocation);

      const newRegion = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      // Obtenir l'adresse de la localisation
      await getAddressFromCoordinates(position.coords.latitude, position.coords.longitude);

      Alert.alert('Succès', 'Position GPS obtenue avec succès !');
    } catch (error: any) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible d\'obtenir la position GPS');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocation = async () => {
    if (!manualLat || !manualLon) {
      Alert.alert('Erreur', 'Veuillez entrer la latitude et la longitude');
      return;
    }

    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    if (isNaN(lat) || isNaN(lon)) {
      Alert.alert('Erreur', 'Coordonnées invalides');
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      Alert.alert('Erreur', 'Coordonnées hors limites');
      return;
    }

    const newLocation = {
      latitude: lat,
      longitude: lon,
      manual: true,
    };

    setAnalyzingLocation(newLocation);

    const newRegion = {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setRegion(newRegion);

    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }

    // Obtenir l'adresse de la localisation manuelle
    await getAddressFromCoordinates(lat, lon);

    setShowManualInput(false);
    setManualLat('');
    setManualLon('');

    Alert.alert('Succès', 'Position définie manuellement !');
  };

  const handleZoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleZoomOut = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleRecenter = () => {
    if (analyzingLocation && mapRef.current) {
      const newRegion = {
        latitude: analyzingLocation.latitude,
        longitude: analyzingLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
      setRegion(newRegion);
    }
  };

  const handleAnalyze = async () => {
    // Validation
    if (!analyzingLocation) {
      Alert.alert('Attention', 'Veuillez d\'abord définir une position sur la carte');
      return;
    }

    if (!superficie) {
      Alert.alert('Attention', 'Veuillez entrer la superficie de votre parcelle');
      return;
    }

    setLoading(true);
    try {
      // Appel à l'API d'analyse
      const result = await soilService.analyzeSoil(
        analyzingLocation.latitude,
        analyzingLocation.longitude,
        10 // rayon de recherche en km
      );
      
      if (result.success) {
        // Préparer les données à passer à la page d'analyse
        const analysisData = {
          ...result.data,
          donnees_parcelle: {
            superficie: parseFloat(superficie),
            usage_sol: usageSol,
            historique: historique,
            culture_souhaitee: cultureSouhaitee,
            type_utilisateur: userType, // Type d'utilisateur (agriculteur/promoteur)
            position: {
              latitude: analyzingLocation.latitude,
              longitude: analyzingLocation.longitude,
              address: locationAddress || 'Localisation inconnue'
            }
          }
        };
        
        // Navigation vers la page d'analyse avec les données
        router.push({
          pathname: '/(tabs)/analyse',
          params: { 
            data: JSON.stringify(analysisData)
          }
        });
      } else {
        Alert.alert('Erreur', result.message || 'Analyse impossible');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      Alert.alert(
        'Erreur', 
        error.message || 'Impossible de réaliser l\'analyse. Vérifiez votre connexion.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🌱 Localisation & Parcelle</Text>
          <Text style={styles.headerSubtitle}>Sélectionnez votre parcelle</Text>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {/* Map Type Toggle */}
        <View style={styles.mapTypeContainer}>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'standard' && styles.mapTypeButtonActive]}
            onPress={() => setMapType('standard')}
          >
            <Text style={[styles.mapTypeText, mapType === 'standard' && styles.mapTypeTextActive]}>
              Carte
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'satellite' && styles.mapTypeButtonActive]}
            onPress={() => setMapType('satellite')}
          >
            <Text style={[styles.mapTypeText, mapType === 'satellite' && styles.mapTypeTextActive]}>
              Satellite
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          mapType={mapType}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {analyzingLocation && (
            <Marker
              coordinate={{
                latitude: analyzingLocation.latitude,
                longitude: analyzingLocation.longitude,
              }}
              title={analyzingLocation.manual ? "Position manuelle" : "Ma position"}
            />
          )}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
            <Text style={styles.controlButtonText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleRecenter}>
            <Ionicons name="locate" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Coordinates Display */}
        {analyzingLocation && (
          <View style={styles.coordinatesBox}>
            <Text style={styles.coordinatesText}>
              {analyzingLocation.latitude.toFixed(4)}°N, {Math.abs(analyzingLocation.longitude).toFixed(4)}°{analyzingLocation.longitude < 0 ? 'W' : 'E'}
            </Text>
            {locationAddress && (
              <Text style={styles.addressText} numberOfLines={2}>
                {locationAddress}
              </Text>
            )}
          </View>
        )}

        {/* Scale */}
        <View style={styles.scaleBox}>
          <View style={styles.scaleLine} />
          <Text style={styles.scaleText}>~{Math.round(region.latitudeDelta * 111)}km</Text>
        </View>
      </View>

      {/* Bottom Content */}
      <ScrollView 
        style={styles.bottomContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* GPS Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.gpsButton]}
            onPress={handleGetCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Ma position GPS</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.manualButton]}
            onPress={() => setShowManualInput(true)}
          >
            <Ionicons name="create" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Position manuelle</Text>
          </TouchableOpacity>
        </View>

        {/* Usage du sol */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage du sol *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={usageSol}
              onValueChange={(itemValue) => setUsageSol(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Sélectionnez l'usage" value="" />
              <Picker.Item label="🌾 Agriculture - Cultures annuelles" value="cultures_annuelles" />
              <Picker.Item label="🌳 Agriculture - Cultures pérennes" value="cultures_perennes" />
              <Picker.Item label="🥬 Maraîchage" value="maraichage" />
              <Picker.Item label="🏗️ Construction résidentielle" value="construction_residentielle" />
              <Picker.Item label="🏭 Construction industrielle" value="construction_industrielle" />
              <Picker.Item label="🌱 Agroforesterie" value="agroforesterie" />
            </Picker>
          </View>
        </View>

        {/* Culture souhaitée (si agriculture) */}
        {usageSol && usageSol.includes('agriculture') || usageSol === 'maraichage' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Culture souhaitée (optionnel)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={cultureSouhaitee}
                onValueChange={(itemValue) => setCultureSouhaitee(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionnez une culture" value="" />
                <Picker.Item label="Maïs" value="maïs" />
                <Picker.Item label="Riz" value="riz" />
                <Picker.Item label="Mil" value="mil" />
                <Picker.Item label="Sorgho" value="sorgho" />
                <Picker.Item label="Arachide" value="arachide" />
                <Picker.Item label="Niébé" value="niébé" />
                <Picker.Item label="Tomate" value="tomate" />
                <Picker.Item label="Oignon" value="oignon" />
                <Picker.Item label="Piment" value="piment" />
                <Picker.Item label="Aubergine" value="aubergine" />
                <Picker.Item label="Pastèque" value="pastèque" />
                <Picker.Item label="Manioc" value="manioc" />
              </Picker>
            </View>
          </View>
        ) : null}

        {/* Superficie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Superficie (hectares) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2.5"
            keyboardType="decimal-pad"
            value={superficie}
            onChangeText={setSuperficie}
          />
        </View>

        {/* Historique */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique (optionnel)</Text>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#3498db" />
            <Text style={styles.infoText}>
              Culture précédente, inondation, salinité, etc.
            </Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={historique}
              onValueChange={(itemValue) => setHistorique(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Sélectionnez si applicable" value="" />
              <Picker.Item label="Culture précédente de céréales" value="cereales" />
              <Picker.Item label="Culture précédente de légumineuses" value="legumineuses" />
              <Picker.Item label="Jachère récente (1-2 ans)" value="jachere_recente" />
              <Picker.Item label="Jachère ancienne (>3 ans)" value="jachere_ancienne" />
              <Picker.Item label="Inondation fréquente" value="inondation" />
              <Picker.Item label="Problème de salinité" value="salinite" />
              <Picker.Item label="Sol vierge" value="vierge" />
            </Picker>
          </View>
        </View>

        {/* Launch Analysis Button */}
        <TouchableOpacity 
          style={[styles.launchButton, loading && styles.launchButtonDisabled]}
          onPress={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={styles.launchButtonText}>Analyse en cours...</Text>
            </>
          ) : (
            <>
              <Text style={styles.launchButtonText}>Lancer l'analyse</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for Manual Input */}
      <Modal
        visible={showManualInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualInput(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Entrer les coordonnées</Text>
              <TouchableOpacity onPress={() => setShowManualInput(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Latitude</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: 14.6937"
                value={manualLat}
                onChangeText={setManualLat}
                keyboardType="numbers-and-punctuation"
              />

              <Text style={styles.modalLabel}>Longitude</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: -17.4441"
                value={manualLon}
                onChangeText={setManualLon}
                keyboardType="numbers-and-punctuation"
              />

              <View style={styles.modalHint}>
                <Ionicons name="information-circle" size={18} color="#666" />
                <Text style={styles.modalHintText}>
                  Latitude: -90 à 90 • Longitude: -180 à 180
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowManualInput(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleManualLocation}
              >
                <Text style={styles.modalButtonText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2ecc71',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {},
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  mapContainer: {
    height: height * 0.3,
    position: 'relative',
  },
  mapTypeContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mapTypeButtonActive: {
    backgroundColor: '#2ecc71',
  },
  mapTypeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  mapTypeTextActive: {
    color: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapControls: {
    position: 'absolute',
    right: 15,
    top: '25%',
    gap: 8,
    zIndex: 10,
  },
  controlButton: {
    width: 38,
    height: 38,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  controlButtonText: {
    fontSize: 22,
    color: '#333',
    fontWeight: '300',
  },
  coordinatesBox: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    maxWidth: '60%',
  },
  coordinatesText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 10,
    color: '#666',
    marginTop: 3,
    fontWeight: '400',
  },
  scaleBox: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    alignItems: 'center',
  },
  scaleLine: {
    width: 50,
    height: 2,
    backgroundColor: '#333',
    marginBottom: 2,
  },
  scaleText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
  },
  bottomContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContentContainer: {
    paddingBottom: 120,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gpsButton: {
    backgroundColor: '#3498db',
  },
  manualButton: {
    backgroundColor: '#9b59b6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 12,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    fontSize: 15,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1976d2',
  },
  launchButton: {
    flexDirection: 'row',
    backgroundColor: '#2ecc71',
    margin: 12,
    marginTop: 5,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  launchButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  launchButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  modalHintText: {
    fontSize: 13,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
  },
  modalButtonConfirm: {
    backgroundColor: '#2ecc71',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextCancel: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});