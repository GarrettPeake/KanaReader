import { useGameContext } from "../../hooks/useGameContext";

export function SuccessScreen() {
  const { state, dispatch } = useGameContext();

  if (!state.isComplete) {
    return null;
  }

  const handleReset = () => {
    dispatch({ type: "RESET_GAME" });
  };

  return (
    <div className="success-screen">
      <div className="success-checkmark">✓</div>
      <h1>Congratulations!</h1>
      <p>You have completed all levels of KanaReader!</p>
      <p>You've mastered the basics of Japanese character recognition.</p>
      <button
        onClick={handleReset}
        className="btn"
        style={{ marginTop: "2rem" }}
      >
        Start Over
      </button>
    </div>
  );
}
