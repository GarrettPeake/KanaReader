import { useState, useEffect } from 'react';
import { useGameContext } from '../../hooks/useGameContext';
import { LEVEL_SETS } from '../../data';
import { CharacterTable } from './CharacterTable';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function SideMenu() {
  const { state, dispatch } = useGameContext();
  const [activeTab, setActiveTab] = useState(state.currentLevelSetId);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showKanjiDropdown, setShowKanjiDropdown] = useState(false);

  useEffect(() => {
    setActiveTab(state.currentLevelSetId);
  }, [state.currentLevelSetId]);

  const closeMenu = () => {
    dispatch({ type: 'TOGGLE_MENU' });
  };

  const resetProgress = () => {
    setShowResetDialog(true);
  };

  const handleConfirmReset = () => {
    dispatch({ type: 'RESET_GAME' });
    setShowResetDialog(false);
    closeMenu();
  };

  const handleCancelReset = () => {
    setShowResetDialog(false);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`menu-overlay ${state.menuOpen ? 'visible' : ''}`}
        onClick={closeMenu}
      />
      
      {/* Side Menu */}
      <div className={`side-menu ${state.menuOpen ? 'open' : ''}`}>
        <div style={{ 
          padding: '1rem', 
          borderBottom: '1px solid rgba(74, 85, 104, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#2d3748'
        }}>
          <h2 style={{ margin: 0, color: '#e2e8f0', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>Progress</h2>
          <button 
            onClick={closeMenu}
            style={{
              background: 'transparent',
              border: 'none',
              width: '32px',
              height: '32px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: '0.8',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.opacity = '1';
              (e.target as HTMLButtonElement).style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.opacity = '0.8';
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
        </div>

        {/* Level Set Tabs */}
        <div style={{ 
          borderBottom: '1px solid rgba(74, 85, 104, 0.3)',
          background: '#2d3748'
        }}>
          <div style={{ padding: '0' }}>
            {/* Basic level sets (non-JLPT kanji) */}
            {LEVEL_SETS.filter(levelSet => !levelSet.id.startsWith('jlpt_')).map((levelSet) => {
              const isCompleted = levelSet.characterMappings.length === 0 || 
                levelSet.characterMappings.every(char => state.unlockedCharacters.has(char.id));
              const isActive = activeTab === levelSet.id;
              const isCurrent = levelSet.id === state.currentLevelSetId;
              
              const getProgressStyles = () => {
                if (isCompleted) {
                  return {
                    background: isActive ? 'rgba(99, 179, 237, 0.2)' : 'rgba(104, 211, 145, 0.1)',
                    color: isActive ? '#63b3ed' : '#68d391',
                    borderLeft: isActive ? '3px solid #63b3ed' : '3px solid rgba(104, 211, 145, 0.6)',
                    opacity: 1
                  };
                } else if (isCurrent) {
                  return {
                    background: isActive ? 'rgba(99, 179, 237, 0.2)' : 'rgba(99, 179, 237, 0.1)',
                    color: isActive ? '#63b3ed' : '#63b3ed',
                    borderLeft: '3px solid #63b3ed',
                    opacity: 1
                  };
                } else {
                  return {
                    background: isActive ? 'rgba(99, 179, 237, 0.2)' : 'transparent',
                    color: isActive ? '#63b3ed' : '#a0aec0',
                    borderLeft: isActive ? '3px solid #63b3ed' : '3px solid transparent',
                    opacity: 1,
                    cursor: 'pointer'
                  };
                }
              };
              
              const progressStyles = getProgressStyles();

              return (
                <div
                  key={levelSet.id}
                  onClick={() => {
                    setActiveTab(levelSet.id);
                    if (levelSet.id !== state.currentLevelSetId) {
                      dispatch({
                        type: 'JUMP_TO_LEVEL',
                        payload: {
                          levelSetId: levelSet.id,
                          characterIndex: 0
                        }
                      });
                      closeMenu();
                    }
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(74, 85, 104, 0.2)',
                    background: progressStyles.background,
                    color: progressStyles.color,
                    cursor: progressStyles.cursor || 'pointer',
                    fontSize: '0.9rem',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    borderLeft: progressStyles.borderLeft,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: progressStyles.opacity
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.target as HTMLDivElement).style.background = 'rgba(99, 179, 237, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.target as HTMLDivElement).style.background = progressStyles.background;
                    }
                  }}
                >
                  <span>{levelSet.name}</span>
                  {isCompleted && (
                    <span style={{ 
                      color: '#68d391', 
                      fontSize: '1.2rem',
                      opacity: 0.8 
                    }}>✓</span>
                  )}
                </div>
              );
            })}

            {/* Kanji Level Sets Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowKanjiDropdown(!showKanjiDropdown)}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid rgba(74, 85, 104, 0.2)',
                  background: LEVEL_SETS.some(ls => ls.id.startsWith('jlpt_') && ls.id === state.currentLevelSetId) ? 
                    'rgba(99, 179, 237, 0.1)' : 'transparent',
                  color: LEVEL_SETS.some(ls => ls.id.startsWith('jlpt_') && ls.id === state.currentLevelSetId) ? 
                    '#63b3ed' : '#a0aec0',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  borderLeft: LEVEL_SETS.some(ls => ls.id.startsWith('jlpt_') && ls.id === state.currentLevelSetId) ? 
                    '3px solid #63b3ed' : '3px solid transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!LEVEL_SETS.some(ls => ls.id.startsWith('jlpt_') && ls.id === state.currentLevelSetId)) {
                    (e.target as HTMLDivElement).style.background = 'rgba(99, 179, 237, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!LEVEL_SETS.some(ls => ls.id.startsWith('jlpt_') && ls.id === state.currentLevelSetId)) {
                    (e.target as HTMLDivElement).style.background = 'transparent';
                  }
                }}
              >
                <span>Kanji (JLPT Levels)</span>
                <span style={{ 
                  fontSize: '0.8rem',
                  transform: showKanjiDropdown ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>▶</span>
              </div>

              {/* Dropdown Menu */}
              {showKanjiDropdown && (
                <div style={{
                  background: '#1a202c',
                  borderLeft: '3px solid #63b3ed',
                  borderBottom: '1px solid rgba(74, 85, 104, 0.2)',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {LEVEL_SETS.filter(levelSet => levelSet.id.startsWith('jlpt_')).map((levelSet) => {
                    const isCompleted = levelSet.characterMappings.length === 0 || 
                      levelSet.characterMappings.every(char => state.unlockedCharacters.has(char.id));
                    const isActive = activeTab === levelSet.id;
                    const isCurrent = levelSet.id === state.currentLevelSetId;

                    return (
                      <div
                        key={levelSet.id}
                        onClick={() => {
                          setActiveTab(levelSet.id);
                          if (levelSet.id !== state.currentLevelSetId) {
                            dispatch({
                              type: 'JUMP_TO_LEVEL',
                              payload: {
                                levelSetId: levelSet.id,
                                characterIndex: 0
                              }
                            });
                            closeMenu();
                          }
                          setShowKanjiDropdown(false);
                        }}
                        style={{
                          padding: '0.5rem 2rem',
                          background: isCurrent ? 'rgba(99, 179, 237, 0.2)' : 
                                     isActive ? 'rgba(99, 179, 237, 0.1)' : 'transparent',
                          color: isCurrent ? '#63b3ed' : isActive ? '#63b3ed' : '#a0aec0',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderLeft: isCurrent ? '2px solid #63b3ed' : '2px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            (e.target as HTMLDivElement).style.background = 'rgba(99, 179, 237, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            (e.target as HTMLDivElement).style.background = 'transparent';
                          }
                        }}
                      >
                        <span>{levelSet.name}</span>
                        {isCompleted && (
                          <span style={{ 
                            color: '#68d391', 
                            fontSize: '1rem',
                            opacity: 0.8 
                          }}>✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Character Tables */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#2d3748' }}>
          {LEVEL_SETS.map((levelSet) => (
            <CharacterTable 
              key={levelSet.id}
              levelSet={levelSet}
              isActive={activeTab === levelSet.id}
            />
          ))}
          
          {/* Special handling for tutorial */}
          {activeTab === 'tutorial' && (
            <div style={{ padding: '1rem' }}>
              <h3 style={{ color: '#e2e8f0', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>Tutorial</h3>
              <p style={{ color: '#a0aec0', lineHeight: 1.5 }}>
                Complete the tutorial to unlock character learning modes.
              </p>
            </div>
          )}

          {/* Special handling for practice */}
          {activeTab === 'practice' && (
            <div style={{ padding: '1rem' }}>
              <h3 style={{ color: '#e2e8f0', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>Practice Mode</h3>
              <p style={{ color: '#a0aec0', lineHeight: 1.5 }}>
                Mixed practice with longer sentences using all unlocked characters.
              </p>
            </div>
          )}
        </div>

        {/* Footer with Reset Button */}
        <div style={{ 
          padding: '1rem', 
          borderTop: '1px solid rgba(74, 85, 104, 0.3)',
          background: '#2d3748'
        }}>
          <button
            onClick={resetProgress}
            className="reset-button"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
              color: '#fff',
              border: '1px solid rgba(229, 62, 62, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: '3px 3px 6px rgba(20, 24, 35, 0.6), -3px -3px 6px rgba(74, 85, 104, 0.3)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            Reset Progress
          </button>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showResetDialog}
        title="Reset Progress"
        message="Are you sure you want to reset all progress? This action cannot be undone and you will lose all unlocked characters and completed levels."
        confirmText="Reset All"
        cancelText="Keep Progress"
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
        variant="danger"
      />
    </>
  );
}