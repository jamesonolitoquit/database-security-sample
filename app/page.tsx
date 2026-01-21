export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-extrabold text-yellow-300 drop-shadow-lg mb-2">Welcome to Isekai Gate</h1>
      <p className="text-lg text-white/90 max-w-xl text-center">
        Step through the portal to a new world of adventure! Level up, complete quests, join parties, and connect with fellow adventurers in a fantasy social RPG experience.
      </p>
      <div className="flex gap-4 mt-6">
        <a href="/quests" className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded shadow">View Quests</a>
        <a href="/leaderboards" className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-2 px-6 rounded shadow">Leaderboards</a>
      </div>
    </div>
  );
}
