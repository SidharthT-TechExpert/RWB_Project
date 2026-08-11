'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  Search, MapPin, Clock, Star, Users, Store, ShoppingBag, 
  ChevronRight, ArrowRight, CheckCircle2, XCircle, 
  Smartphone, CreditCard, Gift, Utensils, Zap, Map, 
  ArrowUp, Apple, Play
} from 'lucide-react';

// --- Data ---
const stats = [
  { id: 1, value: 50000, suffix: '+', label: 'Active Users', icon: Users },
  { id: 2, value: 1200, suffix: '+', label: 'Partner Restaurants', icon: Store },
  { id: 3, value: 250000, suffix: '+', label: 'Orders Delivered', icon: ShoppingBag },
  { id: 4, value: 4.9, suffix: '★', label: 'App Rating', icon: Star, decimals: 1 },
];

const cuisines = [
  { id: 1, name: 'Sushi', emoji: '🍣' },
  { id: 2, name: 'Pizza', emoji: '🍕' },
  { id: 3, name: 'Burgers', emoji: '🍔' },
  { id: 4, name: 'Italian', emoji: '🍝' },
  { id: 5, name: 'Thai', emoji: '🍜' },
  { id: 6, name: 'Indian', emoji: '🍛' },
];

const steps = [
  { id: 1, title: 'Discover', desc: 'Find top-rated restaurants near you with real-time wait times.', icon: Search },
  { id: 2, title: 'Select & Pre-order', desc: 'Choose your table and pre-order your favorite dishes in advance.', icon: Utensils },
  { id: 3, title: 'Get Notified', desc: 'Receive instant updates on your table status and food preparation.', icon: Zap },
  { id: 4, title: 'Walk In & Eat', desc: 'Skip the line, sit down, and enjoy your meal immediately.', icon: Clock },
];

const foods = [
  { id: 1, name: 'Mediterranean Salad Bowl', price: 18.90, rating: 4.9, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' },
  { id: 2, name: 'Truffle Mushroom Pizza', price: 24.50, rating: 4.8, img: 'https://images.unsplash.com/photo-1513104890d38-7c0f4fff2b02?w=800&q=80' },
  { id: 3, name: 'Charcoal Grilled Wagyu', price: 72.00, rating: 5.0, img: 'https://images.unsplash.com/photo-1544025162-8369fd998aa8?w=800&q=80' },
];

const reviewsRow1 = [
  { id: 1, name: 'Sarah J.', text: 'Literally saved me 40 minutes of waiting on a Friday night. The food was hot when we sat down!', restaurant: 'The Rusty Spoon' },
  { id: 2, name: 'Mike T.', text: 'Best app for busy professionals. I walk in and my lunch is already waiting for me.', restaurant: 'Bistro 44' },
  { id: 3, name: 'Emily R.', text: 'I love how easy it is to split the bill and pay securely from my phone.', restaurant: 'Sushi Samba' },
  { id: 4, name: 'David L.', text: 'A game changer for date nights. No more awkward waiting at the bar.', restaurant: 'Lumina' },
  { id: 5, name: 'Jessica W.', text: 'The interface is beautiful and so easy to use. Highly recommend!', restaurant: 'Thai Orchid' },
  { id: 6, name: 'Chris P.', text: 'QuickBite has revolutionized my dining experience entirely.', restaurant: 'Burger Joint' },
];

const reviewsRow2 = [
  { id: 7, name: 'Amanda B.', text: 'I never dine out without QuickBite anymore. It\'s just too convenient.', restaurant: 'Pasta Bella' },
  { id: 8, name: 'Tom H.', text: 'Incredible app! The pre-ordering feature ensures my food is ready when I am.', restaurant: 'Grill House' },
  { id: 9, name: 'Nina S.', text: 'Five stars! The best way to secure a table at popular spots.', restaurant: 'Vegan Eats' },
  { id: 10, name: 'Mark D.', text: 'Sleek design, flawless execution. It really is VIP treatment.', restaurant: 'Ocean View' },
  { id: 11, name: 'Rachel K.', text: 'Love the touchless payments. Makes the end of the meal so smooth.', restaurant: 'Café Z' },
  { id: 12, name: 'Kevin G.', text: 'Finally, an app that actually respects my time. Great job!', restaurant: 'The Steakhouse' },
];

const trendingRestaurants = ['Nobu', 'Catch', 'Carbone', 'Balthazar', 'Lartusi', 'Peter Luger', 'Katz\'s Deli', 'Le Bernardin', 'Per Se', 'Eleven Madison Park'];

// --- Subcomponents ---

const AnimatedCounter = ({ value, duration = 2, decimals = 0 }: { value: number, duration?: number, decimals?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(value * ease);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, value, duration]);

  return <span ref={ref}>{count.toFixed(decimals)}</span>;
};

