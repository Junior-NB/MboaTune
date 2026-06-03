# 🎵 MboaTune

Une **application mobile de streaming musical** moderne et professionnelle, développée avec **React Native**. Inspirée par Spotify, MboaTune met l'accent sur la **musique urbaine et africaine** avec une expérience utilisateur premium et intuitive.

---

## ✨ Fonctionnalités Principales

### 🔐 Authentification
- **Connexion Email/Mot de passe** : système d'authentification sécurisé
- **Google Sign-in** : intégration Google pour une inscription rapide
- Backend sécurisé avec **Supabase Auth**

### 🎧 Lecteur Audio Premium
- **Contrôles complets** : lecture/pause, piste suivante/précédente
- **Barre de progression** interactive avec timeline
- **Modes de lecture** : normal, boucle (une piste ou tout), lecture aléatoire
- **Mini-lecteur persistant** : continue à fonctionner lors de la navigation
- **Gestion du volume** : slider de volume intégré
- **Info piste en temps réel** : affichage de l'artiste, titre, durée

### 🎨 Interface Utilisateur Moderne
- **Design Glassmorphism** : interface épurée et élégante
- **Thème sombre** : protection oculaire et esthétique moderne
- **Animations fluides** : transitions et microanimations polies
- **Navigation par onglets** :
  - 🏠 **Accueil** : pistes populaires et recommandations
  - 🔍 **Recherche** : filtrage en temps réel
  - 📚 **Bibliothèque** : favoris, playlists, historique

### 📚 Gestion de Bibliothèque
- **Historique des écoutes** : "Récemment joués" avec persistance
- **Gestion des favoris** : marquer/démarquer les pistes
- **Création de playlists** : organisez votre musique
- **Téléchargement de musiques** : accès hors-ligne

### 🎯 Menu d'Options Contextuel
- **Modal TrackOptionsModal** pour chaque piste :
  - ❤️ Ajouter/retirer des favoris
  - 👤 Voir le profil de l'artiste
  - 📥 Télécharger la musique
  - 📤 Partager la piste

### 📱 Mode Hors-ligne
- **Téléchargement des pistes** : stockage local complet
- **Persistance des données** :
  - **MMKV** : stockage performant et rapide
  - **Zustand** : state management persistent
- **Lecture sans connexion internet**

### 💾 Backend Robuste
- **Supabase** :
  - Base de données PostgreSQL complète
  - Stockage des fichiers audio et images
  - Authentification multi-méthode
  - Row Level Security (RLS) pour la sécurité
- **Architecture scalable** et prête pour la production

---

## 🏗️ Architecture

### Stack Technologique

```
┌─────────────────────────────────────────────┐
│         React Native Application            │
├─────────────────────────────────────────────┤
│  Navigation (React Navigation + Bottom Tab) │
├─────────────────────────────────────────────┤
│  State Management (Zustand + MMKV)          │
├─────────────────────────────────────────────┤
│  Audio Player (react-native-track-player)   │
├─────────────────────────────────────────────┤
│  API Client (Supabase)                      │
├─────────────────────────────────────────────┤
│  Backend (Supabase PostgreSQL)              │
└─────────────────────────────────────────────┘
```

### Schéma Base de Données

| Table | Description |
|-------|-------------|
| **profiles** | Données utilisateur (username, avatar, bio) |
| **artists** | Artistes (nom, bio, avatar, vérification) |
| **albums** | Albums/EPs/Singles (titre, artiste, date) |
| **tracks** | Pistes (titre, durée, fichier audio) |
| **playlists** | Playlists créées par les utilisateurs |
| **playlist_tracks** | Liaisons piste-playlist avec position |
| **user_library** | Favoris, likes, follows (privé) |

---

## 🚀 Installation & Démarrage

### Prérequis

