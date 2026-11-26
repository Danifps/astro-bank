import { useEffect, useState, useCallback } from 'react';

/**
 * Hook de música de fondo corporativa para Astro Bank.
 *
 * - Reproduce una pista corporativa libre de derechos (Mixkit: "Infinity" - Arulo,
 *   https://mixkit.co/license/#music) desde /audio/corporate-background.mp3.
 * - Fade-in de 3 segundos al entrar y fade-out de 2 segundos al salir.
 * - El estado de mute se guarda en localStorage para no volver a preguntar.
 * - Respeta la política de autoplay de los navegadores (se inicia tras la
 *   primera interacción del usuario).
 * - Todo está envuelto en try/catch para que nunca rompa el render de la
 *   página, incluso si el navegador bloquea el audio o localStorage.
 */

const STORAGE_KEY = 'astrobank:bgm-muted';
const FADE_IN_SECONDS = 3;
const FADE_OUT_SECONDS = 2;
const TARGET_VOLUME = 0.10;
const TRACK_URL = '/audio/corporate-background.mp3';

let sharedAudio = null;
let fadeRaf = null;
let activeMounts = 0;

function getAudio() {
  try {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
    if (!sharedAudio) {
      const audio = new Audio(TRACK_URL);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      sharedAudio = audio;
    }
    return sharedAudio;
  } catch {
    return null;
  }
}

function cancelFade() {
  if (fadeRaf != null) {
    try {
      cancelAnimationFrame(fadeRaf);
    } catch {
      // Ignora errores al cancelar la animación de fundido.
    }
    fadeRaf = null;
  }
}

function fadeVolume(target, seconds, onDone) {
  try {
    const audio = getAudio();
    if (!audio) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    cancelFade();
    const from = Number.isFinite(audio.volume) ? audio.volume : 0;
    const to = Math.max(0, Math.min(1, target));
    const durationMs = Math.max(0, seconds * 1000);

    if (durationMs === 0) {
      audio.volume = to;
      if (typeof onDone === 'function') onDone();
      return;
    }

    const start = performance.now();
    const step = (now) => {
      try {
        const t = Math.min(1, (now - start) / durationMs);
        audio.volume = from + (to - from) * t;
        if (t < 1) {
          fadeRaf = requestAnimationFrame(step);
        } else {
          fadeRaf = null;
          audio.volume = to;
          if (typeof onDone === 'function') onDone();
        }
      } catch {
        fadeRaf = null;
      }
    };
    fadeRaf = requestAnimationFrame(step);
  } catch {
    if (typeof onDone === 'function') {
      try {
        onDone();
      } catch {
        // Ignora errores del callback de fundido.
      }
    }
  }
}

