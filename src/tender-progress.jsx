import React from 'react';

/**
 * Composant de progression circulaire intelligent pour les Appels d'Offres
 * Calcule l'état visuel en fonction des dates de début et de fin.
 */
export const TenderRadialProgress = ({ stages = [], size = 80, strokeWidth = 6 }) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const now = new Date();

  // Si pas d'étapes, on affiche un cercle vide par défaut
  if (!stages || stages.length === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  // Calcul du progrès global basé sur les étapes terminées ou le temps écoulé
  let totalProgress = 0;
  const stageWeight = 100 / stages.length;

  stages.forEach(stage => {
    const start = new Date(stage.start);
    const end = new Date(stage.end);

    if (now > end) {
      totalProgress += stageWeight; // Étape terminée
    } else if (now > start) {
      // Étape en cours : calcul du ratio temporel
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      const progress = (elapsed / totalDuration) * stageWeight;
      totalProgress += Math.max(0, Math.min(stageWeight, progress));
    }
  });

  const offset = circumference - (totalProgress / 100) * circumference;

  // Détermination de la couleur principale
  let strokeColor = 'var(--gold)'; // Par défaut Or
  const currentStage = stages.find(s => now >= new Date(s.start) && now <= new Date(s.end));
  
  if (totalProgress >= 100) strokeColor = '#10b981'; // Vert si fini
  else if (currentStage && now > new Date(currentStage.end)) strokeColor = '#ef4444'; // Rouge si retard

  return (
    <div className="radial-progress-container" style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Cercle de fond */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth}
        />
        {/* Cercle de progression */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
        />
      </svg>
      {/* Texte au centre */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.22, fontWeight: 'bold', color: 'white'
      }}>
        {Math.round(totalProgress)}%
      </div>
    </div>
  );
};
