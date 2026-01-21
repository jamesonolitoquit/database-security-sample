export default function BattlePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-red-300 mb-4">Monster Battle</h2>
      <p className="text-white/80 mb-6">Face off against monsters to earn XP, loot, and glory!</p>
      {/* Battle UI will go here */}
      <div className="bg-red-800/40 rounded-lg p-6 border border-red-400 text-center">
        <span className="text-red-100">No battles available. Seek out a quest or party to find monsters!</span>
      </div>
    </div>
  );
}
