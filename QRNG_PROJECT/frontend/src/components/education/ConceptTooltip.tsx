'use client';

import React from 'react';
import { useLearningLevel } from '@/context/LearningLevelContext';
import { HelpCircle } from 'lucide-react';
import { QUANTUM_CONCEPTS } from './QuantumConceptCard';

export const ConceptTrigger: React.FC<{ conceptId: string; children?: React.ReactNode }> = ({
  conceptId,
  children,
}) => {
  const { openConcept } = useLearningLevel();
  const concept = QUANTUM_CONCEPTS[conceptId];

  return (
    <button
      onClick={() => openConcept(conceptId)}
      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/40 hover:decoration-cyan-400 transition-colors font-medium cursor-pointer"
      title={`Learn about ${concept?.title || conceptId}`}
    >
      {children || concept?.title || conceptId}
      <HelpCircle className="w-3.5 h-3.5 inline text-cyan-400/80" />
    </button>
  );
};
