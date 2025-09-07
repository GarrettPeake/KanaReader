import { useGameContext } from '../../hooks/useGameContext';

export function Header() {
  const { dispatch } = useGameContext();

  const toggleMenu = () => {
    dispatch({ type: 'TOGGLE_MENU' });
  };

  return (
    <header className="header">
      <button 
        onClick={toggleMenu}
        className="menu-toggle"
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <h1>KanaReader</h1>
      <div style={{ width: '2rem' }} /> {/* Spacer for center alignment */}
    </header>
  );
}