'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Star, AlertCircle, CheckCircle2, 
  ChevronRight, Apple, Play, ArrowRight, Utensils, Navigation, 
  Map as MapIcon, XCircle, Ban, Hourglass, ShieldCheck, ArrowUp,
  Armchair, Layers, Locate
} from 'lucide-react';

// Highly-tuned Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.12 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Table + Food');
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
    { id: 'Table', icon: Armchair },
    { id: 'Food', icon: Utensils },
    { id: 'Table + Food', icon: Layers },
  ];

  return (
    <div className="flex flex-col w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-b from-[#FAF8F5] to-[#F5F2EC] dark:from-[#0B0A09] dark:to-[#0F0E0D] font-sans transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl 2xl:max-w-[85rem] 3xl:max-w-[110rem] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 pt-4 pb-12 lg:pt-8 lg:pb-16 2xl:pt-12 2xl:pb-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
        
        {/* Advanced Ambient Glows */}
        <div className="absolute top-1/4 -left-32 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-brand-500/15 to-orange-500/5 dark:from-brand-500/10 dark:to-transparent rounded-full blur-[90px] sm:blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-brand-500/5 dark:bg-brand-500/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        {/* Left Side Content */}
        <motion.div 
          className="flex-1 flex flex-col items-start gap-4 sm:gap-5 z-10 w-full max-w-2xl 2xl:max-w-3xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div 
            variants={fadeUp} 
            className="inline-flex items-center px-3.5 py-1 gap-2 bg-brand-500/10 dark:bg-brand-500/20 rounded-full border border-brand-500/15 dark:border-brand-500/10 shadow-[0_4px_12px_rgba(255,107,53,0.08)]"
          >
            <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_#FF6B35]"></span>
            <span className="text-brand-600 dark:text-brand-400 text-[11px] font-black tracking-wider uppercase">NOW LIVE IN NEW YORK</span>
          </motion.div>

          {/* Headline (Optimized for standard viewport heights) */}
          <motion.h1 
            variants={fadeUp} 
            className="text-3.5xl xs:text-4.5xl sm:text-5.5xl lg:text-6.5xl xl:text-7xl font-black text-foreground leading-[1.08] tracking-tight text-balance"
          >
            Skip the Wait.<br/>
            <span className="text-brand-500 drop-shadow-sm">Eat Faster.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={fadeUp} className="text-sm sm:text-base lg:text-lg text-muted-foreground/90 max-w-lg leading-relaxed text-balance font-medium">
            The premium dining experience for people who value their time. No queues. No waiting. Just great food.
          </motion.p>

          {/* Search Box Container */}
          <motion.div 
            variants={fadeUp} 
            className="w-full max-w-xl bg-card/75 dark:bg-card/45 backdrop-blur-xl rounded-[1.75rem] p-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.05)] dark:shadow-none border border-border mt-1 relative z-20"
          >
            {/* Interactive Tabs with Horizontal scroll on small devices */}
            <div 
              className="flex items-center gap-1 sm:gap-1.5 mb-3 px-1 relative overflow-x-auto whitespace-nowrap pb-0.5"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center px-3.5 py-2 text-xs sm:text-sm font-extrabold transition-colors z-10 rounded-xl ${isActive ? 'text-brand-500' : 'text-muted-foreground/80 hover:text-foreground'}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-brand-500/10 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 mr-1.5 relative z-10" />
                    <span className="relative z-10">{tab.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Row */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="flex-1 flex items-center justify-between bg-muted/60 dark:bg-muted/40 rounded-xl px-3.5 py-2.5 sm:py-2 border border-transparent focus-within:border-brand-500/30 focus-within:ring-4 focus-within:ring-brand-500/5 transition-all shadow-inner">
                <div className="flex items-center flex-1 min-w-0">
                  <Search className="w-4.5 h-4.5 text-muted-foreground mr-2 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search restaurants..." 
                    className="bg-transparent w-full outline-none text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 min-w-0"
                  />
                </div>
                <button className="flex items-center gap-1 text-brand-500 hover:text-brand-600 font-extrabold text-xs px-1.5 py-0.5 transition-colors shrink-0">
                  <Locate className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Near Me</span>
                </button>
              </div>
              <button className="flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-xl transition-all hover:shadow-[0_6px_20px_rgba(255,107,53,0.3)] hover:scale-[1.02] active:scale-95 whitespace-nowrap text-xs sm:text-sm">
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Popular Options Tag */}
            <div className="mt-2.5 px-2 flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-brand-500 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground/70 truncate">Popular: Sushi, Pizza, Burgers</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side Visual (Proportioned Height) */}
        <motion.div 
          className="flex-1 relative w-full h-[280px] xs:h-[340px] sm:h-[420px] lg:h-[480px] xl:h-[520px] rounded-[2.25rem] bg-card/50 dark:bg-card/20 shadow-xl border border-border/80 p-2.5 sm:p-3.5 lg:p-4 overflow-visible group"
          initial={{ opacity: 0, x: 50, rotate: -2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.9, type: "spring", bounce: 0.25 }}
        >
          {/* Main Image Container */}
          <div className="w-full h-full rounded-[2.25rem] overflow-hidden relative shadow-inner">
            <Image 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80" 
              alt="Premium Restaurant Interior" 
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-103"
              priority
            />
          </div>
          <div className="absolute inset-0 rounded-[2.75rem] shadow-[inset_0_0_80px_rgba(0,0,0,0.1)] pointer-events-none"></div>

          {/* Floating Card 1: Table Ready */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 left-4 sm:top-12 sm:-left-8 lg:-left-12 bg-white/80 dark:bg-[#121111]/85 backdrop-blur-xl p-3.5 sm:p-4.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-white/20 dark:border-zinc-800/40 flex items-center gap-3 sm:gap-4 hover:scale-[1.06] transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-green-500" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Status</p>
              <p className="text-xs sm:text-sm font-black text-foreground whitespace-nowrap">Table Ready</p>
            </div>
          </motion.div>

          {/* Floating Card 2: Rating */}
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute top-1/2 -translate-y-1/2 right-4 sm:-right-8 lg:-right-12 bg-white/80 dark:bg-[#121111]/85 backdrop-blur-xl p-3.5 sm:p-4.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-white/20 dark:border-zinc-800/40 flex items-center gap-3 sm:gap-4 hover:scale-[1.06] transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-brand-500 fill-brand-500" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Rating</p>
              <p className="text-xs sm:text-sm font-black text-foreground whitespace-nowrap">4.9 / 5.0</p>
            </div>
          </motion.div>

          {/* Floating Card 3: Saved Time */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
            className="absolute bottom-4 left-4 sm:bottom-12 sm:-left-4 lg:-left-8 bg-white/80 dark:bg-[#121111]/85 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-white/20 dark:border-zinc-800/40 flex items-center gap-3 hover:scale-[1.06] transition-transform cursor-pointer"
          >
            <p className="text-sm sm:text-base font-black text-yellow-500 drop-shadow-sm whitespace-nowrap">-30 mins</p>
            <p className="text-[10px] sm:text-xs font-black text-muted-foreground/75 whitespace-nowrap">Wait Saved</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Stats Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
        className="w-full bg-card/60 dark:bg-card/25 backdrop-blur-md border-y border-border transition-colors duration-300 relative z-10 shadow-[0_4px_30px_rgba(0,0,0,0.01)]"
      >
        <div className="max-w-7xl 2xl:max-w-[90rem] 3xl:max-w-[120rem] mx-auto px-4 sm:px-8 md:px-12 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-x divide-border">
            <div className="flex flex-col items-center justify-center gap-1 hover:scale-[1.03] transition-transform duration-300">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter">50K+</h3>
              <p className="text-[10px] sm:text-xs font-extrabold text-muted-foreground/70 tracking-widest uppercase text-center">Active Users</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 hover:scale-[1.03] transition-transform duration-300">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter">1,200+</h3>
              <p className="text-[10px] sm:text-xs font-extrabold text-muted-foreground/70 tracking-widest uppercase text-center">Partner Restaurants</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 hover:scale-[1.03] transition-transform duration-300">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter">250K+</h3>
              <p className="text-[10px] sm:text-xs font-extrabold text-muted-foreground/70 tracking-widest uppercase text-center">Orders Delivered</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 hover:scale-[1.03] transition-transform duration-300">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-500 tracking-tighter flex items-center">
                4.9<Star className="ml-1 w-5 h-5 sm:w-6 sm:h-6 fill-brand-500 shadow-sm" />
              </h3>
              <p className="text-[10px] sm:text-xs font-extrabold text-muted-foreground/70 tracking-widest uppercase text-center">App Rating</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Comparison Section */}
      <section className="relative w-full bg-zinc-950 dark:bg-card border-y border-border py-24 lg:py-32 2xl:py-36 3xl:py-44 transition-colors duration-300 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[length:24px_24px] opacity-60"></div>
        
        <div className="max-w-7xl 2xl:max-w-[90rem] 3xl:max-w-[120rem] mx-auto px-4 sm:px-8 md:px-12 flex flex-col items-center gap-14 relative z-10">
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white dark:text-foreground text-balance">Why QuickBite?</h2>
            <p className="text-base sm:text-lg text-zinc-400 dark:text-muted-foreground font-medium">Compare the dining experience and see the difference.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl 2xl:max-w-6xl">
            {/* Traditional Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="bg-zinc-900/40 backdrop-blur-lg dark:bg-background/40 border border-zinc-800/80 dark:border-border/60 rounded-[2.5rem] p-7 sm:p-10 flex flex-col gap-10 hover:border-zinc-700 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/5">
                  <Ban className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white dark:text-foreground tracking-tight">Traditional Way</h3>
              </div>
              <ul className="space-y-4 sm:space-y-5">
                {[
                  "Wait 30+ minutes for a table during peak hours",
                  "Uncertainty around seating availability",
                  "Wait again for the menu and to place an order",
                  "Wasted time that you could have enjoyed"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 sm:gap-4">
                    <XCircle className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-red-500/70 shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-zinc-400 dark:text-muted-foreground font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* QuickBite Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
              className="relative bg-gradient-to-br from-brand-500 to-orange-500 rounded-[2.5rem] p-7 sm:p-10 flex flex-col gap-10 shadow-[0_20px_50px_-12px_rgba(255,107,53,0.35)] dark:shadow-none overflow-hidden group hover:scale-[1.01] transition-all duration-300 border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-800 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
              
              <div className="absolute top-6 right-6 sm:top-8 sm:right-8 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/15">
                Pro Vibe
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">QuickBite Experience</h3>
              </div>
              <ul className="space-y-4 sm:space-y-5 relative z-10">
                {[
                  "Walk directly to your reserved table. No wait.",
                  "Pre-order your meal before you even arrive.",
                  "Food is served hot exactly when you sit down.",
                  "Gain back your time and enjoy the moment."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 sm:gap-4">
                    <CheckCircle2 className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-white shrink-0 mt-0.5 drop-shadow-md" />
                    <span className="text-sm sm:text-base text-white/95 font-semibold">{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative w-full bg-background py-24 lg:py-32 2xl:py-36 3xl:py-44 transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-brand-500/5 rounded-full blur-[100px] sm:blur-[120px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl 2xl:max-w-[90rem] 3xl:max-w-[120rem] mx-auto px-4 sm:px-8 md:px-12 flex flex-col items-center gap-14 lg:gap-20">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-balance">Four Steps to Perfection</h2>
            <p className="text-base sm:text-lg text-muted-foreground font-medium">An uncompromised, frictionless dining experience.</p>
          </motion.div>

          <div className="relative w-full max-w-5xl mt-6">
            {/* Connecting Line */}
            <motion.div 
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute top-12 left-[12%] right-[12%] h-[2px] bg-[radial-gradient(circle_at_center,_#ff4d0f_20%,_transparent_20%)] bg-[length:12px_2px] opacity-30 z-0 hidden md:block origin-left"
            ></motion.div>
            
            <motion.div 
              variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6 relative z-10"
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
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-card/80 border border-border/80 rounded-[2.25rem] shadow-md dark:shadow-none flex items-center justify-center relative transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1.5 group-hover:shadow-[0_15px_30px_rgba(255,107,53,0.12)] group-hover:border-brand-500/20">
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-brand-500 transition-transform group-hover:scale-105 duration-300" />
                      <div className="absolute -top-2.5 -right-2.5 w-7 h-7 sm:w-8 sm:h-8 bg-brand-500 text-white font-black text-xs sm:text-sm rounded-full flex items-center justify-center border-4 border-background shadow-md">
                        {idx + 1}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1.5 group-hover:text-brand-500 transition-colors">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground/80 px-2 font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Maps & Discovery Section */}
      <section id="find-table" className="w-full bg-muted/20 py-24 lg:py-32 2xl:py-36 3xl:py-44 border-y border-border transition-colors duration-300 overflow-hidden">
        <div className="max-w-7xl 2xl:max-w-[90rem] 3xl:max-w-[120rem] mx-auto px-4 sm:px-8 md:px-12 flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
          {/* Mock Map Image */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="flex-1 w-full relative h-[300px] xs:h-[350px] sm:h-[450px] lg:h-[500px] 2xl:h-[550px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-muted dark:bg-muted/50 group border border-border"
          >
             <Image 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" 
                alt="Map View" 
                fill
                className="object-cover opacity-55 dark:opacity-35 mix-blend-multiply dark:mix-blend-overlay transition-transform duration-750 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 via-transparent to-transparent opacity-90 mix-blend-color-burn"></div>
              
              {/* Mock Pins */}
              <div className="absolute top-[40%] left-[30%] w-12 h-12 sm:w-14 sm:h-14 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(255,107,53,0.3)] animate-bounce relative z-10 cursor-pointer hover:scale-110 transition-transform">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
                <div className="absolute inset-0 rounded-full border-2 border-brand-500 animate-ping opacity-40"></div>
              </div>
              <div className="absolute top-[20%] right-[25%] w-9 h-9 sm:w-10 sm:h-10 bg-card text-foreground rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer border border-border">
                <MapIcon className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div className="absolute bottom-[30%] left-[60%] w-11 h-11 sm:w-12 sm:h-12 bg-foreground text-background rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer">
                <MapPin className="w-4.5 sm:w-5 h-4.5 sm:h-5" />
              </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex-1 w-full flex flex-col gap-6 sm:gap-8"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-3.5 text-balance">Live Nearby<br/>Restaurants</h2>
              <p className="text-base sm:text-lg text-muted-foreground/95 font-medium leading-relaxed">Find real-time seating availability tailored to your current location.</p>
            </motion.div>

            <motion.div variants={staggerContainer} className="flex flex-col gap-4">
              {/* List Item 1 */}
              <motion.div variants={fadeUp} className="bg-card/75 dark:bg-card/25 backdrop-blur-md p-4.5 rounded-2xl flex items-center justify-between border border-border/80 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 hover:border-brand-500/20 group min-w-0">
                <div className="flex items-center gap-4.5 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted relative overflow-hidden shadow-inner shrink-0 border border-border/40">
                    <Image src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&q=80" alt="Burger" fill className="object-cover group-hover:scale-110 transition-transform duration-655" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-foreground flex items-center gap-2 group-hover:text-brand-500 transition-colors truncate text-sm sm:text-base">
                      The Pembroke Grill 
                      <span className="text-[9px] bg-green-500/15 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black shrink-0">Open</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium truncate mt-0.5">0.4 mi • 5 min away</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                   <p className="text-xs font-black text-green-600 dark:text-green-400">No Wait</p>
                   <div className="w-8.5 h-8.5 rounded-full bg-muted/80 group-hover:bg-brand-500/10 flex items-center justify-center transition-colors">
                     <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
                   </div>
                </div>
              </motion.div>

               {/* List Item 2 */}
               <motion.div variants={fadeUp} className="bg-card/75 dark:bg-card/25 backdrop-blur-md p-4.5 rounded-2xl flex items-center justify-between border border-border/80 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 hover:border-brand-500/20 group min-w-0">
                <div className="flex items-center gap-4.5 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted relative overflow-hidden shadow-inner shrink-0 border border-border/40">
                    <Image src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80" alt="Healthy Bowl" fill className="object-cover group-hover:scale-110 transition-transform duration-655" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-foreground flex items-center gap-2 group-hover:text-brand-500 transition-colors truncate text-sm sm:text-base">Green Leaf Kitchen</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium truncate mt-0.5">1.2 mi • 12 min away</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                   <p className="text-xs font-black text-yellow-600 dark:text-yellow-500">~10 min</p>
                   <div className="w-8.5 h-8.5 rounded-full bg-muted/80 group-hover:bg-brand-500/10 flex items-center justify-center transition-colors">
                     <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
                   </div>
                </div>
              </motion.div>
              
              <motion.button variants={fadeUp} className="w-full mt-2 py-4 bg-foreground hover:bg-foreground/90 text-background font-extrabold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm sm:text-base">
                Explore Full Map
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Chef's Recommendations */}
      <section id="explore" className="w-full bg-background py-24 lg:py-32 2xl:py-36 3xl:py-44 transition-colors duration-300">
        <div className="max-w-7xl 2xl:max-w-[90rem] 3xl:max-w-[120rem] mx-auto px-4 sm:px-8 md:px-12 flex flex-col gap-12">
          
          <div className="flex justify-between items-end">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight"
            >
              Chef's Recommendations
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="flex gap-2"
            >
              <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-foreground/20 transition-all active:scale-95">
                 <ChevronRight className="w-4.5 sm:w-5 h-4.5 sm:h-5 text-foreground rotate-180" />
              </button>
              <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-foreground/20 transition-all active:scale-95">
                 <ChevronRight className="w-4.5 sm:w-5 h-4.5 sm:h-5 text-foreground" />
              </button>
            </motion.div>
          </div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Item 1 */}
            <motion.div variants={fadeUp} className="group cursor-pointer flex flex-col">
              <div className="relative w-full h-64 sm:h-72 lg:h-80 rounded-[2.25rem] overflow-hidden bg-muted mb-5 shadow-md group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-border transition-shadow duration-500">
                 <Image src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80" alt="Salad Bowl" fill className="object-cover group-hover:scale-103 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="absolute top-4.5 right-4.5 bg-card/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-border transition-transform group-hover:scale-105">
                   <Star className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                   <span className="text-xs font-black text-foreground">4.9</span>
                 </div>
              </div>
              <div className="flex justify-between items-start gap-4 px-2.5">
                 <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-foreground mb-1 group-hover:text-brand-500 transition-colors">Mediterranean Salad Bowl</h3>
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground/80">The Salad Co. • 0.5 mi away</p>
                 </div>
                 <p className="text-lg sm:text-xl font-black text-brand-500 shrink-0">$18.90</p>
              </div>
            </motion.div>

            {/* Item 2 */}
            <motion.div variants={fadeUp} className="group cursor-pointer flex flex-col">
              <div className="relative w-full h-64 sm:h-72 lg:h-80 rounded-[2.25rem] overflow-hidden bg-muted mb-5 shadow-md group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-border transition-shadow duration-500">
                 <Image src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80" alt="Pizza" fill className="object-cover group-hover:scale-103 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="absolute top-4.5 right-4.5 bg-card/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-border transition-transform group-hover:scale-105">
                   <Star className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                   <span className="text-xs font-black text-foreground">4.8</span>
                 </div>
              </div>
              <div className="flex justify-between items-start gap-4 px-2.5">
                 <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-foreground mb-1 group-hover:text-brand-500 transition-colors">Truffle Mushroom Pizza</h3>
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground/80">Luigi's Italian • 1.2 mi away</p>
                 </div>
                 <p className="text-lg sm:text-xl font-black text-brand-500 shrink-0">$24.50</p>
              </div>
            </motion.div>

            {/* Item 3 */}
            <motion.div variants={fadeUp} className="group cursor-pointer flex flex-col">
              <div className="relative w-full h-64 sm:h-72 lg:h-80 rounded-[2.25rem] overflow-hidden bg-muted mb-5 shadow-md group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-border transition-shadow duration-500">
                 <Image src="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80" alt="Wagyu Beef" fill className="object-cover group-hover:scale-103 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="absolute top-4.5 right-4.5 bg-card/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-border transition-transform group-hover:scale-105">
                   <Star className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                   <span className="text-xs font-black text-foreground">5.0</span>
                 </div>
              </div>
              <div className="flex justify-between items-start gap-4 px-2.5">
                 <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-foreground mb-1 group-hover:text-brand-500 transition-colors">Charcoal Grilled Wagyu</h3>
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground/80">SteakHouse • 3.0 mi away</p>
                 </div>
                 <p className="text-lg sm:text-xl font-black text-brand-500 shrink-0">$72.00</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mobile App Promo */}
      <section className="w-full bg-[#0A0A0A] py-24 lg:py-32 2xl:py-36 3xl:py-44 relative overflow-hidden transition-colors duration-300">
        {/* Warm Ambient Glow */}
        <div className="absolute top-0 right-0 w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl 2xl:max-w-[90rem] 3xl:max-w-[120rem] mx-auto px-4 sm:px-8 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 relative z-10">
           {/* Mock Phone Display (Upright, Orange Bezel Frame) */}
           <motion.div 
             initial={{ opacity: 0, y: 50 }} 
             whileInView={{ opacity: 1, y: 0 }} 
             viewport={{ once: true }} 
             transition={{ duration: 0.8, type: "spring" }}
             className="w-[200px] xs:w-[220px] sm:w-[250px] md:w-[270px] relative aspect-[9/18.5] bg-black rounded-[2.75rem] p-2 sm:p-2.5 shadow-2xl border-[5px] border-[#FF6B35] group shrink-0"
           >
             <div className="w-full h-full bg-[#121212] rounded-[2.1rem] overflow-hidden relative shadow-inner">
                {/* App Screen Content */}
                <div className="w-full h-full flex flex-col pt-10 pb-5 px-5 select-none">
                   {/* Top Notch bar */}
                   <div className="w-1/3 h-1 bg-white/10 absolute top-4 left-1/3 rounded-full"></div>
                   
                   <div className="mb-6">
                     <h4 className="text-lg font-black text-white tracking-tight">VIP Platinum</h4>
                     <p className="text-[9px] text-[#FF6B35] font-black tracking-widest mt-1">MEMBER SINCE 2024</p>
                   </div>
                   
                   <div className="space-y-3.5 flex-1">
                     {/* Orange Button with Map Pin */}
                     <div className="w-full h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-[1.02]">
                       <MapPin className="w-5 h-5 text-white" />
                     </div>
                     
                     {/* Grey Placeholder Bars */}
                     <div className="w-full h-11 bg-[#242424] rounded-xl"></div>
                     <div className="w-full h-11 bg-[#242424] rounded-xl"></div>
                     <div className="w-full h-11 bg-[#242424] rounded-xl"></div>
                   </div>
                </div>
             </div>
             
             {/* Floating App Badge (Overlapping Right Bezel) */}
             <motion.div 
               animate={{ y: [0, -8, 0] }} 
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-[28%] -right-8 bg-[#1A1A1A] rounded-xl shadow-2xl px-3 py-2.5 flex items-center gap-2.5 border border-zinc-800 z-20"
             >
                <div className="w-5 h-5 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                   <ShieldCheck className="w-4 h-4 text-green-500" />
                </div>
                <div className="leading-tight">
                  <p className="text-[7px] text-green-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Status
                  </p>
                  <p className="text-[10px] font-black text-white whitespace-nowrap mt-0.5">Priority Waitlist</p>
                </div>
             </motion.div>
           </motion.div>

           {/* Features & Copy Content */}
           <motion.div 
             variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
             className="flex-1 w-full text-left space-y-6 sm:space-y-8"
           >
              <motion.h2 variants={fadeUp} className="text-3.5xl sm:text-4.5xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight text-balance">
                Elevate Every<br/>
                <span className="text-[#FF6B35]">Dining Moment.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-sm sm:text-base text-zinc-400 max-w-lg leading-relaxed text-balance font-medium">
                Download the QuickBite app to unlock priority seating, exclusive partner menus, and pay the check silently from your phone.
              </motion.p>
              
              <motion.ul variants={staggerContainer} className="space-y-5 max-w-md pt-2">
                {[
                  { icon: Hourglass, title: "Priority Reservations", desc: "Never wait for a table again." },
                  { icon: Apple, title: "Touchless Payments", desc: "Secure, instant payments via Apple Pay." }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.li key={idx} variants={fadeUp} className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#1A1513] flex items-center justify-center shrink-0 border border-[#3E2218]">
                        <Icon className="w-5 h-5 text-[#FF6B35]" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-white mb-0.5">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-zinc-400 font-medium">{item.desc}</p>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>

              {/* App Badge Downloads */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 pt-2">
                 <button className="flex items-center gap-2.5 bg-white hover:bg-gray-100 text-black px-5 py-2.5 rounded-xl font-extrabold transition-all hover:scale-105 active:scale-95 shadow-md">
                    <Apple className="w-5 h-5 fill-black text-black" />
                    <div className="text-left leading-tight">
                       <p className="text-[7px] font-extrabold opacity-75 uppercase tracking-wider">Download on the</p>
                       <p className="text-xs font-black">App Store</p>
                    </div>
                 </button>
                 <button className="flex items-center gap-2.5 bg-transparent border border-zinc-800 hover:border-zinc-600 hover:bg-white/5 text-white px-5 py-2.5 rounded-xl font-extrabold transition-all hover:scale-105 active:scale-95">
                    <Play className="w-5 h-5 text-[#FF6B35] fill-[#FF6B35]" />
                    <div className="text-left leading-tight">
                       <p className="text-[7px] font-extrabold opacity-75 uppercase tracking-wider">GET IT ON</p>
                       <p className="text-xs font-black">Google Play</p>
                    </div>
                 </button>
              </motion.div>
           </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="partners" className="w-full bg-background py-24 lg:py-32 2xl:py-36 3xl:py-44 transition-colors duration-300">
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 text-center">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
             className="bg-gradient-to-br from-brand-500 to-orange-600 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-16 lg:p-24 flex flex-col items-center justify-center gap-8 shadow-[0_30px_60px_-15px_rgba(255,107,53,0.3)] dark:shadow-none relative overflow-hidden group"
           >
             {/* Decorative Elements */}
             <div className="absolute -top-32 -left-32 w-72 h-72 sm:w-80 sm:h-80 border-[30px] sm:border-[40px] border-white/10 rounded-full group-hover:scale-105 transition-transform duration-750 pointer-events-none"></div>
             <div className="absolute -bottom-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 border-[40px] sm:border-[50px] border-white/10 rounded-full group-hover:scale-105 transition-transform duration-750 pointer-events-none"></div>
             
             <h2 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-tight relative z-10 max-w-3xl text-balance drop-shadow">
                Ready to Skip the Wait?
             </h2>
             <p className="text-lg sm:text-xl lg:text-2xl text-white/90 relative z-10 max-w-2xl font-medium">
                Join 50,000+ diners experiencing the future of restaurants today.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 w-full justify-center relative z-10 mt-4 sm:mt-6 max-w-md sm:max-w-none">
                <button className="px-8 sm:px-10 py-4 sm:py-5 bg-zinc-950 dark:bg-background hover:bg-black dark:hover:bg-background/90 text-white dark:text-foreground font-extrabold text-base sm:text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl border border-transparent dark:border-border">
                  Start Booking Now
                </button>
                <button className="px-8 sm:px-10 py-4 sm:py-5 bg-white hover:bg-gray-50 text-brand-500 font-extrabold text-base sm:text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2 group/btn">
                  <span>Partner with Us</span> 
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform" />
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
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 p-3.5 sm:p-4 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-2xl border border-brand-400/40 transition-all hover:-translate-y-1 active:scale-95"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