// --- Main Component ---

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'Table' | 'Food' | 'Table+Food'>('Table+Food');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-orange-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
      
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-500/15 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen blob-float -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-brand-400/20 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-screen blob-float-delay -z-10"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 w-full z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium mb-6 border border-brand-200 dark:border-brand-500/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping absolute opacity-75"></span>
            <span className="w-2 h-2 rounded-full bg-brand-500 relative"></span>
            NOW LIVE IN NEW YORK
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-fluid-hero">
            Skip the Wait.<br/>
            <span className="text-brand-500">Eat Faster.</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl text-fluid-lg">
            Book your table, pre-order your favorite meal, and walk into a VIP dining experience with zero wait time.
          </p>

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl shadow-brand-500/5 border border-zinc-200 dark:border-zinc-800">
            <div className="flex gap-2 mb-3 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl">
              {['Table', 'Food', 'Table+Food'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Restaurant or cuisine..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all dark:text-zinc-100"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Location"
                  defaultValue="New York, NY"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all dark:text-zinc-100"
                />
              </div>
              <button className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-brand-500/25 whitespace-nowrap">
                Book Now
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-sm text-zinc-500 font-medium">Popular:</span>
            {['Sushi', 'Pizza', 'Burgers', 'Italian', 'Thai'].map(tag => (
              <button key={tag} className="px-3 py-1 text-sm rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative w-full aspect-square lg:aspect-auto lg:h-[600px] z-10"
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80" 
              alt="Luxury dining experience" 
              fill 
              className="object-cover"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-10 -left-6 sm:-left-12 bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl shadow-black/10 border border-zinc-100 dark:border-zinc-700 flex items-center gap-3 backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Table Ready</p>
              <p className="text-xs text-zinc-500">Walk right in</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute bottom-20 -right-4 sm:-right-8 bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl shadow-black/10 border border-zinc-100 dark:border-zinc-700 flex flex-col gap-1 backdrop-blur-md"
          >
            <div className="flex items-center gap-1 text-brand-500">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">4.9/5.0 Rating</p>
            <p className="text-xs text-zinc-500">2k+ reviews</p>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white px-5 py-3 rounded-2xl shadow-xl shadow-brand-500/30 font-semibold flex items-center gap-2"
          >
            <Clock className="w-5 h-5" />
            -30 mins wait saved
          </motion.div>
          
          <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-white text-sm font-medium border border-white/20">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            34 tables available near you
          </div>
        </motion.div>
      </section>

      {/* Marquee Section */}
      <div className="w-full bg-white dark:bg-zinc-900 py-6 border-y border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center">
        <div className="flex whitespace-nowrap animate-[marquee-track_30s_linear_infinite] gap-12 px-6">
          {[...trendingRestaurants, ...trendingRestaurants].map((name, i) => (
            <span key={i} className="text-xl font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest flex items-center gap-4">
              {name}
              <Star className="w-4 h-4 text-brand-500/50" />
            </span>
          ))}
        </div>
      </div>

      {/* Trust Stats */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div 
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800"
            >
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6 text-brand-500" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 mb-1">
                <AnimatedCounter value={stat.value} decimals={stat.decimals} />{stat.suffix}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Cuisine Categories */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Explore by Cuisine</h2>
              <p className="text-zinc-500 dark:text-zinc-400">Find exactly what you're craving right now.</p>
            </div>
            <button className="hidden sm:flex items-center gap-2 text-brand-600 font-semibold hover:gap-3 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 sm:gap-8 no-scrollbar snap-x">
            {cuisines.map((cuisine) => (
              <motion.a
                key={cuisine.id}
                href={`/search?cuisine=${cuisine.name.toLowerCase()}`}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center gap-4 flex-shrink-0 snap-center group cursor-pointer"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-brand-100 to-orange-200 dark:from-brand-900/40 dark:to-orange-800/40 flex items-center justify-center text-4xl sm:text-5xl shadow-sm group-hover:shadow-xl group-hover:shadow-brand-500/20 transition-all">
                  {cuisine.emoji}
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {cuisine.name}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Why QuickBite? */}
      <section className="py-24 bg-zinc-950 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/20 via-zinc-950 to-zinc-950 pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Redefining Dining Out</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Don't let waiting ruin your appetite. See how we compare to the old way of eating out.</p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-8 relative">
            {/* Traditional Card */}
            <div className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-zinc-400 mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                The Traditional Way
              </h3>
              <ul className="space-y-6">
                {[
                  'Wait 45+ minutes for a table',
                  'Struggle to get a waiter\'s attention',
                  'Wait 20+ minutes for food to arrive',
                  'Rush through your meal',
                  'Wait for the bill to pay'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-300">
                    <XCircle className="w-5 h-5 text-red-500/50 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VS Divider */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-zinc-950 border-4 border-zinc-800 items-center justify-center z-20">
              <span className="font-black text-xl italic text-zinc-500">VS</span>
              <div className="absolute inset-0 rounded-full border-2 border-brand-500 animate-ping opacity-20"></div>
            </div>

            {/* QuickBite Card */}
            <div className="flex-1 bg-gradient-to-br from-brand-600/20 to-orange-600/10 border border-brand-500/30 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 blur-3xl rounded-full"></div>
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <CheckCircle2 className="w-6 h-6 text-brand-500" />
                QuickBite Experience
              </h3>
              <ul className="space-y-6 relative z-10">
                {[
                  'Walk straight to your reserved table',
                  'Order & customize pre-prep in app',
                  'Food arrives within 2 minutes of sitting',
                  'Enjoy at your own pace',
                  'One-tap payment & earn VIP rewards'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-100 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How QuickBite Works</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Four simple steps to a perfect dining experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* SVG Connecting Line */}
            <div className="hidden lg:block absolute top-1/4 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-brand-200 dark:border-brand-900/50 z-0"></div>

            {steps.map((step, idx) => (
              <motion.div 
                key={step.id}
                whileHover={{ rotateY: 10, rotateX: -10, y: -5 }}
                className="relative z-10 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-lg shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 transition-all duration-300 hover:shadow-brand-500/20 hover:border-brand-500/50"
                style={{ perspective: 1000 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-6 text-brand-600 dark:text-brand-400 relative">
                  <step.icon className="w-7 h-7" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center border-4 border-white dark:border-zinc-900 text-sm">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">{step.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Nearby Map Section */}
      <section className="py-24 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 w-full relative">
              <div className="relative w-full aspect-square sm:aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800">
                <Image 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" 
                  alt="Map view" 
                  fill 
                  className="object-cover opacity-90 dark:opacity-70 dark:grayscale-[30%]"
                  unoptimized
                />
                
                {/* Animated Map Pins */}
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}
                  className="absolute top-[30%] left-[40%] flex flex-col items-center cursor-pointer group"
                >
                  <div className="bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-1 shadow-lg transform group-hover:scale-110 transition-transform">
                    2 tables
                  </div>
                  <div className="w-4 h-4 bg-brand-500 rounded-full border-2 border-white shadow-md relative">
                    <div className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-75"></div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }}
                  className="absolute top-[60%] left-[70%] flex flex-col items-center cursor-pointer group"
                >
                  <div className="bg-zinc-900 text-white px-3 py-1 rounded-full text-xs font-bold mb-1 shadow-lg transform group-hover:scale-110 transition-transform">
                    Waitlist
                  </div>
                  <div className="w-4 h-4 bg-zinc-900 rounded-full border-2 border-white shadow-md"></div>
                </motion.div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Find Available Tables Instantly</h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
                Our live map shows exactly which restaurants have immediate availability. Stop guessing and start eating.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { name: 'The Rustic Grill', distance: '0.2 mi', status: 'Immediate Seating', rating: '4.8' },
                  { name: 'Sushi Nakazawa', distance: '0.5 mi', status: '2 Tables Left', rating: '4.9' },
                ].map((venue, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-brand-500 dark:hover:border-brand-500 transition-colors bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-zinc-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{venue.name}</h4>
                        <p className="text-sm text-zinc-500">{venue.distance} away • ⭐ {venue.rating}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-full">
                      {venue.status}
                    </span>
                  </div>
                ))}
              </div>

              <button className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-xl font-semibold transition-colors">
                <Map className="w-5 h-5" />
                Explore Full Map
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Chef's Recommendations */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trending Dishes</h2>
              <p className="text-zinc-500 dark:text-zinc-400">Pre-order these local favorites to skip the prep time.</p>
            </div>
          </div>

          <motion.div 
            className="flex lg:grid lg:grid-cols-3 gap-6 sm:gap-8 overflow-visible"
            drag="x"
            dragConstraints={{ left: -1000, right: 0 }}
            dragElastic={0.1}
          >
            {foods.map((food) => (
              <motion.div 
                key={food.id}
                whileHover={{ y: -8 }}
                className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-lg border border-zinc-100 dark:border-zinc-800 group cursor-grab active:cursor-grabbing shrink-0"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <Image 
                    src={food.img} 
                    alt={food.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-zinc-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-4 h-4 text-brand-500 fill-brand-500" />
                    {food.rating}
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{food.name}</h3>
                    <p className="text-brand-300 font-semibold drop-shadow-md">${food.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-4 flex gap-2">
                  <button className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white py-3 rounded-xl font-semibold transition-colors text-sm">
                    View Restaurant
                  </button>
                  <button className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-semibold transition-colors text-sm flex justify-center items-center gap-2">
                    <Zap className="w-4 h-4" /> Pre-order
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section className="py-24 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Diners Say</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Join thousands of foodies who have revolutionized their dining experience.</p>
        </div>

        <div className="flex flex-col gap-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none"></div>
          
          {/* Row 1 */}
          <div className="flex whitespace-nowrap animate-[marquee-track_40s_linear_infinite] gap-6 px-4">
            {[...reviewsRow1, ...reviewsRow1].map((review, i) => (
              <div key={`r1-${i}`} className="w-[350px] whitespace-normal bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-1 mb-4 text-brand-500">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 italic mb-6 line-clamp-3">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image 
                      src={`https://ui-avatars.com/api/?name=${review.name.replace(' ', '+')}&background=FF6B35&color=fff&size=40`}
                      alt={review.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                      unoptimized
                    />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{review.name}</h4>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-md">
                    @ {review.restaurant}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex whitespace-nowrap animate-[marquee-track-reverse_45s_linear_infinite] gap-6 px-4">
            {[...reviewsRow2, ...reviewsRow2].map((review, i) => (
              <div key={`r2-${i}`} className="w-[350px] whitespace-normal bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-1 mb-4 text-brand-500">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 italic mb-6 line-clamp-3">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image 
                      src={`https://ui-avatars.com/api/?name=${review.name.replace(' ', '+')}&background=FF6B35&color=fff&size=40`}
                      alt={review.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                      unoptimized
                    />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{review.name}</h4>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-md">
                    @ {review.restaurant}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Promo */}
      <section className="py-24 bg-[#0A0A0A] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 relative w-full max-w-md mx-auto">
            {/* Phone Mockup */}
            <div className="relative aspect-[9/17.5] bg-zinc-950 rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl p-2 overflow-hidden ring-1 ring-brand-500/50">
              {/* Dynamic Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-full z-20 flex items-center justify-between px-3">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                </div>
              </div>

              {/* Screen Content */}
              <div className="w-full h-full bg-zinc-100 rounded-[2.25rem] overflow-hidden flex flex-col relative">
                <div className="bg-brand-500 pt-16 pb-8 px-6 text-white rounded-b-3xl">
                  <p className="opacity-80 text-sm mb-1">Your Reservation</p>
                  <h3 className="text-2xl font-bold">Carbone</h3>
                  <div className="flex items-center gap-2 mt-4 bg-white/20 p-3 rounded-xl backdrop-blur-md">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Table ready in 12 mins</span>
                  </div>
                </div>

                <div className="p-6 flex-1 bg-zinc-50">
                  <h4 className="font-bold text-zinc-900 mb-4">Pre-ordered Items</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-zinc-100 flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-200 rounded-lg overflow-hidden relative">
                         <Image src={foods[1].img} alt="Food" fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-zinc-900 text-sm">Truffle Pasta</p>
                        <p className="text-brand-500 font-semibold text-sm">$28.00</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-zinc-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center shrink-0">
                         <Smartphone className="w-5 h-5 text-brand-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-zinc-900 text-sm">Touchless Pay</p>
                        <p className="text-zinc-500 text-xs">Card ending in 4242</p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl shadow-sm border border-zinc-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
                         <Gift className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-zinc-900 text-sm">VIP Perk Applied</p>
                        <p className="text-zinc-500 text-xs">Free dessert included</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute top-1/4 -right-8 bg-zinc-800 border border-zinc-700 p-3 rounded-2xl shadow-xl flex items-center gap-3 z-30"
            >
              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Priority Waitlist</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="absolute bottom-1/4 -left-8 bg-zinc-800 border border-zinc-700 p-3 rounded-2xl shadow-xl flex items-center gap-3 z-30"
            >
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">-35 mins/visit</p>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 z-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Elevate Every <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-300">Dining Moment.</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-8 max-w-lg">
              Download the app to access priority reservations, pre-ordering, and touchless payments all in one place.
            </p>
            
            <ul className="space-y-4 mb-10">
              {['Priority Reservations at Top Spots', 'Real-time Table Status Tracking', 'Seamless Split & Touchless Payments'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-6 h-6 text-brand-500" />
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-3 bg-white text-black px-6 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-colors">
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider font-semibold opacity-60">Download on the</div>
                  <div className="text-sm leading-none">App Store</div>
                </div>
              </button>
              <button className="flex items-center justify-center gap-3 bg-zinc-800 text-white px-6 py-4 rounded-2xl font-bold hover:bg-zinc-700 transition-colors border border-zinc-700">
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider font-semibold opacity-60">GET IT ON</div>
                  <div className="text-sm leading-none">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Gradient Card */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[3rem] bg-gradient-to-br from-brand-500 via-orange-500 to-red-500 p-12 lg:p-20 text-center overflow-hidden shadow-2xl shadow-brand-500/20">
          {/* Sparkles */}
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-60"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="flex justify-center gap-4 mb-8">
              {[Star, Users, CreditCard].map((Icon, i) => (
                <div key={i} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              ))}
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
              Ready to Skip the Wait?
            </h2>
            <p className="text-xl text-white/90 mb-10 font-medium">
              Join over 50,000 users who are dining smarter, faster, and better.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition-colors shadow-xl">
                Start Booking Now
              </button>
              <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-colors">
                Partner with Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 group flex items-center justify-center"
            title="Back to Top"
          >
            {/* SVG Ring for scroll progress */}
            <svg className="w-14 h-14 transform -rotate-90 drop-shadow-lg">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-white dark:text-zinc-800"
              />
              <motion.circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-brand-500"
                strokeDasharray="150"
                style={{ strokeDashoffset: scaleX as any }}
              />
            </svg>
            <div className="absolute inset-0 m-auto w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
              <ArrowUp className="w-5 h-5" />
            </div>
            
            <span className="absolute -top-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Back to Top
            </span>
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
