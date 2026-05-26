import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(null),
  updateOptions: jest.fn().mockResolvedValue(null),
  reset: jest.fn().mockResolvedValue(null),
  add: jest.fn().mockResolvedValue(null),
  play: jest.fn().mockResolvedValue(null),
  pause: jest.fn().mockResolvedValue(null),
  getPlaybackState: jest.fn().mockResolvedValue({ state: 0 }),
  skipToNext: jest.fn().mockResolvedValue(null),
  skipToPrevious: jest.fn().mockResolvedValue(null),
  seekTo: jest.fn().mockResolvedValue(null),
  setRepeatMode: jest.fn().mockResolvedValue(null),
  State: { Playing: 0 },
  Capability: {
    Play: 'play',
    Pause: 'pause',
    SkipToNext: 'skipToNext',
    SkipToPrevious: 'skipToPrevious',
    SeekTo: 'seekTo',
    Stop: 'stop',
  },
  RepeatMode: {
    Off: 'off',
    Queue: 'queue',
    Track: 'track',
  },
  AppKilledPlaybackBehavior: {
    StopPlaybackAndRemoveNotification: 'stop',
  },
}));
