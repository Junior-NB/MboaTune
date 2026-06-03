import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Spacing, FontSize } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import LinearGradient from 'react-native-linear-gradient';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, profile, updateProfile } = useAuthStore();
  
  const [username, setUsername] = useState(profile?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur ne peut pas être vide.');
      return;
    }
    setSavingUsername(true);
    const { error } = await updateProfile({ username: username.trim(), display_name: username.trim() } as any);
    setSavingUsername(false);
    
    if (error) {
      Alert.alert('Erreur', error);
    } else {
      Alert.alert('Succès', 'Nom d\'utilisateur mis à jour.');
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Erreur', 'Veuillez remplir les deux champs de mot de passe.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    
    setSavingPassword(true);
    
    // Vérifier l'ancien mot de passe en tentant une connexion
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });
    
    if (signInError) {
      setSavingPassword(false);
      Alert.alert('Erreur', 'L\'ancien mot de passe est incorrect.');
      return;
    }
    
    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    setSavingPassword(false);
    
    if (updateError) {
      Alert.alert('Erreur', updateError.message);
    } else {
      Alert.alert('Succès', 'Votre mot de passe a été modifié avec succès.');
      setOldPassword('');
      setNewPassword('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#282828', Colors.background]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={{ width: 28 }} />
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Informations du compte</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#666"
                placeholder="Votre nom d'utilisateur"
              />
              <Button 
                title="Modifier le nom" 
                onPress={handleUpdateUsername} 
                loading={savingUsername}
                style={styles.actionBtn}
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Sécurité</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ancien mot de passe</Text>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholderTextColor="#666"
                placeholder="Ancien mot de passe"
                secureTextEntry
              />
              
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#666"
                placeholder="Nouveau mot de passe"
                secureTextEntry
              />
              
              <Button 
                title="Modifier le mot de passe" 
                onPress={handleUpdatePassword} 
                loading={savingPassword}
                style={styles.actionBtn}
              />
            </View>
            
            <View style={{ height: 50 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
  content: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoCard: {
    backgroundColor: '#333',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.xl,
  },
  label: {
    color: '#b3b3b3',
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  value: {
    color: '#fff',
    fontSize: FontSize.md,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  actionBtn: {
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: Spacing.md,
  },
});
