import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#08090D] text-gray-200">
      <div className="max-w-3xl mx-auto px-6 py-12 leading-relaxed">
        <Link href="/" className="text-[#F5B800] text-sm">&larr; Clutch</Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: November 7, 2026</p>

        <p>Clutch (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is an AI mental performance coaching app for athletes. This policy explains what we collect and how we use it.</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Information we collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Account information: your name and email address from Sign in with Apple or Sign in with Google.</li>
          <li>Content you provide: your sport, goals, profile details, training and wellness entries, and messages you send to the AI coach.</li>
          <li>Subscription information: your subscription status and a purchase identifier. Payment card details are handled by Apple or Stripe and never stored by us.</li>
          <li>Basic technical data such as device type and app version, used to keep the service working.</li>
        </ul>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> How we use it</h2>
        <p>To provide and personalize coaching, operate your account, process subscriptions, keep the service secure, and improve Clutch. We do not sell your personal information and we do not use it to track you across other companies&rsquo; apps or websites.</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Service providers</h2>
        <p>We share data only with providers that help us run Clutch: OpenAI (to generate AI coaching responses from your messages), Railway (hosting and database), Stripe (web payments), RevenueCat and Apple (in-app subscriptions), and Google and Apple (sign-in).</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Retention and deletion</h2>
        <p>We keep your data while your account is active. You can request deletion of your account and data at any time by emailing us at the address below, and we will delete it within 30 days.</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Not medical advice</h2>
        <p>Clutch offers mental performance coaching, not medical or psychological treatment. If you are in crisis, contact local emergency services.</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Children</h2>
        <p>Clutch is not directed at children under 13 and we do not knowingly collect their data.</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Contact</h2>
        <p>Questions or deletion requests: clutchmentality76@gmail.com</p>
      </div>
    </div>
  );
}
