import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../theme/colors';
import { Spacing, FontSize } from '../../theme/spacing';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { signUp, isLoading } = useAuthStore();

  const handleRegister = async () => {
    setErrorMsg('');
    if (!username || !email || !password) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Veuillez entrer une adresse email valide.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    const { error } = await signUp(email, password, username);
    if (error) {
      setErrorMsg(error);
      Alert.alert('Information', error);
    } else {
      Alert.alert('Succès', 'Votre compte a été créé avec succès !');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={Colors.gradientDark}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoCard}>
              <Image 
                source={require('../../assets/images/logo.jpg')} 
                style={styles.logoImage} 
              />
            </View>
            <Text style={styles.title}>Créer un compte</Text>
          </View>

          <View style={styles.form}>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <Input
              label="Nom d'utilisateur"
              placeholder="Comment doit-on vous appeler ?"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="Votre adresse email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Mot de passe"
              placeholder="Créez un mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button 
              title="S'inscrire" 
              onPress={handleRegister} 
              loading={isLoading} 
              style={styles.registerBtn}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.huge * 1.5,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.huge,
    left: Spacing.lg,
    zIndex: 10,
    padding: Spacing.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    paddingTop: Spacing.md,
  },
  logoCard: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: Spacing.xl,
    borderRadius: 32,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: Colors.error,
    marginBottom: Spacing.md,
    fontWeight: '500',
  },
  registerBtn: {
    marginTop: Spacing.lg,
  },
});
