import { URGENCY_LEVELS } from '@lib/emotionConstants';
import type { UrgencyLevel } from '@lib/emotionConstants';

interface UrgencyPickerProps {
  selectedUrgency?: UrgencyLevel;
  onSelect: (urgency: UrgencyLevel) => void;
  className?: string;
}

export function UrgencyPicker({ selectedUrgency, onSelect, className = '' }: UrgencyPickerProps) {
  return (
    <div className={`urgency-picker ${className}`}>
      <div className="urgency-grid">
        {URGENCY_LEVELS.map(({ level, label, color, bg, icon }) => {
          const isSelected = selectedUrgency === level;
          return (
            <button
              key={level}
              type="button"
              className={`urgency-chip ${isSelected ? 'selected' : ''}`}
              style={
                {
                  '--urgency-color': color,
                  '--urgency-bg': bg,
                  '--urgency-border': color,
                } as React.CSSProperties
              }
              onClick={() => onSelect(level)}
              aria-label={label}
              aria-pressed={isSelected}
            >
              <span className="urgency-icon">{icon}</span>
              <span className="urgency-label">{label}</span>
            </button>
          );
        })}
      </div>
      <style jsx>{`
        .urgency-picker {
          width: 100%;
        }
        .urgency-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .urgency-chip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          border: 2px solid var(--urgency-border);
          border-radius: 10px;
          background: var(--urgency-bg);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          font-weight: 500;
          font-size: 14px;
        }
        .urgency-chip:hover:not(.selected) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .urgency-chip.selected {
          border-color: var(--urgency-color);
          background: var(--urgency-bg);
          box-shadow:
            0 0 0 2px var(--urgency-bg),
            0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .urgency-chip:focus-visible {
          outline: 2px solid var(--urgency-color);
          outline-offset: 2px;
        }
        .urgency-icon {
          font-size: 16px;
        }
        .urgency-label {
          color: #374151;
        }
        @media (max-width: 480px) {
          .urgency-grid {
            gap: 6px;
          }
          .urgency-chip {
            padding: 8px 10px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
