import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SentenceDisplay } from '../game/SentenceDisplay';
import { useGameContext } from '../../hooks/useGameContext';

// Mock the useGameContext hook
vi.mock('../../hooks/useGameContext');

describe('SentenceDisplay', () => {
  const mockUseGameContext = useGameContext as ReturnType<typeof vi.fn>;

  test('should render plain text for tutorial mode', () => {
    mockUseGameContext.mockReturnValue({
      getCurrentContentItem: () => ({
        id: 'test-1',
        type: 'sentence',
        displayText: 'Hello world',
        originalText: 'Hello world'
      }),
    });

    render(<SentenceDisplay />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  test('should render Japanese characters naturally integrated', () => {
    mockUseGameContext.mockReturnValue({
      getCurrentContentItem: () => ({
        id: 'test-2',
        type: 'sentence',
        displayText: 'I have ア cat',
        originalText: 'I have a cat'
      }),
    });

    render(<SentenceDisplay />);
    expect(screen.getByText('I have ア cat')).toBeInTheDocument();
  });

  test('should handle mixed Japanese and English text', () => {
    mockUseGameContext.mockReturnValue({
      getCurrentContentItem: () => ({
        id: 'test-3',
        type: 'sentence',
        displayText: 'こんにちは world テスト',
        originalText: 'hello world test'
      }),
    });

    render(<SentenceDisplay />);
    expect(screen.getByText('こんにちは world テスト')).toBeInTheDocument();
  });

  test('should handle empty sentence', () => {
    mockUseGameContext.mockReturnValue({
      getCurrentContentItem: () => null,
    });

    render(<SentenceDisplay />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});