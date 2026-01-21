export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-900/80 rounded-lg p-8 shadow-md border border-blue-300 mt-12">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Privacy Policy</h2>
      <p className="text-gray-800 dark:text-gray-200 mb-4">
        Isekai Gate values your privacy. We collect only the information necessary to provide a fun and safe fantasy social RPG experience. Your data will never be sold or shared with third parties except as required by law or to protect the community.
      </p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
        <li>We store your email, username, and profile data securely.</li>
        <li>We use cookies for authentication and session management.</li>
        <li>You can request data export or account deletion at any time.</li>
        <li>We comply with GDPR and other relevant privacy laws.</li>
      </ul>
      <p className="text-xs text-gray-500 mt-6">This policy may be updated at any time. Continued use of Isekai Gate constitutes acceptance of the latest policy.</p>
    </div>
  );
}
