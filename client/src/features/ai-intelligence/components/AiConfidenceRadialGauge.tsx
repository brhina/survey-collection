import React from 'react';

interface AiConfidenceRadialGaugeProps {
  score: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
}

export const AiConfidenceRadialGauge: React.FC<AiConfidenceRadialGaugeProps> = ({
  score,
  size = 72,
  strokeWidth = 7
}) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = '#10b981'; // emerald-500
  let bgColor = '#ecfdf5'; // emerald-50
  let textColor = 'text-emerald-700';

  if (normalizedScore < 60) {
    strokeColor = '#ef4444'; // red-500
    bgColor = '#fef2f2'; // red-50
    textColor = 'text-red-700';
  } else if (normalizedScore < 80) {
    strokeColor = '#f59e0b'; // amber-500
    bgColor = '#fffbeb'; // amber-50
    textColor = 'text-amber-700';
  }

  return (
    <div
      className="relative flex items-center justify-center shrink-0 rounded-full"
      style={{ width: size, height: size, backgroundColor: bgColor }}
      title={`Confidence Score: ${normalizedScore}% calculated via Bayesian consensus & volume`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-base font-black ${textColor} leading-none tracking-tight`}>
          {normalizedScore}%
        </span>
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter mt-0.5">
          Conf
        </span>
      </div>
    </div>
  );
};

export default AiConfidenceRadialGauge;
