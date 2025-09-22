import React, { useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional theme tokens used in inline styles and CSS.
 * We keep components minimal and composable for future extension.
 */

const THEME = {
  colors: {
    primary: '#2563EB', // blue
    secondary: '#F59E0B', // amber
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#111827',
    error: '#EF4444',
  },
  shadow: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.05)',
  radius: '16px',
};

// Helpers
const LINES = [
  [0, 1, 2], // rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // cols
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diags
  [2, 4, 6],
];

function calculateWinner(squares) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

function isDraw(squares) {
  return squares.every(Boolean) && !calculateWinner(squares);
}

// PUBLIC_INTERFACE
export function useTicTacToeState() {
  /**
   * This hook encapsulates Tic Tac Toe game state and logic.
   * Returns board state, player, status info, and handlers.
   */
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);

  const current = history[step];

  const winnerInfo = useMemo(() => calculateWinner(current), [current]);
  const draw = useMemo(() => isDraw(current), [current]);
  const currentPlayer = xIsNext ? 'X' : 'O';

  // PUBLIC_INTERFACE
  const playAt = (index) => {
    if (winnerInfo || current[index]) return; // ignore if game over or cell filled
    const next = current.slice();
    next[index] = currentPlayer;

    const trimmed = history.slice(0, step + 1);
    setHistory([...trimmed, next]);
    setStep(step + 1);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const reset = () => {
    setHistory([Array(9).fill(null)]);
    setStep(0);
    setXIsNext(true);
  };

  // PUBLIC_INTERFACE
  const jumpTo = (toStep) => {
    setStep(toStep);
    setXIsNext(toStep % 2 === 0);
  };

  // PUBLIC_INTERFACE
  const statusMessage = () => {
    if (winnerInfo) {
      return `Player ${winnerInfo.player} wins!`;
    }
    if (draw) {
      return "It's a draw.";
    }
    return `Player ${currentPlayer}'s turn`;
  };

  return {
    board: current,
    xIsNext,
    currentPlayer,
    winnerInfo,
    draw,
    history,
    step,
    playAt,
    jumpTo,
    reset,
    statusMessage,
  };
}

// UI Components

function GradientCard({ children, style }) {
  return (
    <div
      style={{
        borderRadius: THEME.radius,
        background: `linear-gradient(135deg, rgba(37,99,235,0.06), rgba(249,250,251,0.9))`,
        padding: 20,
        boxShadow: THEME.shadow,
        border: '1px solid rgba(17,24,39,0.05)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 16, textAlign: 'center' }}>
      <h1
        style={{
          margin: 0,
          color: THEME.colors.text,
          fontSize: 28,
          letterSpacing: 0.2,
          fontWeight: 700,
        }}
      >
        Tic Tac Toe
      </h1>
      <p
        style={{
          marginTop: 8,
          color: 'rgba(17,24,39,0.7)',
          fontSize: 14,
        }}
      >
        Two-player classic. Take turns placing marks on the 3×3 grid.
      </p>
    </div>
  );
}

function StatusBar({ text, highlight }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: THEME.colors.surface,
        borderRadius: 12,
        padding: '12px 16px',
        border: '1px solid rgba(17,24,39,0.06)',
      }}
    >
      <span
        style={{
          color: THEME.colors.text,
          fontWeight: 600,
        }}
      >
        {text}
      </span>
      {highlight ? (
        <span
          style={{
            color: highlight === 'X' ? THEME.colors.primary : THEME.colors.secondary,
            fontWeight: 700,
            background:
              highlight === 'X'
                ? 'rgba(37,99,235,0.12)'
                : 'rgba(245,158,11,0.15)',
            padding: '6px 10px',
            borderRadius: 999,
          }}
        >
          {highlight}
        </span>
      ) : null}
    </div>
  );
}

