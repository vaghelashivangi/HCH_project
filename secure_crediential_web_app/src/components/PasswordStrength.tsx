import React from 'react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const result = zxcvbn(password);
  const score = result.score;

  const getColor = () => {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-500';
      case 4: return 'bg-emerald-500';
      default: return 'bg-gray-200';
    }
  };

  const getLabel = () => {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return 'No Password';
    }
  };

  return (
    <div className="w-full space-y-1">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${(score + 1) * 20}%` }}
        />
      </div>
      <p className="text-sm text-gray-600">{getLabel()}</p>
    </div>
  );
};