# MboaTune 🎵

MboaTune est une application mobile de streaming musical professionnelle (style Spotify), axée sur la musique urbaine et africaine, développée avec React Native.

## ✨ Fonctionnalités Principales

*   **Authentification Complète** : Connexion par email/mot de passe et Google Sign-in via Supabase.
*   **Lecteur Audio Premium** : Lecteur complet avec lecture/pause, suivant/précédent, mode boucle, barre de progression et un mini-lecteur persistant pendant la navigation.
*   **Interface Utilisateur Moderne** : Thème sombre, design "glassmorphism", animations fluides et navigation intuitive par onglets (Accueil, Recherche, Bibliothèque).
*   **Gestion de Bibliothèque** : Historique des écoutes ("Récemment joués"), gestion des favoris et playlists.
*   **Menu d'Options des Pistes** : Modal (TrackOptionsModal) permettant d'ajouter aux favoris, voir l'artiste, ou télécharger la musique.
*   **Mode Hors-ligne** : Téléchargement des pistes en local avec persistance des données via MMKV et Zustand.
*   **Backend Robuste** : Utilisation de Supabase pour la base de données, le stockage des musiques/images et l'authentification.

## 🧪 Identifiants de test

Pour tester l'application sans créer de compte, vous pouvez utiliser ces identifiants de test :
*   **Email :** `test@mboatune.com`
*   **Mot de passe :** `password123`
*(Note: assurez-vous que ce compte est créé dans votre projet Supabase)*

## 🚀 Installation & Démarrage

### Prérequis
*   Node.js (v18+)
*   Environnement de développement React Native configuré (Android Studio / Xcode)

### Étapes d'installation

1. **Cloner le projet et installer les dépendances :**
```bash
npm install
```

2. **Configuration Supabase :**
Assurez-vous que vos clés Supabase (`SUPABASE_URL` et `SUPABASE_ANON_KEY`) sont configurées dans l'application (généralement dans un fichier `.env` ou `src/lib/supabase.ts`).

3. **Lancer l'application :**

Pour Android :
```bash
npm run android
```

Pour iOS (nécessite un Mac) :
```bash
cd ios && pod install && cd ..
npm run ios
```

## 🛠 Technologies Utilisées
*   **Framework :** React Native (CLI)
*   **State Management :** Zustand + MMKV (pour la persistance)
*   **Backend & Auth :** Supabase
*   **Navigation :** React Navigation
*   **Styles :** StyleSheet (Vanilla React Native) avec design system personnalisé
