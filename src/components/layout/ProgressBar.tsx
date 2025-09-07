import { useGameContext } from "../../hooks/useGameContext";

export function ProgressBar() {
  const { getProgressInfo } = useGameContext();
  const progress = getProgressInfo();

  const calculatePercentage = (completed: number, total: number): number => {
    if (total === 0) return 100;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="progress-bar">
      <div className="progress-item">
        <span className="progress-label">
          {progress.currentLevelProgress.levelName}
        </span>
        <div className="progress-visual">
          <div
            className="progress-fill"
            style={{
              width: `${calculatePercentage(
                progress.currentLevelProgress.completed,
                progress.currentLevelProgress.total,
              )}%`,
            }}
          />
        </div>
        <span className="progress-text">
          {progress.currentLevelProgress.completed}/
          {progress.currentLevelProgress.total}
        </span>
      </div>

      <div className="progress-item">
        <span className="progress-label">
          {progress.levelSetProgress.setName}
        </span>
        <div className="progress-visual">
          <div
            className="progress-fill"
            style={{
              width: `${calculatePercentage(
                progress.levelSetProgress.completed,
                progress.levelSetProgress.total,
              )}%`,
            }}
          />
        </div>
        <span className="progress-text">
          {progress.levelSetProgress.completed}/
          {progress.levelSetProgress.total}
        </span>
      </div>
    </div>
  );
}