function ControlBar({ onReset, onUndo, canUndo }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="btn"
        style={{
          background: '#ffffff',
          color: THEME.colors.text,
          border: `1px solid rgba(17,24,39,0.12)`,
        }}
        aria-label="Undo last move"
        title="Undo last move"
      >
        ⤺ Undo
      </button>
      <button
        onClick={onReset}
        className="btn"
        style={{
          background: THEME.colors.primary,
          color: '#fff',
          border: 'none',
        }}
        aria-label="Reset game"
        title="Reset game"
      >
        ↺ Reset
      </button>
    </div>
  );
}

function Square({ value, onClick, isWinning }) {
  return (
    <button
      onClick={onClick}
      className="square"
      aria-label={value ? `Cell with ${value}` : 'Empty cell'}
      style={{
        background: '#ffffff',
        border: `1px solid rgba(17,24,39,0.12)`,
        borderRadius: 12,
        boxShadow: isWinning ? `0 0 0 3px rgba(245,158,11,0.3)` : 'none',
        color: value === 'X' ? THEME.colors.primary : value === 'O' ? THEME.colors.secondary : THEME.colors.text,
        fontWeight: 800,
        transition: 'transform 120ms ease, box-shadow 200ms ease, background 150ms ease',
      }}
      onMouseDown={(e) => {
        // subtle press effect
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {value}
    </button>
  );
}

function Board({ squares, onPlay, winnerLine }) {
  return (
    <div
      className="board"
      role="grid"
      aria-label="Tic Tac Toe board"
      style={{
        background: `linear-gradient(180deg, rgba(37,99,235,0.04), rgba(249,250,251,0.5))`,
        padding: 12,
        borderRadius: 16,
        border: '1px solid rgba(17,24,39,0.05)',
        boxShadow: THEME.shadow,
      }}
    >
      {squares.map((sq, idx) => {
        const isWinning = winnerLine?.includes(idx);
        return (
          <Square
            key={idx}
            value={sq}
            onClick={() => onPlay(idx)}
            isWinning={isWinning}
          />
        );
      })}
    </div>
  );
}

function History({ history, step, onJump }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {history.map((_, idx) => (
        <button
          key={idx}
          onClick={() => onJump(idx)}
          className="chip"
          aria-label={`Go to move #${idx}`}
          style={{
            background: idx === step ? 'rgba(37,99,235,0.12)' : '#ffffff',
            color: idx === step ? THEME.colors.primary : THEME.colors.text,
            border:
              idx === step
                ? `1px solid rgba(37,99,235,0.35)`
                : `1px solid rgba(17,24,39,0.12)`,
            fontWeight: idx === step ? 700 : 500,
          }}
        >
          {idx === 0 ? 'Start' : `Move ${idx}`}
        </button>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Main application component orchestrating the layout and game.
   */
  const {
    board,
    currentPlayer,
    winnerInfo,
    draw,
    history,
    step,
    playAt,
    jumpTo,
    reset,
    statusMessage,
  } = useTicTacToeState();

  return (
    <div
      className="app-shell"
      style={{
        minHeight: '100vh',
        background: THEME.colors.background,
        color: THEME.colors.text,
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
    >
      <div
        className="container"
        style={{
          width: '100%',
          maxWidth: 960,
        }}
      >
        <GradientCard style={{ margin: '0 auto', maxWidth: 720 }}>
          <Header />

          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: '1fr',
            }}
          >
            <StatusBar
              text={statusMessage()}
              highlight={!winnerInfo && !draw ? currentPlayer : undefined}
            />

            <div
              style={{
                display: 'grid',
                gap: 18,
                justifyItems: 'center',
              }}
            >
              <Board
                squares={board}
                onPlay={playAt}
                winnerLine={winnerInfo?.line}
              />

              <ControlBar
                onReset={reset}
                onUndo={() => (step > 0 ? jumpTo(step - 1) : null)}
                canUndo={step > 0 && !winnerInfo}
              />
            </div>

            <div>
              <h3
                style={{
                  margin: '12px 0 8px',
                  fontSize: 14,
                  color: 'rgba(17,24,39,0.7)',
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                }}
              >
                History
              </h3>
              <History history={history} step={step} onJump={jumpTo} />
            </div>
          </div>
        </GradientCard>
      </div>
    </div>
  );
}

export default App;
