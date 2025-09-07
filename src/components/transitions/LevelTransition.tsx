import { useEffect } from "react";
import { useGameContext } from "../../hooks/useGameContext";
import { PronunciationService } from "../../services";
import { PlayButton } from "../ui/PlayButton";

export function LevelTransition() {
  const { state, dispatch, getCurrentCharacter } = useGameContext();

  // No timeout - wait for user to click or press Enter

  if (!state.showLevelTransition) {
    return null;
  }

  const currentCharacter = getCurrentCharacter();

  if (!currentCharacter) {
    return null;
  }

  const handleClick = () => {
    dispatch({ type: "SHOW_LEVEL_TRANSITION", payload: false });
  };

  const handlePronunciation = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the overlay click
    if (currentCharacter) {
      PronunciationService.pronounceCharacter(currentCharacter.character);
    }
  };

  // Add keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && state.showLevelTransition) {
        handleClick();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.showLevelTransition]);

  return (
    <div
      className="transition-overlay"
      onClick={handleClick}
      tabIndex={0}
      role="dialog"
      aria-label="Character introduction"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <div className="transition-character">{currentCharacter.character}</div>
        {PronunciationService.isSupported() && (
          <PlayButton onClick={handlePronunciation} size="large" />
        )}
      </div>
      <div className="transition-info">
        {currentCharacter.romanizations.join(" / ")}
      </div>
      <div
        className="transition-info"
        style={{ fontSize: "1.2rem", opacity: 0.8 }}
      >
        Pronunciation: {currentCharacter.pronunciation}
      </div>
      <div style={{ fontSize: "1rem", opacity: 0.6, marginTop: "2rem" }}>
        Click anywhere or press Enter to continue
      </div>
    </div>
  );
}
