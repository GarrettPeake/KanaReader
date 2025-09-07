import { useEffect } from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  // Add keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        onStart();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);
  return (
    <div className="transition-overlay">
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '4rem', 
          marginBottom: '2rem',
          color: '#63b3ed',
          textShadow: '0 0 20px rgba(99, 179, 237, 0.6), 4px 4px 8px rgba(0, 0, 0, 0.4)',
          fontWeight: 'bold'
        }}>
          KanaReader
        </h1>
        
        <div className="transition-info" style={{ 
          marginBottom: '3rem', 
          fontSize: '1.3rem',
          opacity: 0.9,
          maxWidth: '600px',
          margin: '0 auto 3rem'
        }}>
          Learn Japanese alphabets and words using English sentences and spaced repetition
        </div>
        
        <button 
          className="btn"
          onClick={onStart}
          autoFocus
          style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
        >
          Start Learning
        </button>
        
        <div style={{ 
          fontSize: '0.9rem', 
          opacity: 0.6, 
          marginTop: '2rem',
          color: '#a0aec0'
        }}>
          Press Enter or click to begin
        </div>
      </div>
    </div>
  );
}