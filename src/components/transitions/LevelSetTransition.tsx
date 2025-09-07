import { useEffect } from "react";
import { useGameContext } from "../../hooks/useGameContext";

export function LevelSetTransition() {
  const { state, dispatch, getCurrentLevelSet } = useGameContext();

  // No timeout - wait for user to click or press Enter

  if (!state.showLevelSetTransition) {
    return null;
  }

  const currentLevelSet = getCurrentLevelSet();

  const handleClick = () => {
    dispatch({ type: "SHOW_LEVEL_SET_TRANSITION", payload: false });
  };

  // Add keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && state.showLevelSetTransition) {
        handleClick();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.showLevelSetTransition]);

  return (
    <div
      className="transition-overlay"
      onClick={handleClick}
      tabIndex={0}
      role="dialog"
      aria-label="Level set introduction"
    >
      <div style={{ fontSize: "3rem", marginBottom: "2rem" }}>
        {currentLevelSet.name}
      </div>
      <div
        style={{ fontSize: "1.5rem", marginBottom: "1rem", maxWidth: "600px" }}
      >
        {currentLevelSet.description}
      </div>
      <div
        style={{
          fontSize: "1.1rem",
          opacity: 0.9,
          maxWidth: "700px",
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}
      >
        {currentLevelSet.explanation}
      </div>
      <div style={{ fontSize: "1rem", opacity: 0.6 }}>
        Click anywhere or press Enter to continue
      </div>
    </div>
  );
}
