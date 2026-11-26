import { Volume2, VolumeX } from 'lucide-react';

/**
 * Botón superdiscreto para mutear la música de fondo del landing.
 * Ubicado en la esquina inferior derecha, bajo contraste, con tooltip.
 */
export default function BackgroundMusicMute({ muted, toggleMute }) {
  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? 'Activar música de fondo' : 'Mutear música de fondo'}
      title={muted ? 'Activar música de fondo' : 'Mutear música de fondo'}
      className="
        fixed right-4 bottom-4 z-50
        w-8 h-8 rounded-full
        inline-flex items-center justify-center
        bg-white/90 backdrop-blur-md border border-gray-200
        text-gray-500 hover:text-gray-900
        transition-all duration-200
        hover:shadow-md hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-blue-600/30
        active:scale-95
        opacity-80 hover:opacity-100
      "
    >
      <span className="sr-only">{muted ? 'Música desactivada' : 'Música activada'}</span>
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}
