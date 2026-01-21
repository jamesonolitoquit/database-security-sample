export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-900/80 rounded-lg p-8 shadow-md border border-yellow-300 mt-12">
      <h2 className="text-2xl font-bold text-yellow-700 mb-4 text-center">Terms of Service</h2>
      <p className="text-gray-800 dark:text-gray-200 mb-4">
        Welcome to Isekai Gate! By using this platform, you agree to abide by our rules and respect other adventurers. No cheating, harassment, or abuse will be tolerated. All content must be appropriate for a fantasy-themed community. For full details, please read the complete terms below.
      </p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
        <li>No spamming, hate speech, or harassment.</li>
        <li>No exploiting bugs or vulnerabilities.</li>
        <li>Respect privacy and do not share others' personal information.</li>
        <li>All adventures and battles are for fun—no real-world violence or threats.</li>
        <li>Admins reserve the right to moderate and remove content or users as needed.</li>
      </ul>
      <p className="text-xs text-gray-500 mt-6">These terms may be updated at any time. Continued use of Isekai Gate constitutes acceptance of the latest terms.</p>
    </div>
  );
}
