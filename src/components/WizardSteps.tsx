import React from 'react';
import { Check } from 'lucide-react';

interface WizardStepsProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  maxReachedStep: number;
}

export const WIZARD_STEPS = [
  { step: 1, label: 'Topic & Target' },
  { step: 2, label: 'Script & Research' },
  { step: 3, label: 'Visuals & Media' },
  { step: 4, label: 'Voice & Captions' },
  { step: 5, label: 'Studio Preview' },
  { step: 6, label: 'Render & Export' },
];

export const WizardSteps: React.FC<WizardStepsProps> = ({
  currentStep,
  onSelectStep,
  maxReachedStep,
}) => {
  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800 py-3 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4">
        {WIZARD_STEPS.map(({ step, label }) => {
          const isCompleted = step < currentStep || (step <= maxReachedStep && step !== currentStep);
          const isCurrent = step === currentStep;
          const isClickable = step <= maxReachedStep;

          return (
            <button
              key={step}
              onClick={() => isClickable && onSelectStep(step)}
              disabled={!isClickable}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isCurrent
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : isCompleted
                  ? 'text-slate-300 hover:text-white cursor-pointer'
                  : 'text-slate-500 cursor-not-allowed'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isCurrent
                    ? 'bg-indigo-600 text-white'
                    : isCompleted
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isCompleted && step < currentStep ? (
                  <Check className="w-3 h-3" />
                ) : (
                  step
                )}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
