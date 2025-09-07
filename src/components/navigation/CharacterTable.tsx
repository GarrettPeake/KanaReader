import type { LevelSet } from "../../types";
import { useGameContext } from "../../hooks/useGameContext";

interface CharacterTableProps {
  levelSet: LevelSet;
  isActive: boolean;
}

export function CharacterTable({ levelSet, isActive }: CharacterTableProps) {
  const { state, dispatch, getUnlockedCharacters } = useGameContext();
  const unlockedCharacters = new Set(
    getUnlockedCharacters().map((char) => char.id),
  );

  const handleCharacterClick = (characterIndex: number) => {
    // Allow jumping to any character
    const character = levelSet.characterMappings[characterIndex];
    if (character) {
      dispatch({
        type: "JUMP_TO_LEVEL",
        payload: { levelSetId: levelSet.id, characterIndex },
      });
    }
  };

  if (!isActive || levelSet.characterMappings.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h3
        style={{
          marginBottom: "1rem",
          color: "#e2e8f0",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
        }}
      >
        {levelSet.name} Characters
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(60px, 1fr))",
          gap: "0.5rem",
        }}
      >
        {levelSet.characterMappings.map((character, index) => {
          const isUnlocked = unlockedCharacters.has(character.id);
          const isCurrent =
            state.currentLevelSetId === levelSet.id &&
            state.currentCharacterIndex === index;

          // Determine character state for styling
          let characterState;
          if (isCurrent) {
            characterState = "current";
          } else if (isUnlocked) {
            characterState = "completed";
          } else {
            characterState = "incomplete";
          }

          const getCharacterStyles = () => {
            switch (characterState) {
              case "current":
                return {
                  border: "2px solid #63b3ed",
                  background:
                    "linear-gradient(135deg, rgba(99, 179, 237, 0.2) 0%, rgba(45, 55, 72, 0.8) 100%)",
                  color: "#63b3ed",
                  boxShadow: "0 0 12px rgba(99, 179, 237, 0.4)",
                };
              case "completed":
                return {
                  border: "2px solid rgba(104, 211, 145, 0.6)",
                  background:
                    "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
                  color: "#a0aec0",
                  boxShadow:
                    "3px 3px 6px rgba(20, 24, 35, 0.6), -3px -3px 6px rgba(74, 85, 104, 0.3)",
                };
              case "incomplete":
              default:
                return {
                  border: "2px solid rgba(74, 85, 104, 0.3)",
                  background:
                    "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
                  color: "#718096",
                  boxShadow:
                    "3px 3px 6px rgba(20, 24, 35, 0.6), -3px -3px 6px rgba(74, 85, 104, 0.3)",
                };
            }
          };

          const characterStyles = getCharacterStyles();

          return (
            <button
              key={character.id}
              onClick={() => handleCharacterClick(index)}
              style={{
                padding: "0.75rem",
                border: characterStyles.border,
                borderRadius: "12px",
                background: characterStyles.background,
                color: characterStyles.color,
                cursor: "pointer",
                fontSize: "1.2rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
                boxShadow: characterStyles.boxShadow,
              }}
              title={`${character.character} (${character.romanizations.join("/")}) - ${character.pronunciation}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "4px 4px 8px rgba(20, 24, 35, 0.7), -4px -4px 8px rgba(74, 85, 104, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = characterStyles.boxShadow;
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{character.character}</span>
              <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                {character.romanizations[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
