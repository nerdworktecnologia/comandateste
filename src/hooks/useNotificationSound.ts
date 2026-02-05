import { useState, useEffect, useCallback } from 'react';

export type NotificationSoundOption = {
  id: string;
  name: string;
  path: string;
};

export const NOTIFICATION_SOUNDS: NotificationSoundOption[] = [
  { id: 'default', name: 'Padrão', path: '/notification.mp3' },
  { id: 'chime', name: 'Sino', path: '/sounds/notification-chime.mp3' },
  { id: 'alert', name: 'Alerta', path: '/sounds/notification-alert.mp3' },
  { id: 'ding', name: 'Ding', path: '/sounds/notification-ding.mp3' },
  { id: 'none', name: 'Sem som', path: '' },
];

const STORAGE_KEY = 'notification-sound-preference';

export function useNotificationSound() {
  const [selectedSound, setSelectedSound] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'default';
    }
    return 'default';
  });

  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notification-volume');
      return saved ? parseFloat(saved) : 0.5;
    }
    return 0.5;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedSound);
  }, [selectedSound]);

  useEffect(() => {
    localStorage.setItem('notification-volume', volume.toString());
  }, [volume]);

  const getSoundPath = useCallback(() => {
    const sound = NOTIFICATION_SOUNDS.find(s => s.id === selectedSound);
    return sound?.path || '';
  }, [selectedSound]);

  const playSound = useCallback(() => {
    const path = getSoundPath();
    if (!path) return;
    
    const audio = new Audio(path);
    audio.volume = volume;
    audio.play().catch(err => {
      console.log('Could not play notification sound:', err);
    });
  }, [getSoundPath, volume]);

  const previewSound = useCallback((soundId: string) => {
    const sound = NOTIFICATION_SOUNDS.find(s => s.id === soundId);
    if (!sound?.path) return;
    
    const audio = new Audio(sound.path);
    audio.volume = volume;
    audio.play().catch(err => {
      console.log('Could not play preview sound:', err);
    });
  }, [volume]);

  return {
    selectedSound,
    setSelectedSound,
    volume,
    setVolume,
    getSoundPath,
    playSound,
    previewSound,
    sounds: NOTIFICATION_SOUNDS,
  };
}
