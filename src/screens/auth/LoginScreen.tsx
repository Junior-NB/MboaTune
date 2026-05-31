import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/colors';
import { Spacing, FontSize } from '../../theme/spacing';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { signIn, signInWithGoogle, isLoading } = useAuthStore();

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Veuillez entrer une adresse email valide.');
      return;
    }
    const { error } = await signIn(email, password);
    if (error) {
      setErrorMsg(error);
      Alert.alert('Erreur de connexion', error);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error);
      Alert.alert('Erreur Google', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[Colors.surfaceLight, Colors.background]}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.logoCard}>
            <Image 
              source={require('../../assets/images/logo.jpg')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.form}>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <Input
            label="Email"
            placeholder="Entrez votre email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Mot de passe"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button 
            title="Se connecter" 
            onPress={handleLogin} 
            loading={isLoading} 
            style={styles.loginBtn}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Icon name="logo-google" size={24} color="#DB4437" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Continuer avec Google</Text>
          </TouchableOpacity>

          <Button 
            title="S'inscrire" 
            variant="outline" 
            onPress={() => navigation.navigate('Register')} 
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoCard: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  logoImage: {
    width: 180,
    height: 110,
  },
  logoText: {
    color: Colors.primary,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: Spacing.md,
  },
  googleIcon: {
    marginRight: Spacing.md,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
