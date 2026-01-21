export default function PartyPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-pink-200 mb-4">Your Party</h2>
      <p className="text-white/80 mb-6">Form or join a party to adventure together and complete group quests!</p>
      {/* Party info and member list will go here */}
      <div className="bg-pink-800/40 rounded-lg p-6 border border-pink-400 text-center">
        <span className="text-pink-100">No party joined yet. Create or join a party to begin your adventure!</span>
      </div>
    </div>
  );
}
