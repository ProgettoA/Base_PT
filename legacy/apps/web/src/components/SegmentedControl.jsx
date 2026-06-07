import React from 'react';
import { cn } from '@/lib/utils';

const SegmentedControl = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex p-1.5 bg-[#2d2d2d] rounded-full border border-gray-700 w-full max-w-md mx-auto mb-8 shadow-inner">
      <button
        onClick={() => onTabChange('personalTrainer')}
        className={cn(
          "flex-1 py-2.5 px-4 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ease-in-out",
          activeTab === 'personalTrainer'
            ? "bg-[#ff8c42] text-white shadow-md transform scale-[1.02]"
            : "text-gray-400 hover:text-gray-200 hover:bg-[#3d3d3d]"
        )}
      >
        Personal Trainer
      </button>
      <button
        onClick={() => onTabChange('osteopata')}
        className={cn(
          "flex-1 py-2.5 px-4 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ease-in-out",
          activeTab === 'osteopata'
            ? "bg-[#ff8c42] text-white shadow-md transform scale-[1.02]"
            : "text-gray-400 hover:text-gray-200 hover:bg-[#3d3d3d]"
        )}
      >
        Osteopata
      </button>
    </div>
  );
};

export default SegmentedControl;