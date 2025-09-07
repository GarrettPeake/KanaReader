import { useGameContext } from "../../hooks/useGameContext";

export function SentenceDisplay() {
  const { getCurrentContentItem } = useGameContext();
  const contentItem = getCurrentContentItem();

  return (
    <div className="sentence-display">
      {contentItem?.displayText || "Loading..."}
    </div>
  );
}
