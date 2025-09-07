import { useGameContext } from '../../hooks/useGameContext';

export function FeedbackDisplay() {
  const { state } = useGameContext();

  if (!state.showFeedback || state.showLevelTransition || state.showLevelSetTransition) {
    return null;
  }

  return (
    <div className={`feedback ${state.feedbackType}`}>
      {state.feedbackMessage}
    </div>
  );
}