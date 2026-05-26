module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-vector-icons|react-native-linear-gradient|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-url-polyfill|react-native-mmkv|react-native-image-picker|react-native-track-player|@supabase|zustand)/)',
  ],
};
