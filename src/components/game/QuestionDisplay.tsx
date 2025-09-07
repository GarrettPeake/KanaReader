import type { Question } from "../../types";

interface QuestionDisplayProps {
  question: Question;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  const getQuestionTypeLabel = (type: Question["type"]): string => {
    switch (type) {
      case "character-to-romanization":
        return "Type the romanization:";
      case "word-to-meaning":
        return "Type the meaning:";
      default:
        return "Answer:";
    }
  };

  return (
    <div
      className="sentence-display"
      style={{ flexDirection: "column", gap: "1rem" }}
    >
      <div
        style={{
          fontSize: "1rem",
          opacity: 0.8,
          color: "#a0aec0",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
        }}
      >
        {getQuestionTypeLabel(question.type)}
      </div>

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
        {question.prompt}
      </div>
    </div>
  );
}
