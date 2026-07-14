import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().getFullYear()}</p>
        <h2 className="text-xl font-semibold text-foreground">Acceptance of Terms</h2>
        <p>By accessing and using QuickBite, you accept and agree to be bound by the terms and provision of this agreement.</p>
        <h2 className="text-xl font-semibold text-foreground">Use of Service</h2>
        <p>QuickBite provides a platform for restaurant discovery, table reservations, and food pre-ordering. You agree to use this service only for lawful purposes.</p>
        <h2 className="text-xl font-semibold text-foreground">Reservations and Orders</h2>
        <p>All bookings and orders are subject to restaurant availability and confirmation. QuickBite acts as an intermediary and is not responsible for the quality of food or service provided by restaurants.</p>
        <h2 className="text-xl font-semibold text-foreground">Account Responsibility</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
        <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:legal@qickbite.com" className="text-brand-500 hover:underline">legal@qickbite.com</a>.</p>
      </div>
    </div>
  );
}
