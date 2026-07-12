import Link from 'next/link';
import { HelpCircle, MessageCircle, Mail, Phone, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const FAQ = [
  { q: 'How do I make a booking?', a: 'Find a restaurant, choose a date and time, select your table and any pre-orders, then confirm. You\'ll receive an instant confirmation.' },
  { q: 'Can I cancel my booking?', a: 'Yes, you can cancel up to 30 minutes before your reservation. Go to My Bookings, find the booking, and tap Cancel.' },
  { q: 'What happens if a restaurant cancels?', a: 'You\'ll be notified immediately and receive a full refund to your original payment method within 3–5 business days.' },
  { q: 'How do pre-orders work?', a: 'When booking, add items from the menu. Your order will be prepared so it\'s ready when you arrive — no waiting required.' },
  { q: 'How do I get a refund?', a: 'Refunds are automatically processed for cancelled bookings. Contact support if you haven\'t received yours within 5 business days.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. We use Razorpay and Stripe — both PCI-DSS compliant payment processors. We never store your card details.' },
  { q: 'How do I list my restaurant?', a: 'Register as a Restaurant Owner, fill in your restaurant details, and submit for approval. Our team reviews within 24 hours.' },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center">
        <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Help Centre</h1>
        <p className="text-muted-foreground">Find answers to common questions or get in touch with our team.</p>
      </div>

      {/* Contact options */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: MessageCircle, label: 'Live Chat', desc: 'Available 9am–9pm IST', action: 'Start Chat', href: '#' },
          { icon: Mail, label: 'Email Support', desc: 'support@quickbite.app', action: 'Send Email', href: 'mailto:support@quickbite.app' },
          { icon: Phone, label: 'Phone', desc: '+91 1800-123-4567', action: 'Call Us', href: 'tel:+911800123456' },
        ].map(({ icon: Icon, label, desc, action, href }) => (
          <div key={label} className="p-5 rounded-2xl border bg-card text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <p className="font-semibold mb-1">{label}</p>
            <p className="text-sm text-muted-foreground mb-3">{desc}</p>
            <a href={href}>
              <Button size="sm" variant="outline" className="w-full">{action}</Button>
            </a>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border bg-card overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium list-none hover:bg-muted/50 transition-colors">
                {q}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t pt-4">{a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Still need help */}
      <div className="text-center p-8 rounded-2xl bg-muted/50 border">
        <p className="font-semibold mb-2">Still need help?</p>
        <p className="text-sm text-muted-foreground mb-4">Our support team typically responds within 2 hours.</p>
        <a href="mailto:support@quickbite.app">
          <Button className="gap-2"><Mail className="h-4 w-4" /> Contact Support</Button>
        </a>
      </div>
    </div>
  );
}
