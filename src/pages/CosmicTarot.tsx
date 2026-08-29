import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CosmicTarotComponent from '../components/CosmicTarot/CosmicTarot';

export default function CosmicTarot() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close Cosmic Love Tarot"
        className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <CosmicTarotComponent />
    </div>
  );
}
