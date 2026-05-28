'use client';
import { Loader2, Check } from 'lucide-react';

interface SolvedCheckboxProps {
  isSolved: boolean;
  isLoading: boolean;
  disabled?: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}

export default function SolvedCheckbox({
  isSolved,
  isLoading,
  disabled = false,
  onToggle,
  size = 'sm',
}: SolvedCheckboxProps) {
  const dim = size === 'sm' ? 18 : 22;
  const boxDim = size === 'sm' ? 'w-[18px] h-[18px]' : 'w-[22px] h-[22px]';

  const isDisabled = disabled || isLoading;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isDisabled) onToggle();
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isSolved}
      aria-label={isSolved ? 'Mark problem as unsolved' : 'Mark problem as solved'}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative flex items-center justify-center
        ${boxDim}
        rounded-md
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-1 focus:ring-offset-[#09090B]
        disabled:cursor-not-allowed
        ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
        ${!isDisabled && 'hover:scale-105 active:scale-95'}
        ${
          isSolved
            ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
            : 'bg-transparent border border-zinc-600 hover:border-zinc-500 hover:bg-white/5'
        }
      `}
      title={
        isLoading
          ? 'Saving...'
          : isSolved
          ? 'Mark Unsolved'
          : 'Mark Solved'
      }
    >
      {isLoading ? (
        <Loader2
          size={dim - 4}
          className="text-emerald-400 animate-spin"
        />
      ) : isSolved ? (
        <Check
          size={dim - 4}
          className="text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]"
          strokeWidth={3}
        />
      ) : null}
    </button>
  );
}
