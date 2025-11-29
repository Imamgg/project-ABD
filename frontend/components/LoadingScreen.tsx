import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 w-full relative overflow-hidden rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      {/* Spinner */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-t-4 border-neon-cyan rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-4 border-neon-purple rounded-full animate-spin animation-delay-200"></div>
        <div className="absolute inset-4 border-b-4 border-neon-pink rounded-full animate-spin animation-delay-500"></div>
      </div>

      <h3 className="mt-8 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple animate-pulse">
        ANALYZING DATA...
      </h3>
      <p className="text-gray-400 text-sm mt-2 font-mono">Processing segmentation & forecasting models...</p>
      
      <div className="mt-6 flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="w-2 h-8 bg-neon-blue/40 rounded-sm animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;