function ensurePlaying() {
  try {
    const audio = getAudio();
    if (!audio) return Promise.resolve(false);
    if (!audio.paused) return Promise.resolve(true);
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      return p.then(() => true).catch(() => false);
    }
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useBackgroundMusic() {
  const [muted, setMuted] = useState(readMuted);

  const applyMute = useCallback((isMuted) => {
    try {
      const audio = getAudio();
      if (!audio) return;
      const target = isMuted ? 0 : TARGET_VOLUME;
      // Intenta reproducir en el gesto del usuario (clic en mute) y ajusta volumen.
      ensurePlaying().then(() => {
        try {
          if (activeMounts <= 0) return;
          fadeVolume(target, 0.4);
        } catch {
          // Ignora errores al aplicar mute.
        }
      });
    } catch {
      // Si falla el audio, simplemente no se aplica el cambio de volumen.
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignora errores de cuota de localStorage.
      }
      try {
        applyMute(next);
      } catch {
        // Ignora errores de audio al mutear.
      }
      return next;
    });
  }, [applyMute]);

  const beginFadeIn = useCallback(() => {
    try {
      const audio = getAudio();
      if (!audio) return;
      const isMuted = readMuted();
      const target = isMuted ? 0 : TARGET_VOLUME;
      ensurePlaying().then((playing) => {
        try {
          if (!playing) return;
          if (activeMounts <= 0) return;
          // Siempre entra desde silencio para un fundido perceptible.
          if (audio.volume > target) audio.volume = 0;
          fadeVolume(target, FADE_IN_SECONDS);
        } catch {
          // Ignora errores al iniciar el fundido de entrada.
        }
      });
    } catch {
      // Ignora errores de fundido de entrada.
    }
  }, []);

  const beginFadeOut = useCallback((onDone) => {
    try {
      const audio = getAudio();
      if (!audio) {
        if (typeof onDone === 'function') onDone();
        return;
      }
      fadeVolume(0, FADE_OUT_SECONDS, () => {
        try {
          if (activeMounts <= 0) {
            audio.pause();
            audio.currentTime = 0;
          }
        } catch {
          // Ignora errores al pausar tras el fundido de salida.
        }
        if (typeof onDone === 'function') onDone();
      });
    } catch {
      if (typeof onDone === 'function') {
        try {
          onDone();
        } catch {
          // Ignora errores del callback de salida.
        }
      }
    }
  }, []);

  // Montaje/desmontaje de la landing: controla entrada y salida de música.
  useEffect(() => {
    activeMounts += 1;
    try {
      const audio = getAudio();
      if (audio) {
        cancelFade();
        audio.volume = 0;
        try {
          audio.currentTime = 0;
        } catch {
          // Ignora errores al reiniciar la posición de reproducción.
        }
      }
      beginFadeIn();
    } catch {
      // Si falla la inicialización de audio, la página sigue funcionando sin música.
    }

    return () => {
      activeMounts = Math.max(0, activeMounts - 1);
      try {
        if (activeMounts === 0) {
          beginFadeOut();
        }
      } catch {
        // Ignora errores al iniciar fundido de salida en desmontaje.
      }
    };
  }, [beginFadeIn, beginFadeOut]);

  // Reintenta iniciar el audio en interacciones del usuario (autoplay).
  useEffect(() => {
    const handleInteraction = () => {
      try {
        if (activeMounts <= 0) return;
        const audio = getAudio();
        if (!audio) return;
        if (audio.paused) {
          beginFadeIn();
        }
      } catch {
        // Ignora errores al manejar la interacción.
      }
    };
    try {
      document.addEventListener('pointerdown', handleInteraction);
      document.addEventListener('keydown', handleInteraction);
    } catch {
      // Ignora errores al agregar listeners.
    }
    return () => {
      try {
        document.removeEventListener('pointerdown', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      } catch {
        // Ignora errores al remover listeners.
      }
    };
  }, [beginFadeIn]);

  // Fade-out al cerrar/ocultar y fade-in al volver a la pestaña.
  useEffect(() => {
    const onBeforeUnload = () => {
      try {
        if (activeMounts > 0) beginFadeOut();
      } catch {
        // Ignora errores en beforeunload.
      }
    };
    const onVisibilityChange = () => {
      try {
        if (activeMounts <= 0) return;
        if (document.visibilityState === 'hidden') {
          beginFadeOut();
        } else if (document.visibilityState === 'visible') {
          beginFadeIn();
        }
      } catch {
        // Ignora errores en visibilitychange.
      }
    };

    try {
      window.addEventListener('beforeunload', onBeforeUnload);
      document.addEventListener('visibilitychange', onVisibilityChange);
    } catch {
      // Ignora errores al agregar listeners de ventana.
    }

    return () => {
      try {
        window.removeEventListener('beforeunload', onBeforeUnload);
        document.removeEventListener('visibilitychange', onVisibilityChange);
      } catch {
        // Ignora errores al remover listeners de ventana.
      }
    };
  }, [beginFadeIn, beginFadeOut]);

  return { muted, toggleMute };
}
