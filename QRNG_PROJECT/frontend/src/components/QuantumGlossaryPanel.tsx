'use client';

import React from 'react';
import { useLearningLevel } from '@/context/LearningLevelContext';
import { QuantumConceptModal } from '@/components/education/QuantumConceptCard';

export const QuantumGlossaryPanel: React.FC = () => {
  const { showConceptModal, activeConcept, closeConcept } = useLearningLevel();

  return (
    <QuantumConceptModal
      isOpen={showConceptModal}
      conceptId={activeConcept}
      onClose={closeConcept}
    />
  );
};
