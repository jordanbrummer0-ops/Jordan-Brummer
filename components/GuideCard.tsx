import React, { useState } from 'react';
import { Guide } from '../types';

interface GuideCardProps {
  guide: Guide;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (id: number) => {
    setCompletedSteps(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const difficultyColor = {
    Easy: 'text-green-400 border-green-400/30 bg-green-400/10',
    Medium: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    Hard: 'text-red-400 border-red-400/30 bg-red-400/10',
  }[guide.difficulty];

  const progress = Math.round((completedSteps.length / guide.steps.length) * 100);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg hover:border-slate-600 transition-colors">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border mb-2 ${difficultyColor}`}>
              {guide.difficulty}
            </span>
            <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium rounded border border-blue-400/30 bg-blue-400/10 text-blue-400">
              MIUI {guide.miuiVersion}
            </span>
            <h3 className="text-xl font-bold text-white">{guide.title}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Updated</span>
            <span className="text-sm text-slate-300">{guide.updatedAt}</span>
          </div>
        </div>
        
        <p className="text-slate-400 text-sm mb-6">{guide.description}</p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 mb-6">
          <div 
            className="bg-mi-orange h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="space-y-3">
          {guide.steps.map((step, index) => (
            <div 
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-all ${
                completedSteps.includes(step.id) 
                  ? 'bg-slate-900/50 opacity-50' 
                  : 'bg-slate-700/30 hover:bg-slate-700/50'
              }`}
            >
              <div className={`mt-0.5 min-w-[20px] h-5 rounded border flex items-center justify-center ${
                completedSteps.includes(step.id)
                  ? 'bg-mi-orange border-mi-orange'
                  : 'border-slate-500'
              }`}>
                {completedSteps.includes(step.id) && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>
              <div>
                <span className={`text-sm ${completedSteps.includes(step.id) ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                  {step.text}
                </span>
                {step.note && (
                  <p className="text-xs text-orange-400 mt-1 italic">Note: {step.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuideCard;