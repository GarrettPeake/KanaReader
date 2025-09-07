import React, { useState, useEffect, useRef } from "react";
import { useGameContext } from "../../hooks/useGameContext";
import {
  SentenceParser,
  type SentenceReplacement,
} from "../../services/SentenceParser";

interface Replacement extends SentenceReplacement {
  userInput: string; // What user has typed so far
  isComplete: boolean; // Whether user finished this replacement
  isCorrect: boolean; // Whether user got it right
  isSkipped: boolean; // Whether user skipped it
}

interface SmartSentenceEditorProps {
  displayText: string; // Sentence with kana/kanji
  originalText: string; // Original English sentence
  onComplete: (score: "perfect" | "almost" | "not-quite") => void;
}

export function SmartSentenceEditor({
  displayText,
  originalText,
  onComplete,
}: SmartSentenceEditorProps) {
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [currentReplacementIndex, setCurrentReplacementIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { getUnlockedCharacters } = useGameContext();

  // Parse the sentence to find replacements
  useEffect(() => {
    const parseReplacements = () => {
      const availableCharacters = getUnlockedCharacters();
      const parsedReplacements = SentenceParser.parseReplacements(
        displayText,
        originalText,
        availableCharacters
      );

      // Convert to our internal format with user interaction state
      const foundReplacements: Replacement[] = parsedReplacements.map(
        (parsed) => ({
          ...parsed,
          userInput: "",
          isComplete: false,
          isCorrect: false,
          isSkipped: false,
        })
      );

      setReplacements(foundReplacements);
    };

    // Only parse once when the component mounts or when displayText/originalText changes
    // Don't re-parse when getUnlockedCharacters changes to avoid resetting user progress
    parseReplacements();
  }, [displayText, originalText]); // Removed getUnlockedCharacters dependency

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || currentReplacementIndex >= replacements.length) return;

      const currentReplacement = replacements[currentReplacementIndex];
      if (!currentReplacement || currentReplacement.isComplete) return;

      if (e.key === "Enter") {
        // Skip current replacement
        handleSkipReplacement();
      } else if (e.key === "Backspace") {
        // Remove last character
        handleBackspace();
      } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        // Add character
        handleCharacterInput(e.key.toLowerCase());
      }

      e.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [replacements, currentReplacementIndex, isCompleted]);

  const handleCharacterInput = (char: string) => {
    const newReplacements = [...replacements];
    const current = newReplacements[currentReplacementIndex];

    if (!current || current.isComplete) return;

    current.userInput += char;

    // Check if the current input matches the expected answer
    if (current.userInput === current.expected) {
      current.isComplete = true;
      current.isCorrect = true;
      moveToNextReplacement();
    }

    setReplacements(newReplacements);
  };

  const handleBackspace = () => {
    const newReplacements = [...replacements];
    const current = newReplacements[currentReplacementIndex];

    if (!current || current.isComplete) return;

    current.userInput = current.userInput.slice(0, -1);
    setReplacements(newReplacements);
  };

  const handleSkipReplacement = () => {
    const newReplacements = [...replacements];
    const current = newReplacements[currentReplacementIndex];

    if (!current || current.isComplete) return;

    current.isComplete = true;
    current.isCorrect = false;
    current.isSkipped = true;
    current.userInput = current.expected; // Show correct answer

    setReplacements(newReplacements);
    moveToNextReplacement();
  };

  const moveToNextReplacement = () => {
    const nextIndex = currentReplacementIndex + 1;

    if (nextIndex >= replacements.length) {
      // All replacements complete - calculate score
      completeEditing();
    } else {
      setCurrentReplacementIndex(nextIndex);
    }
  };

  const completeEditing = () => {
    setIsCompleted(true);

    // Calculate score
    const correctCount = replacements.filter((r) => r.isCorrect).length;
    const totalCount = replacements.length;

    let calculatedScore: "perfect" | "almost" | "not-quite";
    if (correctCount === totalCount) {
      calculatedScore = "perfect";
    } else if (correctCount === totalCount - 1) {
      calculatedScore = "almost";
    } else {
      calculatedScore = "not-quite";
    }

    onComplete(calculatedScore);
  };

  // Render the sentence with interactive replacements
  const renderSentence = () => {
    if (replacements.length === 0) {
      return <span style={{ whiteSpace: "pre-wrap" }}>{displayText}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    replacements.forEach((replacement, index) => {
      // Add text before this replacement
      if (replacement.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${index}`} style={{ whiteSpace: "pre-wrap" }}>
            {displayText.slice(lastIndex, replacement.startIndex)}
          </span>
        );
      }

      // Add the replacement (either original char, user input, or completed state)
      let replacementContent = replacement.original;
      let replacementStyle: React.CSSProperties = { whiteSpace: "pre-wrap" };

      if (replacement.isComplete) {
        // Completed characters: show user input (or expected answer if skipped) with color styling
        replacementContent = replacement.userInput || replacement.expected;
        replacementStyle = {
          ...replacementStyle,
          color: replacement.isCorrect ? "#68d391" : "#e53e3e", // green for correct, red for incorrect
          fontWeight: "500",
        };
      } else if (index === currentReplacementIndex && !isCompleted) {
        // Current active character: blue color with highlight border
        if (replacement.userInput) {
          replacementContent = replacement.userInput;
        }
        replacementStyle = {
          ...replacementStyle,
          color: "#63b3ed",
          border: "2px solid #63b3ed",
          borderRadius: "4px",
          backgroundColor: "rgba(99, 179, 237, 0.1)",
          padding: "0.1rem 0.2rem",
          margin: "0 0.1rem",
        };
      } else {
        // Inactive editable characters: just blue color
        replacementStyle = {
          ...replacementStyle,
          color: "#63b3ed",
          fontWeight: "500",
        };
      }

      parts.push(
        <span key={`replacement-${index}`} style={replacementStyle}>
          {replacementContent}
        </span>
      );

      lastIndex = replacement.endIndex;
    });

    // Add remaining text
    if (lastIndex < displayText.length) {
      parts.push(
        <span key="text-end" style={{ whiteSpace: "pre-wrap" }}>
          {displayText.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  return (
    <div
      ref={editorRef}
      className="smart-sentence-editor"
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "8rem", // Increased to provide space for instruction text
        padding: "2rem",
      }}
      tabIndex={0}
    >
      <div
        style={{
          fontSize: "2rem",
          textAlign: "center",
          wordWrap: "normal",
          wordBreak: "keep-all",
          overflowWrap: "anywhere",
          lineBreak: "strict",
          hyphens: "none",
          lineHeight: 1.5,
          letterSpacing: "0.05em",
          wordSpacing: "0.3em",
          whiteSpace: "pre-wrap", // Changed to preserve spaces
          color: "#e2e8f0",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Hiragana Sans', 'Yu Gothic', 'Meiryo', sans-serif",
          marginBottom: "1rem", // Space between sentence and instruction
        }}
      >
        {renderSentence()}
      </div>

      {!isCompleted && replacements.length > 0 && (
        <div
          style={{
            fontSize: "0.9rem",
            color: "#a0aec0",
            opacity: 0.8,
            textAlign: "center",
          }}
        >
          Press Enter to skip • {currentReplacementIndex + 1} of{" "}
          {replacements.length}
        </div>
      )}
    </div>
  );
}
