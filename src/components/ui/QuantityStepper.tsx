import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  unit?: string;
  onDecrease: () => void;
  onIncrease: () => void;
  label: string;
}

/** Minus / amount / plus, with finger-sized buttons. */
export const QuantityStepper: React.FC<QuantityStepperProps> = ({ value, unit = '', onDecrease, onIncrease, label }) => (
  <div className="inline-flex items-center rounded-full border border-ink/25 bg-white" role="group" aria-label={label}>
    <button type="button" onClick={onDecrease} aria-label="Decrease quantity" className="icon-btn hover:bg-sand">
      <Minus size={16} />
    </button>
    <span className="num min-w-12 text-center text-sm font-semibold" aria-live="polite">
      {value}
      {unit}
    </span>
    <button type="button" onClick={onIncrease} aria-label="Increase quantity" className="icon-btn hover:bg-sand">
      <Plus size={16} />
    </button>
  </div>
);
