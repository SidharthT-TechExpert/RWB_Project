'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Star, AlertCircle, CheckCircle2, 
  ChevronRight, Apple, Play, ArrowRight, Utensils, Navigation, 
  Map as MapIcon, XCircle, Ban, Hourglass, ShieldCheck, ArrowUp
} from 'lucide-react';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Dine-in');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    { id: 'Delivery', icon: Utensils },
    { id: 'Pickup', icon: Search },
    { id: 'Dine-in', icon: MapPin },
  ];

  return (
    <div className="flex flex-col w-full bg-background font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-16 pt-12 pb-24 lg:pt-16 lg:pb-32 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Ambient Glow */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-brand-500/20 dark:bg-brand-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        {/* Left Side Content */}
        <motion.div 
          className="flex-1 flex flex-col items-start gap-6 z-10 w-full max-w-2xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center px-4 py-2 gap-2 bg-brand-500/10 dark:bg-brand-500/20 rounded-full border border-brand-500/20 shadow-[0_0_15px_rgba(255,107,53,0.15)] relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-white/20 -translate-x-full"
              animate={{ translateX: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
            />
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span className="text-brand-600 dark:text-brand-400 text-xs font-bold tracking-widest uppercase">Premium Dining Experience</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight tracking-tight text-balance">
            Skip the Wait.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400 drop-shadow-sm">Eat Faster.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed text-balance">
            The premium dining experience for people who value their time. No queues. No waiting. Just good food.
          </motion.p>

          {/* Search Box Container */}
          <motion.div variants={fadeUp} className="w-full max-w-xl bg-card rounded-3xl p-3 shadow-2xl shadow-brand-500/10 dark:shadow-none border border-border mt-4 relative z-20">
            {/* Interactive Tabs */}
            <div className="flex items-center gap-2 mb-3 px-2 relative">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center px-4 py-2 text-sm font-semibold transition-colors z-10 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">{tab.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 flex items-center bg-muted/50 rounded-2xl px-4 py-4 sm:py-3 border border-transparent focus-within:border-brand-500/50 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all shadow-inner">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input 
                  type="text" 
                  placeholder="Search restaurants..." 
                  className="bg-transparent w-full outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/70"
                />
              </div>
              <button className="flex items-center justify-center px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all hover:shadow-[0_0_20px_rgba(255,107,53,0.4)] active:scale-95">
                Search
              </button>
            </div>
            
            {/* Popular Options Tag */}
            <div className="mt-3 px-3 flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-brand-500" />
              <span className="text-xs font-semibold text-muted-foreground">Popular: Sushi, Pizza, Burgers</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side Visual */}
        <motion.div 
          className="flex-1 relative w-full h-[400px] lg:h-[600px] rounded-[2.5rem] bg-card shadow-2xl border-2 border-border p-3 lg:p-4 overflow-visible group"
          initial={{ opacity: 0, x: 50, rotate: -2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        >
          {/* Main Image with Parallax-like scale */}
          <div className="w-full h-full rounded-[2rem] overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80" 
              alt="Premium Restaurant Interior" 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </div>
          <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] pointer-events-none"></div>

          {/* Floating Card 1: Table Ready */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-12 -left-8 lg:-left-12 bg-background/80 dark:bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-border flex items-center gap-4 hover:scale-110 hover:-translate-y-2 transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
              <p className="text-sm font-extrabold text-foreground">Table Ready</p>
            </div>
          </motion.div>

          {/* Floating Card 2: Rating */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 right-4 lg:-right-12 -translate-y-1/2 bg-background/80 dark:bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-border flex items-center gap-4 hover:scale-110 hover:-translate-y-2 transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 bg-brand-500/20 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-brand-500 fill-brand-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rating</p>
              <p className="text-sm font-extrabold text-foreground">4.9 / 5.0</p>
            </div>
          </motion.div>

          {/* Floating Card 3: Saved Time */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-12 -left-4 lg:-left-8 bg-background/80 dark:bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-border flex items-center gap-4 hover:scale-110 hover:-translate-y-2 transition-transform cursor-pointer"
          >
            <p className="text-base font-bold text-yellow-500 drop-shadow-md">-30 mins</p>
            <p className="text-xs font-bold text-muted-foreground">Wait Time Saved</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Stats Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
        className="w-full bg-card border-y border-border transition-colors duration-300 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
            <div className="flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform">
              <h3 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tighter">50K+</h3>
              <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase text-center">Active Users</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform">
              <h3 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tighter">1,200+</h3>
              <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase text-center">Partner Restaurants</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform">
              <h3 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tighter">250K+</h3>
              <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase text-center">Orders Delivered</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform">
              <h3 className="text-4xl md:text-5xl font-extrabold text-brand-500 tracking-tighter flex items-center">
                4.9<Star className="ml-1 w-6 h-6 sm:w-8 sm:h-8 fill-brand-500" />
              </h3>
              <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase text-center">App Rating</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Comparison Section */}
      <section className="relative w-full bg-zinc-950 dark:bg-card border-y border-border py-24 lg:py-32 transition-colors duration-300 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[length:24px_24px] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 flex flex-col items-center gap-16 relative z-10">
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white dark:text-foreground text-balance">Why QuickBite?</h2>
            <p className="text-lg text-zinc-400 dark:text-muted-foreground">Compare the dining experience and see the difference.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            {/* Traditional Card */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="bg-zinc-900/80 backdrop-blur dark:bg-background border border-zinc-800 dark:border-border rounded-[2rem] p-8 md:p-12 flex flex-col gap-10 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <Ban className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-3xl font-bold text-white dark:text-foreground tracking-tight">Traditional Way</h3>
              </div>
              <ul className="space-y-6">
                {[
                  "Wait 30+ minutes for a table during peak hours",
                  "Uncertainty around seating availability",
                  "Wait again for the menu and to place an order",
                  "Wasted time that you could have enjoyed"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <XCircle className="w-6 h-6 text-red-500/80 shrink-0 mt-0.5" />
                    <span className="text-base text-zinc-400 dark:text-muted-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* QuickBite Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              className="relative bg-gradient-to-br from-brand-500 to-orange-500 rounded-[2rem] p-8 md:p-12 flex flex-col gap-10 shadow-[0_20px_50px_-12px_rgba(255,107,53,0.5)] dark:shadow-none overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
            >
              {/* Card Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
              
              {/* Pro Badge */}
              <div className="absolute top-8 right-8 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest text-white shadow-sm border border-white/20">
                Pro Vibe
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Star className="w-6 h-6 text-white fill-white" />
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">QuickBite Experience</h3>
              </div>
              <ul className="space-y-6 relative z-10">
                {[
                  "Walk directly to your reserved table. No wait.",
                  "Pre-order your meal before you even arrive.",
                  "Food is served hot exactly when you sit down.",
                  "Gain back your time and enjoy the moment."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-white shrink-0 mt-0.5 drop-shadow" />
                    <span className="text-base text-white/95 font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative w-full bg-background py-24 lg:py-32 transition-colors duration-300">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 flex flex-col items-center gap-16">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight text-balance">Four Steps to Perfection</h2>
            <p className="text-lg text-muted-foreground">An uncompromised, frictionless dining experience.</p>
          </motion.div>

          <div className="relative w-full max-w-5xl mt-8">
            {/* Connecting Dotted Line */}
            <motion.div 
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute top-12 left-[10%] right-[10%] h-[2px] bg-[radial-gradient(circle_at_center,_#ff4d0f_20%,_transparent_20%)] bg-[length:12px_2px] opacity-30 z-0 hidden md:block origin-left"
            ></motion.div>
            
            <motion.div 
              variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10"
            >
              {[
                { icon: Search, title: "Discover", desc: "Find top-rated nearby restaurants." },
                { icon: Utensils, title: "Select & Pre-order", desc: "Choose your favorites ahead of time." },
                { icon: AlertCircle, title: "Get Notified", desc: "Real-time updates on your table status." },
                { icon: Navigation, title: "Walk In & Eat", desc: "Bypass the line and enjoy." }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div key={idx} variants={scaleIn} className="flex flex-col items-center text-center gap-6 group">
                    <div className="w-24 h-24 bg-card rounded-[2rem] shadow-xl dark:shadow-md border border-border flex items-center justify-center relative transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:border-brand-500/30">
                      <Icon className="w-8 h-8 text-brand-500 transition-transform group-hover:scale-110 duration-300" />
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-500 text-white font-black text-sm rounded-full flex items-center justify-center border-4 border-background shadow-sm">
                        {idx + 1}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-brand-500 transition-colors">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Maps & Discovery Section */}
      <section id="find-table" className="w-full bg-muted/30 py-24 lg:py-32 border-y border-border transition-colors duration-300 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 flex flex-col lg:flex-row items-center gap-16">
          {/* Mock Map Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50, rotate: 2 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, type: "spring" }}
            className="flex-1 w-full relative h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-muted dark:bg-muted/50 group"
          >
             <Image 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" 
                alt="Map View" 
                fill
                className="object-cover opacity-60 dark:opacity-40 mix-blend-multiply dark:mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/30 via-transparent to-transparent opacity-80 mix-blend-color-burn dark:mix-blend-lighten"></div>
              
              {/* Mock Pins */}
              <div className="absolute top-[40%] left-[30%] w-14 h-14 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.5)] animate-bounce relative z-10 cursor-pointer hover:scale-110 transition-transform">
                <Utensils className="w-6 h-6" />
                {/* Pulse Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-brand-500 animate-ping opacity-50"></div>
              </div>
              <div className="absolute top-[20%] right-[25%] w-10 h-10 bg-card text-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <MapIcon className="w-5 h-5" />
              </div>
              <div className="absolute bottom-[30%] left-[60%] w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <MapPin className="w-5 h-5" />
              </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex-1 w-full flex flex-col gap-8"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 text-balance">Live Nearby<br/>Restaurants</h2>
              <p className="text-lg text-muted-foreground">Find real-time seating availability tailored to your current location.</p>
            </motion.div>

            <motion.div variants={staggerContainer} className="flex flex-col gap-4">
              {/* List Item 1 */}
              <motion.div variants={fadeUp} className="bg-card p-4 rounded-2xl flex items-center justify-between border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 hover:border-brand-500/30 group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted relative overflow-hidden shadow-inner">
                    <Image src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&q=80" alt="Burger" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground flex items-center gap-2 group-hover:text-brand-500 transition-colors">
                      The Pembroke Grill 
                      <span className="text-[10px] bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Open</span>
                    </h4>
                    <p className="text-sm text-muted-foreground">0.4 mi • 5 min away</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <p className="text-xs font-bold text-green-600 dark:text-green-400">No Wait</p>
                   <div className="w-8 h-8 rounded-full bg-muted group-hover:bg-brand-500/10 flex items-center justify-center transition-colors">
                     <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
                   </div>
                </div>
              </motion.div>

               {/* List Item 2 */}
               <motion.div variants={fadeUp} className="bg-card p-4 rounded-2xl flex items-center justify-between border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 hover:border-brand-500/30 group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted relative overflow-hidden shadow-inner">
                    <Image src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80" alt="Healthy Bowl" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground flex items-center gap-2 group-hover:text-brand-500 transition-colors">Green Leaf Kitchen</h4>
                    <p className="text-sm text-muted-foreground">1.2 mi • 12 min away</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <p className="text-xs font-bold text-yellow-600 dark:text-yellow-500">~10 min</p>
                   <div className="w-8 h-8 rounded-full bg-muted group-hover:bg-brand-500/10 flex items-center justify-center transition-colors">
                     <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
                   </div>
                </div>
              </motion.div>
              
              <motion.button variants={fadeUp} className="w-full mt-4 py-4 bg-foreground hover:bg-foreground/90 text-background font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                Explore Full Map
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Chef's Recommendations */}
      <section id="explore" className="w-full bg-background py-24 lg:py-32 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 flex flex-col gap-12">
          
          <div className="flex justify-between items-end">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight"
            >
              Chef's Recommendations
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="flex gap-2"
            >
              <button className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-foreground/20 transition-all active:scale-95">
                 <ChevronRight className="w-5 h-5 text-foreground rotate-180" />
              </button>
              <button className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-foreground/20 transition-all active:scale-95">
                 <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </motion.div>
          </div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Item 1 */}
            <motion.div variants={fadeUp} className="group cursor-pointer flex flex-col">
              <div className="relative w-full h-72 rounded-[2rem] overflow-hidden bg-muted mb-6 shadow-md group-hover:shadow-xl transition-shadow duration-500">
                 <Image src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80" alt="Salad Bowl" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="absolute top-4 right-4 bg-card/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-border transition-transform group-hover:scale-110">
                   <Star className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                   <span className="text-xs font-bold text-foreground">4.9</span>
                 </div>
              </div>
              <div className="flex justify-between items-start gap-4 px-2">
                 <div>
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-brand-500 transition-colors">Mediterranean Salad Bowl</h3>
                    <p className="text-sm font-medium text-muted-foreground">The Salad Co. • 0.5 mi away</p>
                 </div>
                 <p className="text-xl font-extrabold text-brand-500">$18.90</p>
              </div>
            </motion.div>

            {/* Item 2 */}
            <motion.div variants={fadeUp} className="group cursor-pointer flex flex-col">
              <div className="relative w-full h-72 rounded-[2rem] overflow-hidden bg-muted mb-6 shadow-md group-hover:shadow-xl transition-shadow duration-500">
                 <Image src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80" alt="Pizza" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="absolute top-4 right-4 bg-card/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-border transition-transform group-hover:scale-110">
                   <Star className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                   <span className="text-xs font-bold text-foreground">4.8</span>
                 </div>
              </div>
              <div className="flex justify-between items-start gap-4 px-2">
                 <div>
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-brand-500 transition-colors">Truffle Mushroom Pizza</h3>
                    <p className="text-sm font-medium text-muted-foreground">Luigi's Italian • 1.2 mi away</p>
                 </div>
                 <p className="text-xl font-extrabold text-brand-500">$24.50</p>
              </div>
            </motion.div>

            {/* Item 3 */}
            <motion.div variants={fadeUp} className="group cursor-pointer flex flex-col">
              <div className="relative w-full h-72 rounded-[2rem] overflow-hidden bg-muted mb-6 shadow-md group-hover:shadow-xl transition-shadow duration-500">
                 <Image src="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80" alt="Wagyu Beef" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="absolute top-4 right-4 bg-card/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-border transition-transform group-hover:scale-110">
                   <Star className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                   <span className="text-xs font-bold text-foreground">5.0</span>
                 </div>
              </div>
              <div className="flex justify-between items-start gap-4 px-2">
                 <div>
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-brand-500 transition-colors">Charcoal Grilled Wagyu</h3>
                    <p className="text-sm font-medium text-muted-foreground">SteakHouse • 3.0 mi away</p>
                 </div>
                 <p className="text-xl font-extrabold text-brand-500">$72.00</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mobile App Promo */}
      <section className="w-full bg-zinc-950 dark:bg-card py-24 lg:py-32 relative overflow-hidden transition-colors duration-300">
        {/* Abstract Background Shapes */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
           {/* Mock Phone Display */}
           <motion.div 
             initial={{ opacity: 0, y: 100, rotate: 10 }} whileInView={{ opacity: 1, y: 0, rotate: -5 }} viewport={{ once: true }} transition={{ duration: 1, type: "spring", bounce: 0.4 }}
             className="flex-1 w-full max-w-sm relative aspect-[9/19] bg-gradient-to-tr from-brand-600 to-orange-400 rounded-[3.5rem] p-4 shadow-2xl hover:rotate-0 hover:-translate-y-4 transition-all duration-500 cursor-pointer group"
           >
             <div className="w-full h-full bg-black rounded-[3rem] overflow-hidden border-[6px] border-black relative shadow-inner">
                {/* Simulated App Screen */}
                <div className="w-full h-full bg-background flex flex-col pt-12 pb-6 px-6">
                   <div className="w-1/3 h-1.5 bg-foreground/10 absolute top-4 left-1/3 rounded-full"></div>
                   <div className="mb-8">
                     <h4 className="text-2xl font-extrabold text-foreground tracking-tight">VIP Platinum</h4>
                     <p className="text-xs text-brand-500 font-bold tracking-widest mt-1">MEMBER SINCE 2024</p>
                   </div>
                   <div className="space-y-4 flex-1">
                     <div className="w-full h-28 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-[1.03] transition-transform">
                       <MapPin className="w-8 h-8 text-white drop-shadow-md" />
                     </div>
                     <div className="w-full h-14 bg-muted/70 rounded-xl"></div>
                     <div className="w-full h-14 bg-muted/70 rounded-xl"></div>
                     <div className="w-full h-14 bg-muted/70 rounded-xl"></div>
                   </div>
                   {/* Mock bottom nav */}
                   <div className="w-full h-16 bg-muted/50 rounded-2xl mt-auto"></div>
                </div>
             </div>
             {/* Floating App Badge */}
             <motion.div 
               animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-1/4 -right-8 lg:-right-12 bg-card rounded-2xl shadow-2xl p-4 flex items-center gap-4 border border-border"
             >
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                   <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Status</p>
                  <p className="text-sm font-extrabold text-foreground whitespace-nowrap">Priority Waitlist</p>
                </div>
             </motion.div>
           </motion.div>

           <motion.div 
             variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
             className="flex-1 w-full text-left space-y-8"
           >
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white dark:text-foreground tracking-tight leading-tight text-balance">
                Elevate Every<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-400">Dining Moment.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-xl text-zinc-300 dark:text-muted-foreground max-w-lg leading-relaxed text-balance">
                Download the QuickBite app to unlock priority seating, exclusive partner menus, and pay the check silently from your phone.
              </motion.p>
              
              <motion.ul variants={staggerContainer} className="space-y-6 max-w-md pt-4">
                {[
                  { icon: Hourglass, title: "Priority Reservations", desc: "Never wait for a table again." },
                  { icon: Apple, title: "Touchless Payments", desc: "Secure, instant payments via Apple Pay." }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.li key={idx} variants={fadeUp} className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center shrink-0 border border-brand-500/10">
                        <Icon className="w-6 h-6 text-brand-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white dark:text-foreground mb-1">{item.title}</h4>
                        <p className="text-base text-zinc-400 dark:text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                 <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white dark:bg-foreground hover:bg-gray-100 dark:hover:bg-foreground/90 text-zinc-950 dark:text-background px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg">
                    <Apple className="w-7 h-7" />
                    <div className="text-left leading-tight">
                       <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Download on the</p>
                       <p className="text-lg font-extrabold">App Store</p>
                    </div>
                 </button>
                 <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 dark:bg-muted dark:hover:bg-muted/80 hover:bg-white/10 text-white dark:text-foreground border border-white/20 dark:border-transparent px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 backdrop-blur-sm">
                    <Play className="w-7 h-7 text-brand-400" />
                    <div className="text-left leading-tight">
                       <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Get it on</p>
                       <p className="text-lg font-extrabold">Google Play</p>
                    </div>
                 </button>
              </motion.div>
           </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="partners" className="w-full bg-background py-24 lg:py-32 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 50 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}
             className="bg-gradient-to-br from-brand-500 to-orange-600 rounded-[3rem] sm:rounded-[4rem] p-12 md:p-24 flex flex-col items-center justify-center gap-10 shadow-[0_30px_60px_-15px_rgba(255,107,53,0.4)] dark:shadow-none relative overflow-hidden group"
           >
             {/* Decorative Elements */}
             <div className="absolute -top-32 -left-32 w-80 h-80 border-[40px] border-white/10 rounded-full group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
             <div className="absolute -bottom-32 -right-32 w-96 h-96 border-[50px] border-white/10 rounded-full group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[80px] pointer-events-none"></div>
             
             <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight relative z-10 max-w-3xl text-balance drop-shadow-md">
                Ready to Skip the Wait?
             </h2>
             <p className="text-xl md:text-2xl text-white/90 relative z-10 max-w-2xl font-medium">
                Join 50,000+ diners experiencing the future of restaurants today.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full justify-center relative z-10 mt-6">
                <button className="px-10 py-5 bg-zinc-950 dark:bg-background hover:bg-black dark:hover:bg-background/90 text-white dark:text-foreground font-extrabold text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl border border-transparent dark:border-border">
                  Start Booking Now
                </button>
                <button className="px-10 py-5 bg-white hover:bg-gray-50 text-brand-500 font-extrabold text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2 group/btn">
                  Partner with Us <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
           </motion.div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-2xl shadow-brand-500/30 border border-brand-400/50 transition-all hover:-translate-y-1 active:scale-95"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
