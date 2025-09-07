interface PlayButtonProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function PlayButton({ onClick, className = '', size = 'medium' }: PlayButtonProps) {
  const sizeStyles = {
    small: {
      iconSize: '16px'
    },
    medium: {
      iconSize: '20px'
    },
    large: {
      iconSize: '24px'
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        color: '#a0aec0',
        transition: 'all 0.3s ease',
        borderRadius: '4px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#3b82f6';
        e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#a0aec0';
        e.currentTarget.style.filter = 'none';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      aria-label="Play pronunciation"
    >
      {/* Speaker icon SVG */}
      <svg
        width={currentSize.iconSize}
        height={currentSize.iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    </button>
  );
}