
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmBg: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
          confirmBorder: 'rgba(229, 62, 62, 0.3)',
          titleColor: '#fc8181'
        };
      case 'warning':
        return {
          confirmBg: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
          confirmBorder: 'rgba(237, 137, 54, 0.3)',
          titleColor: '#f6ad55'
        };
      case 'info':
        return {
          confirmBg: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
          confirmBorder: 'rgba(66, 153, 225, 0.3)',
          titleColor: '#63b3ed'
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#2d3748',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(74, 85, 104, 0.3)',
          transform: 'scale(1)',
          animation: 'dialogAppear 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            color: variantStyles.titleColor,
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          {title}
        </h3>
        
        <p
          style={{
            color: '#e2e8f0',
            lineHeight: 1.5,
            marginBottom: '2rem',
            textAlign: 'center',
            fontSize: '1rem'
          }}
        >
          {message}
        </p>
        
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
              color: '#e2e8f0',
              border: '1px solid rgba(74, 85, 104, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              boxShadow: '3px 3px 6px rgba(20, 24, 35, 0.6), -3px -3px 6px rgba(74, 85, 104, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '4px 4px 8px rgba(20, 24, 35, 0.7), -4px -4px 8px rgba(74, 85, 104, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '3px 3px 6px rgba(20, 24, 35, 0.6), -3px -3px 6px rgba(74, 85, 104, 0.3)';
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '0.75rem 1.5rem',
              background: variantStyles.confirmBg,
              color: '#fff',
              border: `1px solid ${variantStyles.confirmBorder}`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              boxShadow: '3px 3px 6px rgba(20, 24, 35, 0.6), -3px -3px 6px rgba(74, 85, 104, 0.3)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '4px 4px 8px rgba(20, 24, 35, 0.7), -4px -4px 8px rgba(74, 85, 104, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '3px 3px 6px rgba(20, 24, 35, 0.6), -3px -3px 6px rgba(74, 85, 104, 0.3)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      
      <style>
        {`
          @keyframes dialogAppear {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}