import type { Question } from '../../types';

interface QuestionDisplayProps {
  question: Question;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  const getQuestionTypeLabel = (type: Question['type']): string => {
    switch (type) {
      case 'character-to-romanization':
        return 'Type the romanization:';
      case 'word-to-meaning':
        return 'Type the meaning:';
      default:
        return 'Answer:';
    }
  };

  const getDifficultyStyle = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return {
          borderColor: 'rgba(104, 211, 145, 0.6)', // Green for easy
          boxShadow: '0 0 12px rgba(104, 211, 145, 0.3)'
        };
      case 2:
        return {
          borderColor: 'rgba(237, 137, 54, 0.6)', // Orange for medium
          boxShadow: '0 0 12px rgba(237, 137, 54, 0.3)'
        };
      case 3:
        return {
          borderColor: 'rgba(229, 62, 62, 0.6)', // Red for hard
          boxShadow: '0 0 12px rgba(229, 62, 62, 0.3)'
        };
      default:
        return {};
    }
  };

  const difficultyStyles = getDifficultyStyle(question.difficulty);

  return (
    <div className="sentence-display" style={{ flexDirection: 'column', gap: '1rem' }}>
      <div 
        style={{ 
          fontSize: '1rem', 
          opacity: 0.8, 
          color: '#a0aec0',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
        }}
      >
        {getQuestionTypeLabel(question.type)}
      </div>
      
      <div 
        style={{ 
          fontSize: '4rem', 
          fontWeight: 'bold',
          color: '#e2e8f0',
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)',
          padding: '1rem 2rem',
          background: 'linear-gradient(135deg, rgba(45, 55, 72, 0.6) 0%, rgba(26, 32, 44, 0.6) 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(74, 85, 104, 0.3)',
          boxShadow: 
            'inset 4px 4px 8px rgba(20, 24, 35, 0.6), ' +
            'inset -4px -4px 8px rgba(45, 55, 72, 0.8), ' +
            '4px 4px 12px rgba(20, 24, 35, 0.4)',
          display: 'inline-block',
          ...difficultyStyles
        }}
      >
        {question.prompt}
      </div>
      
      <div 
        style={{ 
          fontSize: '0.85rem', 
          opacity: 0.6, 
          color: '#718096',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
        }}
      >
        {question.difficulty === 1 && '⭐ New Character'}
        {question.difficulty === 2 && '⭐⭐ Review'}
        {question.difficulty === 3 && '⭐⭐⭐ Challenge'}
      </div>
    </div>
  );
}