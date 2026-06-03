import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../theme/colors';
import { Spacing, FontSize } from '../theme/spacing';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

interface ProfileDrawerModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileDrawerModal({ visible, onClose }: ProfileDrawerModalProps) {
  const { profile, signOut } = useAuthStore();
  const navigation = useNavigation<any>();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  if (!visible && slideAnim._value === -DRAWER_WIDTH) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlayContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>
        
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          {/* En-tête Profil */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarTextLarge}>{profile?.display_name?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.display_name || 'Utilisateur'}</Text>
              <Text style={styles.viewProfileText}>{useAuthStore.getState().user?.email || 'Voir le profil'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Menu Items */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="add-outline" size={24} color={Colors.textPrimary} />
              <Text style={styles.menuText}>Ajouter un compte</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="flash-outline" size={24} color={Colors.textPrimary} />
              <Text style={styles.menuText}>Votre abonnement Premium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="stats-chart-outline" size={24} color={Colors.textPrimary} />
              <Text style={styles.menuText}>Stats d'écoute</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="time-outline" size={24} color={Colors.textPrimary} />
              <Text style={styles.menuText}>Récents</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); navigation.navigate('Settings'); }}>
              <Icon name="settings-outline" size={24} color={Colors.textPrimary} />
              <Text style={styles.menuText}>Paramètres</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            {/* Déconnexion */}
            <TouchableOpacity 
              style={[styles.menuItem, { marginTop: 20 }]} 
              onPress={() => {
                onClose();
                setTimeout(signOut, 300);
              }}
            >
              <Icon name="log-out-outline" size={24} color="#E8115B" />
              <Text style={[styles.menuText, { color: '#E8115B' }]}>Se déconnecter</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: Spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarTextLarge: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    justifyContent: 'center',
  },
  profileName: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  viewProfileText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  menuText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    marginLeft: Spacing.md,
    fontWeight: '500',
  },
});