- **Node.js** : v22.11.0 ou supérieur
- **npm** : v10+
- **Android Studio** : pour Android
- **Xcode** : pour iOS (Mac requis)
- **Compte Supabase** : gratuit sur [supabase.com](https://supabase.com)

### 1️⃣ Cloner et Installer

```bash
git clone https://github.com/Junior-NB/MboaTune.git
cd MboaTune
npm install
```

### 2️⃣ Configuration Supabase

#### A. Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer les clés :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

#### B. Initialiser la base de données
1. Aller à l'éditeur SQL dans Supabase
2. Copier/coller le contenu de `supabase-setup.sql`
3. Exécuter le script
4. Vérifier que toutes les tables sont créées

#### C. Configurer les variables d'environnement
Créer un fichier `.env` à la racine :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

Ou modifier `src/lib/supabase.ts` directement.

### 3️⃣ Lancer l'application

#### Android
```bash
npm run android
```

#### iOS (Mac requis)
```bash
cd ios && pod install && cd ..
npm run ios
```

#### En Mode Développement
```bash
npm start
# Puis appuyer sur 'a' pour Android ou 'i' pour iOS
```

---

## 🧪 Identifiants de Test

Pour tester rapidement sans créer de compte :

```
📧 Email :         juniorinfernal302@gmail.com
🔑 Mot de passe :  test123456
```

> ⚠️ **Note** : Assurez-vous que ce compte existe dans votre projet Supabase

---

## 📁 Structure du Projet

```
MboaTune/
├── src/
│   ├── navigation/        # Navigation et routage
│   ├── screens/          # Écrans principaux (Accueil, Recherche, Bibliothèque)
│   ├── components/       # Composants réutilisables
│   ├── store/           # État global (Zustand + MMKV)
│   ├── services/        # Logique métier et API calls
│   ├── lib/             # Utilitaires et instances (Supabase)
│   ├── theme/           # Thème global (couleurs, typos)
│   └── types/           # Types TypeScript
├── android/             # Configuration Android
├── ios/                 # Configuration iOS
├── supabase-setup.sql   # Script d'initialisation BD
├── package.json         # Dépendances
└── README.md           # Ce fichier
```

---

## 📦 Dépendances Principales

### Frontend
- **react-native** : framework mobile
- **react-navigation** : navigation et routage
- **zustand** : state management minimal
- **react-query** : requêtes et caching
- **@supabase/supabase-js** : client API

### Audio & Médias
- **react-native-track-player** : lecteur audio natif
- **react-native-image-picker** : sélection d'images
- **react-native-share** : partage de contenu

### Stockage & Performance
- **react-native-mmkv** : stockage rapide
- **@react-native-async-storage** : stockage persistant
- **react-native-fs** : gestion fichiers

### UI & Animation
- **react-native-linear-gradient** : gradients
- **react-native-reanimated** : animations
- **react-native-vector-icons** : icônes
- **@react-native-community/slider** : slider volume

### Dev Tools
- **TypeScript** : typage statique
- **ESLint** : linting
- **Prettier** : formatage code
- **Jest** : testing

---

## 🔧 Scripts Disponibles

```bash
npm run android       # Lancer sur Android
npm run ios          # Lancer sur iOS
npm start            # Démarrer le bundler Metro
npm run lint         # Vérifier la qualité du code
npm run test         # Lancer les tests Jest
```

---

## 🔐 Sécurité & Authentification

### Row Level Security (RLS)
- ✅ Les profils sont visibles publiquement
- ✅ Les artistes/albums/pistes sont publiques
- ✅ Les playlists publiques sont visibles, les privées seulement pour le propriétaire
- ✅ La bibliothèque (favoris) est strictement privée

### Authentification Multi-méthode
- Email/mot de passe standard
- Google OAuth 2.0
- Sessions persistantes avec refresh tokens

---

## 🎯 Prochaines Étapes / Améliorations

- [ ] Système de recommandations avec machine learning
- [ ] Partage social et collaboration sur playlists
- [ ] Mode offline complet avec sync
- [ ] Streaming adaptatif (bitrate variable)
- [ ] Intégrations avec réseaux sociaux
- [ ] Statistiques d'écoute (Spotify Wrapped style)
- [ ] Support des podcasts
- [ ] Mode remix/mashup collaboratif

---

## 🤝 Contribution

Les contributions sont bienvenues ! Pour proposer des améliorations :

1. Créer une branche `feature/nom-feature`
2. Commiter vos changements
3. Créer une Pull Request

---

## 📄 Licence

Ce projet est open source. Consultez la licence pour plus de détails.

---

## 📞 Support & Contact

- **Questions ?** : Créer une issue sur GitHub
- **Bug report ?** : Détailler le problème + logs
- **Suggestions ?** : Discussions disponibles

---

## 🎉 Merci d'utiliser MboaTune !

Profitez de votre musique préférée, où que vous soyez. 🎧✨

**Made with ❤️ by Junior-NB**
