import React from 'react';

const TestTailwind = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Tailwind CSS Test
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          If you see colorful styled text, Tailwind is working!
        </p>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 inline-block">
          <p className="text-white">This should have glassmorphism effect</p>
        </div>
      </div>
    </div>
  );
};

export default TestTailwind;