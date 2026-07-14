import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().getFullYear()}</p>
        <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support.</p>
        <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and send related information.</p>
        <h2 className="text-xl font-semibold text-foreground">Data Security</h2>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>
        <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@qickbite.com" className="text-brand-500 hover:underline">privacy@qickbite.com</a>.</p>
      </div>
    </div>
  );
}
