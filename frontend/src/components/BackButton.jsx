import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ to = '/client/home', onClick, label = 'Back to Dashboard' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'transparent',
        border: 'none',
        padding: '16px 16px 16px 0',
        cursor: 'pointer',
        marginBottom: '12px',
      }}
    >
      <ChevronLeft size={20} color="#27AE60" strokeWidth={2.5} />
      <span style={{
        fontSize: '14px',
        fontWeight: 500,
        color: '#27AE60',
      }}>
        {label}
      </span>
    </button>
  );
}

