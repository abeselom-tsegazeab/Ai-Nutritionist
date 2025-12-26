function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center p-8 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
        <h1 className="text-4xl font-bold text-white mb-4">Hello Tailwind!</h1>
        <p className="text-xl text-white/90 mb-6">This text should be styled if Tailwind is working</p>
        <div className="bg-white/30 p-4 rounded-lg inline-block">
          <p className="text-white">This should have a semi-transparent background</p>
        </div>
      </div>
    </div>
  );
}

export default App
