import type { ContentItem } from "../../types/content";
import { PronunciationService } from "../../services";
import { useGameContext } from "../../hooks/useGameContext";
import { PlayButton } from "../ui/PlayButton";
import { SmartSentenceEditor } from "./SmartSentenceEditor";

interface ContentDisplayProps {
  contentItem: ContentItem;
}

export function ContentDisplay({ contentItem }: ContentDisplayProps) {
  const {
    getUnlockedCharacters,
    submitAnswer,
    advanceToNext,
    advanceWithoutProgress,
    dispatch,
  } = useGameContext();

  const handlePronunciation = () => {
    if (contentItem.characterId) {
      // Find the character by ID from all unlocked characters
      const allCharacters = getUnlockedCharacters();
      const character = allCharacters.find(
        (char) => char.id === contentItem.characterId
      );
      if (character) {
        PronunciationService.pronounceCharacter(character.character);
      }
    }
  };

  const handleSentenceComplete = (
    score: "perfect" | "almost" | "not-quite"
  ) => {
    // Manually trigger the feedback system based on our smart editor score

    const isCorrect = score === "perfect" || score === "almost";

    let feedbackMessage = "";
    let feedbackType: "info" | "success" | "error" = "info";

    if (score === "perfect") {
      feedbackMessage = "Perfect!";
      feedbackType = "success";
    } else if (score === "almost") {
      feedbackMessage = "Almost!";
      feedbackType = "success"; // Still success since they get progress
    } else {
      feedbackMessage = "Not quite!";
      feedbackType = "error";
    }

    // Manually set the feedback state
    dispatch({
      type: "SUBMIT_ANSWER",
      payload: {
        isCorrect,
        expected: "sentence-completion",
        provided: "user-input",
        feedback: feedbackMessage,
      },
    });

    // Auto-advance after showing feedback briefly
    setTimeout(() => {
      if (isCorrect) {
        // Correct: advance with progress
        advanceToNext();
      } else {
        // Wrong: advance without progress
        advanceWithoutProgress();
      }
    }, 1500);
  };

  if (contentItem.type === "sentence") {
    return (
      <SmartSentenceEditor
        displayText={contentItem.displayText}
        originalText={contentItem.originalText || contentItem.displayText}
        onComplete={handleSentenceComplete}
      />
    );
  } else {
    // Question display

    return (
      <div
        className="sentence-display"
        style={{ flexDirection: "column", gap: "1rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {/* Show hint text above kanji symbol */}
            {contentItem.hintText && (
              <div
                style={{
                  fontSize: "1.2rem",
                  color: "#a0aec0",
                  opacity: 0.8,
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)",
                  fontWeight: "500",
                }}
              >
                ({contentItem.hintText})
              </div>
            )}

            <div
              style={{
                fontSize: "4rem",
                fontWeight: "bold",
                color: "#e2e8f0",
                textShadow: "3px 3px 6px rgba(0, 0, 0, 0.5)",
                padding: "1rem 2rem",
                background:
                  "linear-gradient(135deg, rgba(45, 55, 72, 0.6) 0%, rgba(26, 32, 44, 0.6) 100%)",
                borderRadius: "20px",
                border: "2px solid rgba(99, 179, 237, 0.6)", // Blue border
                boxShadow:
                  "inset 4px 4px 8px rgba(20, 24, 35, 0.6), " +
                  "inset -4px -4px 8px rgba(45, 55, 72, 0.8), " +
                  "4px 4px 12px rgba(20, 24, 35, 0.4), " +
                  "0 0 12px rgba(99, 179, 237, 0.3)", // Added blue glow
                display: "inline-block",
              }}
            >
              {contentItem.displayText}
            </div>
          </div>

          {PronunciationService.isSupported() && contentItem.characterId && (
            <PlayButton onClick={handlePronunciation} size="medium" />
          )}
        </div>

      </div>
    );
  }
}
