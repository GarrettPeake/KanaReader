import { useGameContext } from "../../hooks/useGameContext";
import { ContentDisplay } from "./ContentDisplay";
import { InputField } from "./InputField";
import { FeedbackDisplay } from "./FeedbackDisplay";
import { SuccessScreen } from "./SuccessScreen";

export function MainGame() {
  const { state, getCurrentContentItem } = useGameContext();

  if (state.isComplete) {
    return <SuccessScreen />;
  }

  const currentContentItem = getCurrentContentItem();

  if (!currentContentItem) {
    return (
      <div className="game-container">
        <div className="sentence-display">Loading...</div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <ContentDisplay contentItem={currentContentItem} />
      {/* Only show InputField for questions, not sentences (which now use SmartSentenceEditor) */}
      {currentContentItem.type === "question" && <InputField />}
      <FeedbackDisplay />
    </div>
  );
}
