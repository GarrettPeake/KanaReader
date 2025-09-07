import { useGameContext } from "../../hooks/useGameContext";

export function Header() {
  const { dispatch } = useGameContext();

  const toggleMenu = () => {
    dispatch({ type: "TOGGLE_MENU" });
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
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <img
          src="/favicon.svg"
          alt="KanaReader Logo"
          style={{
            width: "2rem",
            height: "2rem",
            filter: "none", // Keep original colors
          }}
        />
        <h1>KanaReader</h1>
      </div>
      <a
        href="https://github.com/GarrettPeake/KanaReader"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <img
          src="/github.png"
          alt="Github logo link"
          style={{
            width: "2rem",
            height: "2rem",
          }}
        />
      </a>
    </header>
  );
}
