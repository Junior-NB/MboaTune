import TrackPlayer, { Event, State } from 'react-native-track-player';
import { usePlayerStore } from '../store/playerStore';

module.exports = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
    if (event.track) {
      const state = usePlayerStore.getState();
      const trackInQueue = state.queue.find(t => t.id === event.track?.id);
      if (trackInQueue) {
        state.setCurrentTrack(trackInQueue);
      }
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
    const isPlaying = event.state === State.Playing || event.state === State.Buffering;
    usePlayerStore.getState().setIsPlaying(isPlaying);
  });
};
