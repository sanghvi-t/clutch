import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#08090D] text-gray-200">
      <div className="max-w-3xl mx-auto px-6 py-12 leading-relaxed">
        <Link href="/" className="text-[#F5B800] text-sm">&larr; Clutch</Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">Terms of Use</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: November 7, 2026</p>

        <p>By using Clutch you agree to these terms.</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Use of the service</h2>
        <p>Clutch provides AI-generated mental performance coaching for general informational purposes. It is not medical, psychological or professional advice. You are responsible for how you use it.</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Subscriptions</h2>
        <p>Paid plans (Pro and Elite) renew automatically unless cancelled at least 24 hours before the end of the current period. Payment is charged to your Apple ID account at confirmation of purchase. Manage or cancel any time in your Apple ID account settings. Subscriptions bought on the web are managed through the billing portal.</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Acceptable use</h2>
        <p>Do not misuse the service, attempt to disrupt it, or use it unlawfully. We may suspend accounts that do.</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Disclaimer</h2>
        <p>The service is provided &ldquo;as is&rdquo; without warranties. To the extent permitted by law, we are not liable for indirect or consequential damages arising from use of Clutch.</p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-2"> Contact</h2>
        <p>clutchmentality76@gmail.com</p>
      </div>
    </div>
  );
}
