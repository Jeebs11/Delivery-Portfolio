/**
 * Simple Global Audio Manager for background music
 */

let bgMusicAudio = null;
let isMuted = false;
let bgMusicStarted = false;

// Initialize background music
export const initAudio = () => {
    if (typeof window === 'undefined') return;

    // Sync muted state from localStorage (same key as AudioManager context)
    const savedMuted = localStorage.getItem('audio_muted');
    isMuted = savedMuted === 'true';

    if (!bgMusicAudio) {
        // We use the file provided by the user in public/sounds/
        bgMusicAudio = new Audio('/sounds/cfl_turningpages-belem-breeze-487596.ogg');
        bgMusicAudio.preload = 'auto'; // Force browser to fetch data immediately
        bgMusicAudio.loop = true;
        bgMusicAudio.volume = 0; // Off by default — user turns the Ambient slider up
        bgMusicAudio.muted = isMuted; // Apply synced mute state

        // Trigger background load
        bgMusicAudio.load();
    }
};

export const playBackgroundMusic = () => {
    initAudio();
    bgMusicStarted = true;
    if (bgMusicAudio && bgMusicAudio.paused) {
        // Only play if not muted and it's currently paused
        bgMusicAudio.play().catch((err) => {
            console.warn('Audio play failed/blocked by browser:', err);
        });
    }
};

export const pauseBackgroundMusic = () => {
    if (bgMusicAudio && !bgMusicAudio.paused) {
        bgMusicAudio.pause();
    }
};

export const toggleMute = () => {
    isMuted = !isMuted;
    if (bgMusicAudio) {
        bgMusicAudio.muted = isMuted;
    }
    return isMuted;
};

export const getIsMuted = () => isMuted;

// The ambient bed is intentionally gentle: the 0..1 slider maps to a low actual
// volume so even "full" stays subtle (the raw track at 0.3 felt distracting).
const AMBIENT_GAIN = 0.22;

export const setMusicVolume = (vol) => {
    const v = Math.max(0, Math.min(1, vol));
    if (bgMusicAudio) {
        bgMusicAudio.volume = v * AMBIENT_GAIN;
        // Auto-unmute if user drags slider up
        if (v > 0 && isMuted) {
            isMuted = false;
            bgMusicAudio.muted = false;
        }
        // Slider up starts the ambient bed (the drag itself is the user gesture);
        // slider to 0 turns it off.
        if (v > 0 && bgMusicAudio.paused) {
            bgMusicStarted = true;
            bgMusicAudio.play().catch(e => console.warn(e));
        } else if (v <= 0 && !bgMusicAudio.paused) {
            bgMusicAudio.pause();
        }
    }
    // Dispatch event so UI sliders can stay in sync if changed programmatically
    window.dispatchEvent(new CustomEvent('musicVolumeChanged', { detail: v }));
};

export const getMusicVolume = () => {
    return bgMusicAudio ? bgMusicAudio.volume / AMBIENT_GAIN : 0;
};
