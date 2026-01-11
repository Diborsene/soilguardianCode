import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  nom_complet: string;
  telephone: string;
  type_utilisateur: 'agriculteur' | 'promoteur' | 'collectivite';
  ville: string;
  region: string;
}

export default function SignupScreen() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nom_complet: '',
    telephone: '',
    type_utilisateur: 'agriculteur',
    ville: '',
    region: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.nom_complet) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.register(formData);
      console.log('✅ Inscription réussie:', result);

      Alert.alert('Succès', 'Inscription réussie !', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error);
      Alert.alert(
        'Erreur d\'inscription',
        error.message || 'Une erreur est survenue lors de l\'inscription'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.requiredNote}>* Champs obligatoires</Text>

        <TextInput
          style={styles.input}
          placeholder="Nom complet *"
          value={formData.nom_complet}
          onChangeText={(value) => updateField('nom_complet', value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Téléphone (ex: 221771234567)"
          value={formData.telephone}
          onChangeText={(value) => updateField('telephone', value)}
          keyboardType="phone-pad"
          editable={!loading}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Type d'utilisateur</Text>
          <Picker
            selectedValue={formData.type_utilisateur}
            onValueChange={(value) => updateField('type_utilisateur', value as any)}
            enabled={!loading}
            style={styles.picker}
          >
            <Picker.Item label="🌾 Agriculteur" value="agriculteur" />
            <Picker.Item label="🏢 Promoteur" value="promoteur" />
            <Picker.Item label="🏛️ Collectivité" value="collectivite" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ville (ex: Dakar)"
          value={formData.ville}
          onChangeText={(value) => updateField('ville', value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Région (ex: Dakar)"
          value={formData.region}
          onChangeText={(value) => updateField('region', value)}
          editable={!loading}
        />

        {/* Champ Mot de passe avec icône */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Mot de passe * (min. 6 caractères)"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Champ Confirmer mot de passe avec icône */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirmer le mot de passe *"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  requiredNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingVertical: 5,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  picker: {
    height: 50,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#95e1b3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#2ecc71',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
});