import { EMOTIONS, EmotionType } from '../lib/emotionConstants';

interface EmotionPickerProps {
  selectedEmotion?: EmotionType;
  onSelect: (emotion: EmotionType) => void;
  className?: string;
}

export function EmotionPicker({ selectedEmotion, onSelect, className = '' }: EmotionPickerProps) {
  return (
    <div className={`emotion-picker ${className}`}>
      <div className="emotion-grid">
        {EMOTIONS.map(({ type, label, emoji, color, bg, border }) => {
          const isSelected = selectedEmotion === type;
          return (
            <button
              key={type}
              type="button"
              className={`emotion-chip ${isSelected ? 'selected' : ''}`}
              style={{
                '--emotion-color': color,
                '--emotion-bg': bg,
                '--emotion-border': border,
              } as React.CSSProperties}
              onClick={() => onSelect(type)}
              aria-label={label}
              aria-pressed={isSelected}
            >
              <span className="emotion-icon">{emoji}</span>
              <span className="emotion-label">{label}</span>
            </button>
          );
        })}
      </div>
      <style jsx>{`
        .emotion-picker {
          width: 100%;
        }
        .emotion-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
        }
        .emotion-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          border: 2px solid var(--emotion-border);
          border-radius: 12px;
          background: var(--emotion-bg);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .emotion-chip:hover:not(.selected) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .emotion-chip.selected {
          border-color: var(--emotion-color);
          background: var(--emotion-bg);
          box-shadow: 0 0 0 3px var(--emotion-bg), 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .emotion-chip:focus-visible {
          outline: 2px solid var(--emotion-color);
          outline-offset: 2px;
        }
        .emotion-icon {
          font-size: 24px;
          line-height: 1;
        }
        .emotion-label {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          text-align: center;
        }
        @media (max-width: 480px) {
          .emotion-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 6px;
          }
          .emotion-chip {
            padding: 10px 6px;
          }
          .emotion-icon {
            font-size: 20px;
          }
          .emotion-label {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}