'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LearningLevel = 'explorer' | 'student' | 'scholar';

interface LearningLevelContextType {
  level: LearningLevel;
  setLevel: (level: LearningLevel) => void;
  showConceptModal: boolean;
  setShowConceptModal: (show: boolean) => void;
  activeConcept: string | null;
  openConcept: (conceptId: string) => void;
  closeConcept: () => void;
}

const LearningLevelContext = createContext<LearningLevelContextType | undefined>(undefined);

export const LearningLevelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [level, setLevelState] = useState<LearningLevel>('explorer');
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [activeConcept, setActiveConcept] = useState<string | null>(null);

  useEffect(() => {
    const savedLevel = localStorage.getItem('qrng_learning_level') as LearningLevel;
    if (savedLevel && ['explorer', 'student', 'scholar'].includes(savedLevel)) {
      setLevelState(savedLevel);
    }
  }, []);

  const setLevel = (newLevel: LearningLevel) => {
    setLevelState(newLevel);
    localStorage.setItem('qrng_learning_level', newLevel);
  };

  const openConcept = (conceptId: string) => {
    setActiveConcept(conceptId);
    setShowConceptModal(true);
  };

  const closeConcept = () => {
    setShowConceptModal(false);
    setActiveConcept(null);
  };

  return (
    <LearningLevelContext.Provider
      value={{
        level,
        setLevel,
        showConceptModal,
        setShowConceptModal,
        activeConcept,
        openConcept,
        closeConcept,
      }}
    >
      {children}
    </LearningLevelContext.Provider>
  );
};

export const useLearningLevel = () => {
  const context = useContext(LearningLevelContext);
  if (!context) {
    throw new Error('useLearningLevel must be used within a LearningLevelProvider');
  }
  return context;
};
