'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, AlertCircle, CheckCircle2,
  ChevronRight, Apple, Play, ArrowRight, Utensils, Navigation,
  Map as MapIcon, XCircle, Ban, Hourglass, ShieldCheck, ArrowUp,
  Armchair, Layers, Locate, Zap, X
} from 'lucide-react';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.11 } },
};

const scaleIn = {
  hidden:  { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

/* ─── Animated Counter Component (1 to target number throw loop) ─── */
function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number | null = null;
          const duration = 3800; // 3.8s relaxed, readable counting speed

          const step = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            // Ease-out cubic curve for steady, gentle number iteration
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            setCount(easedProgress * target);

            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span ref={nodeRef} className="tabular-nums">
      {prefix}
      {decimals > 0
        ? count.toFixed(decimals)
        : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Table + Food');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setShowScrollTop(currentScroll > 300);
      if (totalHeight > 0) {
        setScrollProgress(Math.min(Math.max((currentScroll / totalHeight) * 100, 0), 100));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const startY = window.scrollY || window.pageYOffset;
    if (startY === 0) return;
    // Ultra-smooth, gentle travel duration (scaled between 1.8s and 2.6s for relaxed travel)
    const duration = Math.min(Math.max(Math.abs(startY) * 0.8, 1800), 2600);
    const startTime = performance.now();

    // Smooth Quintic Easing curve for ultra-gentle, gradual acceleration and deceleration
    const easeInOutQuint = (t: number) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutQuint(progress);

      window.scrollTo(0, startY * (1 - easedProgress));

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const tabs = [
    { id: 'Table',       icon: Armchair },
    { id: 'Food',        icon: Utensils },
    { id: 'Table + Food', icon: Layers  },
  ];

  return (
    <div className="flex flex-col w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-b from-[#FAF8F5] to-[#F5F2EC] dark:from-[#0B0A09] dark:to-[#0F0E0D] font-sans transition-colors duration-300">

      {/* ══════════════════════════════════════════
          HERO SECTION
          - Mobile (< md): compact stacked layout so photo is immediately visible
          - Tablet & Desktop (md+): side-by-side layout
          - Floating cards: kept strictly inside image container below xl (1280px+)
      ══════════════════════════════════════════ */}
      <section className="
        relative w-full
        max-w-7xl 2xl:max-w-[88rem] 3xl:max-w-[110rem] 4xl:max-w-[140rem] mx-auto
        px-3.5 xs:px-5 sm:px-8 md:px-8 lg:px-12 xl:px-16 3xl:px-20 4xl:px-28
        pt-4 xs:pt-6 sm:pt-8 lg:pt-12 3xl:pt-16
        pb-8 xs:pb-10 sm:pb-12 lg:pb-16 3xl:pb-20
        flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-6 lg:gap-12 xl:gap-16 3xl:gap-20
        overflow-hidden xl:overflow-visible
      ">
        {/* Ambient glows */}
        <div className="absolute top-1/4 -left-32 w-[280px] sm:w-[450px] 3xl:w-[600px] h-[280px] sm:h-[450px] 3xl:h-[600px] bg-gradient-to-tr from-brand-500/15 to-orange-500/5 dark:from-brand-500/10 dark:to-transparent rounded-full blur-[90px] sm:blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[250px] sm:w-[380px] 3xl:w-[500px] h-[250px] sm:h-[380px] 3xl:h-[500px] bg-brand-500/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

        {/* ── Left: copy + search box ── */}
        <motion.div
          className="flex-1 flex flex-col items-start justify-center gap-6 xs:gap-7 sm:gap-8 lg:gap-10 z-10 w-full md:max-w-[52%] lg:max-w-xl xl:max-w-2xl 3xl:max-w-3xl shrink-0"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center px-3.5 xs:px-4 py-1 xs:py-1.5 gap-2 bg-brand-500/10 dark:bg-brand-500/20 rounded-full border border-brand-500/20 shadow-[0_4px_16px_rgba(255,107,53,0.12)]"
          >
            <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_#FF6B35] shrink-0 animate-pulse" />
            <span className="text-brand-600 dark:text-brand-400 text-[10px] xs:text-[11px] sm:text-xs font-black tracking-wider uppercase">
              NOW LIVE IN NEW YORK
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="
              text-[1.8rem] xs:text-[2.2rem] sm:text-[2.8rem] md:text-[2.8rem]
              lg:text-[3.4rem] xl:text-[4.2rem] 2xl:text-[4.8rem]
              font-black text-foreground leading-[1.05] tracking-tight
            "
          >
            Skip the Wait.<br />
            <span className="text-brand-500 drop-shadow-sm">Eat Faster.</span>
          </motion.h1>

          {/* ── Search Box ── */}
          <motion.div
            variants={fadeUp}
            className="
              w-full
              bg-card/85 dark:bg-card/60 backdrop-blur-2xl
              rounded-[1.5rem] xs:rounded-[1.75rem] sm:rounded-[2rem]
              p-3 xs:p-4 sm:p-5
              shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.4)]
              border border-border/80 relative z-20 my-1 sm:my-3
            "
          >
            {/* Tabs */}
            <div className="flex items-center gap-1.5 mb-3 px-0.5 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center px-3 xs:px-4 py-1.5 xs:py-2 text-xs sm:text-sm font-extrabold transition-colors z-10 rounded-xl xs:rounded-2xl shrink-0 ${isActive ? 'text-brand-500' : 'text-muted-foreground/80 hover:text-foreground'}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-brand-500/10 rounded-xl xs:rounded-2xl"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 mr-1.5 relative z-10 shrink-0" />
                    <span className="relative z-10 whitespace-nowrap">{tab.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Input row */}
            <div className="flex flex-col xs:flex-row items-stretch gap-2.5 xs:gap-3">
              <div className="flex-1 flex items-center justify-between bg-muted/70 dark:bg-muted/50 rounded-2xl px-3.5 xs:px-4 py-3 border border-transparent focus-within:border-brand-500/50 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
                <div className="flex items-center flex-1 min-w-0">
                  <Search className="w-4 h-4 xs:w-4.5 xs:h-4.5 text-muted-foreground mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search restaurants, cuisines..."
                    className="bg-transparent w-full outline-none text-xs xs:text-sm sm:text-base font-semibold text-foreground placeholder:text-muted-foreground/60 min-w-0"
                  />
                </div>
                <button className="flex items-center gap-1 text-brand-500 hover:text-brand-600 font-extrabold text-xs px-2 py-1 transition-colors shrink-0">
                  <Locate className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Near Me</span>
                </button>
              </div>
              <button className="flex items-center justify-center gap-2 px-6 xs:px-7 py-3 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-2xl transition-all hover:shadow-[0_8px_25px_rgba(255,107,53,0.4)] hover:scale-[1.02] active:scale-95 whitespace-nowrap text-xs xs:text-sm sm:text-base">
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Popular tags */}
            <div className="mt-2.5 xs:mt-3 px-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <ChevronRight className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span className="text-[10px] xs:text-xs font-bold text-muted-foreground/70 whitespace-nowrap">Popular:</span>
              {['Sushi', 'Pizza', 'Burgers', 'Italian', 'Thai'].map((t) => (
                <button key={t} className="text-[10px] xs:text-xs font-bold text-muted-foreground/70 hover:text-brand-500 transition-colors whitespace-nowrap px-2 py-0.5 rounded-full hover:bg-brand-500/10">
                  {t}
                </button>
              ))}
            </div>
          </motion.div>


        </motion.div>

        {/* ── Right: Restaurant image with floating cards ── */}
        <motion.div
          className="
            flex-1 relative w-full
            min-h-[270px] xs:min-h-[310px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[480px] xl:min-h-[540px] 2xl:min-h-[600px] 3xl:min-h-[680px]
            h-[270px] xs:h-[310px] sm:h-[360px] md:h-[400px] lg:h-[480px] xl:h-[540px] 2xl:h-[600px] 3xl:h-[680px]
            rounded-[1.5rem] xs:rounded-[1.75rem] sm:rounded-[2.25rem]
            bg-card/50 dark:bg-card/20 shadow-2xl border border-border/80
            p-1.5 xs:p-2 sm:p-3
            overflow-hidden xl:overflow-visible
            group md:max-w-[48%] lg:max-w-[580px] xl:max-w-none shrink-0
          "
          initial={{ opacity: 0, x: 50, rotate: -1.5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.9, type: 'spring', bounce: 0.25 }}
        >
          <div className="absolute inset-1.5 xs:inset-2 sm:inset-3 rounded-[1.25rem] xs:rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-zinc-900 shadow-inner">
            <Image
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80"
              alt="Premium Restaurant Interior"
              fill
              unoptimized
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
          <div className="absolute inset-0 rounded-[2.25rem] shadow-[inset_0_0_80px_rgba(0,0,0,0.08)] pointer-events-none" />

          {/* Floating card: Table Ready */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="
              absolute top-2.5 left-2.5 xs:top-3 xs:left-3 xl:top-8 xl:-left-8
              bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl
              p-1.5 xs:p-2 sm:p-2.5
              rounded-lg xs:rounded-xl sm:rounded-2xl
              shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-white/40 dark:border-zinc-700/50
              flex items-center gap-1.5 xs:gap-2
              hover:scale-[1.05] transition-transform cursor-pointer z-10
            "
          >
            <div className="w-6 h-6 xs:w-7 xs:h-7 bg-green-500/15 rounded-md xs:rounded-lg flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-green-500" />
            </div>
            <div>
              <p className="text-[7px] xs:text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider">Status</p>
              <p className="text-[9px] xs:text-[10px] sm:text-xs font-black text-foreground whitespace-nowrap">Table Ready ✓</p>
            </div>
          </motion.div>

          {/* Floating card: Rating */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="
              absolute top-1/2 -translate-y-1/2 right-2.5 xs:right-3 xl:-right-8
              bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl
              p-1.5 xs:p-2 sm:p-2.5
              rounded-lg xs:rounded-xl sm:rounded-2xl
              shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-white/40 dark:border-zinc-700/50
              flex items-center gap-1.5 xs:gap-2
              hover:scale-[1.05] transition-transform cursor-pointer z-10
            "
          >
            <div className="w-6 h-6 xs:w-7 xs:h-7 bg-brand-500/15 rounded-md xs:rounded-lg flex items-center justify-center shrink-0">
              <Star className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-brand-500 fill-brand-500" />
            </div>
            <div>
              <p className="text-[7px] xs:text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider">Rating</p>
              <p className="text-[9px] xs:text-[10px] sm:text-xs font-black text-foreground whitespace-nowrap">4.9 / 5.0</p>
            </div>
          </motion.div>

          {/* Floating card: Wait Saved */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
            className="
              absolute bottom-2.5 left-2.5 xs:bottom-3 xs:left-3 xl:bottom-8 xl:-left-6
              bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl
              p-1.5 xs:p-2 sm:p-2.5
              rounded-lg xs:rounded-xl sm:rounded-2xl
              shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-white/40 dark:border-zinc-700/50
              flex items-center gap-1.5 xs:gap-2 hover:scale-[1.05] transition-transform cursor-pointer z-10
            "
          >
            <div className="w-6 h-6 xs:w-7 xs:h-7 bg-yellow-500/15 rounded-md xs:rounded-lg flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-yellow-500 fill-yellow-500" />
            </div>
            <div>
              <p className="text-[7px] xs:text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider">Wait Saved</p>
              <p className="text-[10px] xs:text-xs font-black text-yellow-500 whitespace-nowrap leading-tight">-30 mins</p>
            </div>
          </motion.div>

          {/* Live tables badge */}
          <div className="absolute bottom-2.5 right-2.5 xs:bottom-3 xs:right-3 bg-black/65 dark:bg-black/75 backdrop-blur-xl rounded-lg xs:rounded-xl px-2 xs:px-2.5 py-1 xs:py-1.5 flex items-center gap-1.5 z-10 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e] animate-pulse" />
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-white whitespace-nowrap">34 tables available</span>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          TRUST STATS SECTION
          - Mobile: 2×2 grid
          - lg+:    4 in a row
      ══════════════════════════════════════════ */}
      <motion.section
        initial="hidden" whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className="w-full bg-card/60 dark:bg-card/25 backdrop-blur-md border-y border-border transition-colors duration-300 relative z-10 shadow-[0_4px_30px_rgba(0,0,0,0.01)]"
      >
        <div className="max-w-7xl 3xl:max-w-[100rem] 4xl:max-w-[130rem] mx-auto px-3.5 xs:px-5 sm:px-6 lg:px-8 xl:px-10 3xl:px-20 py-8 sm:py-12 3xl:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8 3xl:gap-12">
            {[
              { target: 50,    suffix: 'K+', label: 'Active Users',        decimals: 0 },
              { target: 1200,  suffix: '+',  label: 'Partner Restaurants', decimals: 0 },
              { target: 250,   suffix: 'K+', label: 'Orders Delivered',    decimals: 0 },
              { target: 4.9,   suffix: '★',  label: 'App Rating',          decimals: 1, isRating: true },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-1 hover:scale-[1.05] transition-transform duration-300 py-1.5 sm:py-2">
                <h3 className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl 3xl:text-6xl 4xl:text-7xl font-black ${stat.isRating ? 'text-brand-500' : 'text-foreground'} tracking-tight flex items-center`}>
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </h3>
                <p className="text-[10px] xs:text-xs 3xl:text-sm font-black text-muted-foreground/80 tracking-wider uppercase text-center leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════
          COMPARISON SECTION
      ══════════════════════════════════════════ */}
      <section className="relative w-full bg-zinc-950 dark:bg-card border-y border-border py-16 xs:py-20 sm:py-24 lg:py-32 3xl:py-40 transition-colors duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[length:24px_24px] opacity-60" />

        <div className="max-w-7xl 3xl:max-w-[100rem] 4xl:max-w-[130rem] mx-auto px-4 xs:px-5 sm:px-8 lg:px-10 3xl:px-20 flex flex-col items-center gap-10 sm:gap-14 relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center max-w-2xl 3xl:max-w-4xl mx-auto space-y-3"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl 3xl:text-6xl 4xl:text-7xl font-black tracking-tight text-white dark:text-foreground">
              Why QuickBite?
            </h2>
            <p className="text-sm xs:text-base sm:text-lg 3xl:text-xl text-zinc-400 dark:text-muted-foreground font-medium">
              Compare the dining experience and see the difference.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 w-full max-w-5xl 3xl:max-w-6xl">
            {/* Traditional Card */}
            <motion.div
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="bg-zinc-900/60 backdrop-blur-lg dark:bg-background/50 border border-zinc-800/80 dark:border-border/60 rounded-[1.75rem] xs:rounded-[2rem] sm:rounded-[2.5rem] p-5 xs:p-6 sm:p-8 flex flex-col gap-6 xs:gap-7 hover:border-zinc-700 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 xs:w-11 xs:h-11 rounded-xl xs:rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl 3xl:text-4xl font-black text-white dark:text-foreground tracking-tight">Traditional Way</h3>
              </div>
              <ul className="space-y-3 xs:space-y-4">
                {[
                  'Wait 45+ minutes for a table during peak hours',
                  "Struggle to get the waiter's attention to order",
                  'Food takes 20+ mins after ordering to arrive',
                  'Rush through your meal due to the crowd',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 xs:w-5 xs:h-5 text-red-500/70 shrink-0 mt-0.5" />
                    <span className="text-xs xs:text-sm sm:text-base md:text-sm lg:text-base 3xl:text-lg text-zinc-400 dark:text-muted-foreground font-medium leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* QuickBite Card */}
            <motion.div
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.14 }}
              className="relative bg-gradient-to-br from-[#FF6B35] to-[#FF4D0F] rounded-[1.75rem] xs:rounded-[2rem] sm:rounded-[2.5rem] p-5 xs:p-6 sm:p-8 flex flex-col gap-6 xs:gap-7 shadow-[0_20px_50px_-15px_rgba(255,107,53,0.45)] dark:shadow-none overflow-hidden group hover:scale-[1.01] transition-all duration-300 border border-white/15"
            >
              {/* Shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full" />
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.1)_0%,_transparent_60%)] pointer-events-none" />
              <div className="absolute top-4 right-4 xs:top-5 xs:right-5 bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full text-[9px] xs:text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                THE FUTURE
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 xs:w-11 xs:h-11 rounded-xl xs:rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <h3 className="text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl 3xl:text-4xl font-black text-white tracking-tight">QuickBite Experience</h3>
              </div>
              <ul className="space-y-3 xs:space-y-4 relative z-10">
                {[
                  'Walk directly to your reserved table. No wait.',
                  'Order pre-prep in app before you even arrive.',
                  'Food served within 2 minutes of sitting down.',
                  'One-tap mobile payment and VIP rewards.',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 xs:w-5 xs:h-5 text-white shrink-0 mt-0.5 drop-shadow-md" />
                    <span className="text-xs xs:text-sm sm:text-base md:text-sm lg:text-base 3xl:text-lg text-white/95 font-semibold leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS SECTION
          - Mobile: 1 column
          - sm:     2×2 grid
          - lg:     4 in a row
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative w-full bg-background py-16 xs:py-20 sm:py-24 lg:py-32 3xl:py-40 transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] 3xl:w-[700px] h-[300px] sm:h-[500px] 3xl:h-[700px] bg-brand-500/5 rounded-full blur-[100px] sm:blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-7xl 3xl:max-w-[100rem] 4xl:max-w-[130rem] mx-auto px-4 xs:px-5 sm:px-8 lg:px-10 3xl:px-20 flex flex-col items-center gap-10 sm:gap-14 lg:gap-20">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center max-w-2xl 3xl:max-w-4xl mx-auto space-y-3"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl 3xl:text-6xl 4xl:text-7xl font-black text-foreground tracking-tight">
              Four Steps to Perfection
            </h2>
            <p className="text-sm xs:text-base sm:text-lg 3xl:text-xl text-muted-foreground font-medium">
              An uncompromised, frictionless dining experience.
            </p>
          </motion.div>

          <div className="relative w-full max-w-5xl 3xl:max-w-6xl mt-2 sm:mt-6">
            {/* Connecting line — only on lg (4-in-a-row), not on 2x2 grid */}
            <motion.div
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute top-12 left-[12%] right-[12%] h-[2px] bg-[radial-gradient(circle_at_center,_#ff4d0f_20%,_transparent_20%)] bg-[length:12px_2px] opacity-25 z-0 hidden lg:block origin-left"
            />

            <motion.div
              variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-7 sm:gap-8 md:gap-10 3xl:gap-12 relative z-10"
            >
              {[
                { icon: Search,      title: 'Discover',          desc: 'Find top-rated nearby restaurants.'      },
                { icon: Utensils,    title: 'Select & Pre-order', desc: 'Choose your favorites ahead of time.'   },
                { icon: AlertCircle, title: 'Get Notified',       desc: 'Real-time updates on your table status.' },
                { icon: Navigation,  title: 'Walk In & Eat',      desc: 'Bypass the line and enjoy.'              },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div key={idx} variants={scaleIn} className="flex flex-col items-center text-center gap-3 xs:gap-4 sm:gap-5 group">
                    <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-22 sm:h-22 lg:w-24 lg:h-24 3xl:w-28 3xl:h-28 bg-card/80 border border-border/80 rounded-2xl xs:rounded-[2rem] sm:rounded-[2.25rem] shadow-md dark:shadow-none flex items-center justify-center relative transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(255,107,53,0.14)] group-hover:border-brand-500/25">
                      <Icon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 3xl:w-10 3xl:h-10 text-brand-500 transition-transform group-hover:scale-110 duration-300" />
                      <div className="absolute -top-2.5 -right-2.5 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-brand-500 text-white font-black text-[10px] xs:text-xs sm:text-sm rounded-full flex items-center justify-center border-[3px] xs:border-4 border-background shadow-md">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="px-1">
                      <h3 className="text-sm xs:text-base sm:text-lg 3xl:text-2xl font-bold text-foreground mb-1 group-hover:text-brand-500 transition-colors">{step.title}</h3>
                      <p className="text-[11px] xs:text-xs sm:text-sm 3xl:text-base text-muted-foreground/80 font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAPS & DISCOVERY SECTION
          - Mobile: stack (image top, list bottom)
          - lg+:    side by side
      ══════════════════════════════════════════ */}
      <section id="find-table" className="w-full bg-muted/20 py-16 xs:py-20 sm:py-24 lg:py-32 3xl:py-40 border-y border-border transition-colors duration-300 overflow-hidden">
        <div className="max-w-7xl 3xl:max-w-[100rem] 4xl:max-w-[130rem] mx-auto px-4 xs:px-5 sm:px-8 lg:px-10 3xl:px-20 flex flex-col lg:flex-row items-center gap-10 sm:gap-14 lg:gap-20">
          {/* Map image */}
          <motion.div
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="w-full lg:flex-1 relative h-[240px] xs:h-[280px] sm:h-[380px] lg:h-[460px] xl:h-[500px] 3xl:h-[560px] rounded-[2rem] xs:rounded-[2.5rem] overflow-hidden shadow-2xl bg-muted dark:bg-muted/50 group border border-border"
          >
            <Image
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
              alt="Map View" fill unoptimized
              className="object-cover opacity-55 dark:opacity-35 mix-blend-multiply dark:mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 via-transparent to-transparent opacity-90 mix-blend-color-burn" />
            {/* Mock Pins */}
            <div className="absolute top-[40%] left-[30%] w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(255,107,53,0.3)] animate-bounce relative z-10 cursor-pointer hover:scale-110 transition-transform">
              <Utensils className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
              <div className="absolute inset-0 rounded-full border-2 border-brand-500 animate-ping opacity-40" />
            </div>
            <div className="absolute top-[20%] right-[25%] w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-card text-foreground rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer border border-border">
              <MapIcon className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5" />
            </div>
            <div className="absolute bottom-[30%] left-[60%] w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-foreground text-background rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer">
              <MapPin className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5" />
            </div>
          </motion.div>

          {/* List content */}
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="w-full lg:flex-1 flex flex-col gap-5 xs:gap-6 sm:gap-8"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl 3xl:text-6xl font-black text-foreground tracking-tight mb-2.5 xs:mb-3.5">
                Live Nearby<br />Restaurants
              </h2>
              <p className="text-sm xs:text-base sm:text-lg 3xl:text-xl text-muted-foreground/95 font-medium leading-relaxed">
                Find real-time seating availability tailored to your current location.
              </p>
            </motion.div>

            <motion.div variants={staggerContainer} className="flex flex-col gap-3 xs:gap-4">
              {/* Restaurant item 1 */}
              <motion.div variants={fadeUp} className="bg-card/75 dark:bg-card/25 backdrop-blur-md p-3.5 xs:p-4.5 rounded-xl xs:rounded-2xl flex items-center justify-between border border-border/80 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 hover:border-brand-500/20 group min-w-0">
                <div className="flex items-center gap-3 xs:gap-4.5 min-w-0">
                  <div className="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-lg xs:rounded-xl bg-muted relative overflow-hidden shadow-inner shrink-0 border border-border/40">
                    <Image src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&q=80" alt="Burger" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-foreground flex items-center gap-2 group-hover:text-brand-500 transition-colors text-sm xs:text-sm sm:text-base 3xl:text-lg truncate">
                      The Pembroke Grill
                      <span className="text-[9px] bg-green-500/15 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black shrink-0">Open</span>
                    </h4>
                    <p className="text-xs sm:text-sm 3xl:text-base text-muted-foreground/80 font-medium truncate mt-0.5">0.4 mi • 5 min away</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 xs:gap-3 shrink-0">
                  <p className="text-xs 3xl:text-sm font-black text-green-600 dark:text-green-400 hidden xs:block">No Wait</p>
                  <div className="w-8 h-8 rounded-full bg-muted/80 group-hover:bg-brand-500/10 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>
              </motion.div>

              {/* Restaurant item 2 */}
              <motion.div variants={fadeUp} className="bg-card/75 dark:bg-card/25 backdrop-blur-md p-3.5 xs:p-4.5 rounded-xl xs:rounded-2xl flex items-center justify-between border border-border/80 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 hover:border-brand-500/20 group min-w-0">
                <div className="flex items-center gap-3 xs:gap-4.5 min-w-0">
                  <div className="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-lg xs:rounded-xl bg-muted relative overflow-hidden shadow-inner shrink-0 border border-border/40">
                    <Image src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80" alt="Healthy Bowl" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-foreground flex items-center gap-2 group-hover:text-brand-500 transition-colors text-sm xs:text-sm sm:text-base 3xl:text-lg truncate">Green Leaf Kitchen</h4>
                    <p className="text-xs sm:text-sm 3xl:text-base text-muted-foreground/80 font-medium truncate mt-0.5">1.2 mi • 12 min away</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 xs:gap-3 shrink-0">
                  <p className="text-xs 3xl:text-sm font-black text-yellow-600 dark:text-yellow-500 hidden xs:block">~10 min</p>
                  <div className="w-8 h-8 rounded-full bg-muted/80 group-hover:bg-brand-500/10 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>
              </motion.div>

              <motion.button variants={fadeUp} className="w-full mt-1 xs:mt-2 py-3.5 xs:py-4 3xl:py-5 bg-foreground hover:bg-foreground/90 text-background font-extrabold rounded-xl xs:rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm xs:text-base 3xl:text-lg">
                Explore Full Map
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CHEF'S RECOMMENDATIONS
          - Mobile: 1 column
          - sm:     2 columns
          - lg:     3 columns
      ══════════════════════════════════════════ */}
      <section id="explore" className="w-full bg-background py-16 xs:py-20 sm:py-24 lg:py-32 3xl:py-40 transition-colors duration-300">
        <div className="max-w-7xl 3xl:max-w-[100rem] 4xl:max-w-[130rem] mx-auto px-4 xs:px-5 sm:px-8 lg:px-10 3xl:px-20 flex flex-col gap-8 sm:gap-12">
          <div className="flex justify-between items-end">
            <motion.h2
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl 3xl:text-5xl 4xl:text-6xl font-black text-foreground tracking-tight"
            >
              Chef's Recommendations
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="flex gap-2"
            >
              <button className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 3xl:w-13 3xl:h-13 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-foreground/20 transition-all active:scale-95">
                <ChevronRight className="w-4 xs:w-4.5 sm:w-5 h-4 xs:h-4.5 sm:h-5 text-foreground rotate-180" />
              </button>
              <button className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 3xl:w-13 3xl:h-13 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-foreground/20 transition-all active:scale-95">
                <ChevronRight className="w-4 xs:w-4.5 sm:w-5 h-4 xs:h-4.5 sm:h-5 text-foreground" />
              </button>
            </motion.div>
          </div>

          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xs:gap-7 sm:gap-8 3xl:gap-10"
          >
            {[
              { img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', alt: 'Salad Bowl',  rating: '4.9', name: 'Mediterranean Salad Bowl', rest: 'The Salad Co. • 0.5 mi away', price: '$18.90' },
              { img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80', alt: 'Pizza',       rating: '4.8', name: 'Truffle Mushroom Pizza',    rest: "Luigi's Italian • 1.2 mi away", price: '$24.50' },
              { img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', alt: 'Wagyu Beef',  rating: '5.0', name: 'Charcoal Grilled Wagyu',   rest: 'SteakHouse • 3.0 mi away',   price: '$72.00' },
            ].map((item, idx) => (
              <motion.div key={idx} variants={fadeUp} className="group cursor-pointer flex flex-col">
                <div className="relative w-full h-52 xs:h-60 sm:h-64 md:h-72 lg:h-80 3xl:h-96 rounded-[1.75rem] xs:rounded-[2rem] sm:rounded-[2.25rem] overflow-hidden bg-muted mb-4 xs:mb-5 shadow-md group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-border transition-shadow duration-500">
                  <Image src={item.img} alt={item.alt} fill unoptimized className="object-cover group-hover:scale-103 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3.5 xs:top-4.5 right-3.5 xs:right-4.5 bg-card/90 backdrop-blur px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full flex items-center gap-1 xs:gap-1.5 shadow-sm border border-border transition-transform group-hover:scale-105">
                    <Star className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-brand-500 fill-brand-500" />
                    <span className="text-[10px] xs:text-xs font-black text-foreground">{item.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-start gap-4 px-1.5 xs:px-2.5">
                  <div>
                    <h3 className="text-base xs:text-lg sm:text-xl 3xl:text-2xl font-extrabold text-foreground mb-1 group-hover:text-brand-500 transition-colors">{item.name}</h3>
                    <p className="text-xs sm:text-sm 3xl:text-base font-semibold text-muted-foreground/80">{item.rest}</p>
                  </div>
                  <p className="text-base xs:text-lg sm:text-xl 3xl:text-2xl font-black text-brand-500 shrink-0">{item.price}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MOBILE APP PROMO — COMPACT RESPONSIVE SECTION
          - Mobile (< sm): phone top + copy bottom (compact padding)
          - Tablet & Desktop (sm+): 2-column side-by-side grid
      ══════════════════════════════════════════ */}
      <section className="w-full bg-[#0A0A0A] py-8 xs:py-10 sm:py-12 lg:py-16 3xl:py-20 relative overflow-hidden transition-colors duration-300">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[450px] 3xl:w-[600px] h-[300px] sm:h-[450px] 3xl:h-[600px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-brand-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl 3xl:max-w-[100rem] 4xl:max-w-[130rem] mx-auto px-3.5 xs:px-5 sm:px-8 lg:px-10 3xl:px-20 grid grid-cols-1 sm:grid-cols-2 items-center justify-items-center sm:justify-items-start gap-5 xs:gap-6 sm:gap-8 lg:gap-12 relative z-10">

          {/* Phone mockup — compact height (~340px) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, type: 'spring' }}
            className="w-[170px] xs:w-[195px] sm:w-[210px] md:w-[230px] lg:w-[250px] 3xl:w-[280px] relative aspect-[9/17.5] bg-black rounded-[2rem] xs:rounded-[2.25rem] p-1.5 xs:p-2 shadow-2xl border-[3.5px] xs:border-[4px] border-[#FF6B35] group shrink-0 justify-self-center"
          >
            {/* Phone screen */}
            <div className="w-full h-full bg-[#121212] rounded-[1.6rem] xs:rounded-[1.8rem] overflow-hidden relative shadow-inner flex flex-col pt-5 xs:pt-6 pb-2 xs:pb-2.5 px-2.5 xs:px-3 select-none">
              {/* Dynamic Island / Speaker notch */}
              <div className="w-1/3 h-2 bg-black absolute top-1.5 left-1/3 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              </div>

              {/* Top status bar inside app */}
              <div className="flex items-center justify-between mb-2 pt-0.5">
                <div>
                  <h4 className="text-[10px] xs:text-[11px] font-black text-white tracking-tight leading-none">VIP Platinum</h4>
                  <p className="text-[6px] xs:text-[7px] text-[#FF6B35] font-black tracking-wider uppercase mt-0.5">MEMBER 2024</p>
                </div>
                <span className="text-[8px] xs:text-[9px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  2,450 pts
                </span>
              </div>

              {/* Active booking card */}
              <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] rounded-lg p-2 text-white mb-2 shadow-md">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[7px] xs:text-[8px] font-black uppercase tracking-widest text-white/80">Reserved</span>
                  <span className="text-[7px] xs:text-[8px] font-black bg-white/20 px-1 py-0.2 rounded">8:00 PM</span>
                </div>
                <p className="text-[10px] xs:text-xs font-black text-white truncate">Le Bernardin • #4</p>
                <div className="flex items-center gap-1 mt-0.5 text-[7px] xs:text-[8px] font-bold text-white/90">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white shrink-0" />
                  <span>Priority Confirmed</span>
                </div>
              </div>

              {/* App UI items */}
              <div className="space-y-1.5 flex-1">
                {/* Pre-order item */}
                <div className="bg-[#1A1A1A] border border-zinc-800/80 rounded-lg p-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-4.5 h-4.5 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-[8px] shrink-0">
                      ⚡
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] xs:text-[9px] font-extrabold text-white truncate">Truffle Pasta</p>
                      <p className="text-[6px] xs:text-[7px] text-zinc-500 font-semibold">Prep In Progress</p>
                    </div>
                  </div>
                  <span className="text-[8px] xs:text-[9px] font-black text-[#FF6B35] shrink-0">$96.50</span>
                </div>

                {/* Silent Checkout */}
                <div className="bg-[#1A1A1A] border border-zinc-800/80 rounded-lg p-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-4.5 h-4.5 rounded bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-[8px] shrink-0">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] xs:text-[9px] font-extrabold text-white truncate">Touchless Pay</p>
                      <p className="text-[6px] xs:text-[7px] text-zinc-500 font-semibold">Apple Pay</p>
                    </div>
                  </div>
                  <span className="text-[7px] xs:text-[8px] font-extrabold text-green-400 bg-green-500/10 px-1 py-0.5 rounded shrink-0">Ready</span>
                </div>

                {/* Rewards item */}
                <div className="bg-[#1A1A1A] border border-zinc-800/80 rounded-lg p-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-4.5 h-4.5 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-[8px] shrink-0">
                      ★
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] xs:text-[9px] font-extrabold text-white truncate">Free Dessert</p>
                      <p className="text-[6px] xs:text-[7px] text-zinc-500 font-semibold">Unlocked</p>
                    </div>
                  </div>
                  <span className="text-[7px] xs:text-[8px] font-extrabold text-yellow-400 shrink-0">Claim</span>
                </div>
              </div>
            </div>

            {/* Floating Badge: Priority Waitlist */}
            <motion.div
              animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[20%] -right-1 xs:-right-3 bg-[#1A1A1A]/95 backdrop-blur-xl rounded-lg shadow-2xl px-1.5 xs:px-2 py-1 flex items-center gap-1 border border-zinc-700/60 z-20"
            >
              <div className="w-3 h-3 xs:w-3.5 xs:h-3.5 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-green-400" />
              </div>
              <div className="leading-tight">
                <p className="text-[5px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                  <span className="w-0.5 h-0.5 rounded-full bg-green-400 animate-pulse" />Status
                </p>
                <p className="text-[7px] xs:text-[8px] font-black text-white whitespace-nowrap">Priority Waitlist</p>
              </div>
            </motion.div>

            {/* Floating Badge 2: Wait Saved */}
            <motion.div
              animate={{ y: [0, 4, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-[10%] -left-1 xs:-left-3 bg-[#1A1A1A]/95 backdrop-blur-xl rounded-lg shadow-2xl px-1.5 xs:px-2 py-1 flex items-center gap-1 border border-zinc-700/60 z-20"
            >
              <div className="w-3 h-3 xs:w-3.5 xs:h-3.5 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
                <Zap className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-amber-400 fill-amber-400" />
              </div>
              <div className="leading-tight">
                <p className="text-[5px] text-amber-400 font-bold uppercase tracking-wider">Average Saved</p>
                <p className="text-[7px] xs:text-[8px] font-black text-white whitespace-nowrap">-35 mins / visit</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Features copy */}
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="w-full text-center sm:text-left space-y-3 xs:space-y-3.5 sm:space-y-4"
          >
            <motion.h2 variants={fadeUp} className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl 3xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Elevate Every<br />
              <span className="text-[#FF6B35]">Dining Moment.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xs xs:text-xs sm:text-sm text-zinc-400 max-w-md mx-auto sm:mx-0 leading-relaxed font-medium">
              Download the QuickBite app to unlock priority seating, exclusive partner menus, and pay the check silently from your phone.
            </motion.p>

            <motion.ul variants={staggerContainer} className="space-y-2 xs:space-y-2.5 max-w-md mx-auto sm:mx-0 pt-0.5 text-left">
              {[
                { icon: Hourglass, title: 'Priority Reservations', desc: 'Never wait for a table again.'          },
                { icon: Apple,     title: 'Touchless Payments',    desc: 'Secure, instant payments via Apple Pay.' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.li key={idx} variants={fadeUp} className="flex items-center gap-2.5 xs:gap-3">
                    <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-[#1A1513] flex items-center justify-center shrink-0 border border-[#3E2218]">
                      <Icon className="w-3.5 h-3.5 text-[#FF6B35]" />
                    </div>
                    <div>
                      <h4 className="text-xs xs:text-sm font-black text-white mb-0.5">{item.title}</h4>
                      <p className="text-[10px] xs:text-xs text-zinc-400 font-medium">{item.desc}</p>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>

            {/* App store buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center sm:justify-start gap-2 xs:gap-2.5 pt-1">
              <button className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-3.5 xs:px-4 py-1.5 xs:py-2 rounded-lg xs:rounded-xl font-extrabold transition-all hover:scale-105 active:scale-95 shadow-md">
                <Apple className="w-3.5 h-3.5 xs:w-4 xs:h-4 fill-black text-black" />
                <div className="text-left leading-tight">
                  <p className="text-[5px] xs:text-[6px] font-extrabold opacity-75 uppercase tracking-wider">Download on the</p>
                  <p className="text-[9px] xs:text-[10px] font-black">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-transparent border border-zinc-800 hover:border-zinc-600 hover:bg-white/5 text-white px-3.5 xs:px-4 py-1.5 xs:py-2 rounded-lg xs:rounded-xl font-extrabold transition-all hover:scale-105 active:scale-95">
                <Play className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#FF6B35] fill-[#FF6B35]" />
                <div className="text-left leading-tight">
                  <p className="text-[5px] xs:text-[6px] font-extrabold opacity-75 uppercase tracking-wider">GET IT ON</p>
                  <p className="text-[9px] xs:text-[10px] font-black">Google Play</p>
                </div>
              </button>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA SECTION — Ready to Book
      ══════════════════════════════════════════ */}
      <section id="partners" className="w-full bg-background py-10 xs:py-12 sm:py-16 lg:py-24 3xl:py-32 transition-colors duration-300">
        <div className="max-w-5xl 3xl:max-w-6xl 4xl:max-w-7xl mx-auto px-3.5 xs:px-5 sm:px-6 md:px-8 3xl:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 28 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-brand-500 via-[#FF5520] to-orange-600 rounded-[1.75rem] xs:rounded-[2.25rem] sm:rounded-[2.75rem] lg:rounded-[3.25rem] px-4 pt-8 pb-6 xs:p-7 sm:p-10 lg:p-14 xl:p-16 flex flex-col items-center justify-center gap-4 xs:gap-5 sm:gap-7 shadow-[0_25px_60px_-15px_rgba(255,107,53,0.35)] dark:shadow-none relative overflow-hidden group"
          >
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            {/* Decorative circles */}
            <div className="absolute -top-20 -left-20 xs:-top-28 xs:-left-28 w-52 xs:w-64 sm:w-80 h-52 xs:h-64 sm:h-80 border-[20px] xs:border-[28px] sm:border-[40px] border-white/10 rounded-full group-hover:scale-110 transition-transform duration-1000 pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 xs:-bottom-28 xs:-right-28 w-64 xs:w-80 sm:w-[26rem] h-64 xs:h-80 sm:h-[26rem] border-[28px] xs:border-[38px] sm:border-[50px] border-white/10 rounded-full group-hover:scale-110 transition-transform duration-1000 pointer-events-none" />
            {/* Glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            {/* Trust badges row — compact inline pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 relative z-10 pt-1">
              {[
                { val: '50K+',   label: 'Happy Diners'      },
                { val: '4.9★',   label: 'App Rating'        },
                { val: '1,200+', label: 'Partners'          },
              ].map((badge) => (
                <div key={badge.val} className="flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/20 rounded-full px-2.5 xs:px-3 py-1 shadow-sm whitespace-nowrap">
                  <span className="text-[10px] xs:text-xs sm:text-sm font-black text-white">{badge.val}</span>
                  <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-white/90 uppercase tracking-wide">{badge.label}</span>
                </div>
              ))}
            </div>

            <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 3xl:text-6xl font-black text-white tracking-tight leading-[1.1] relative z-10 max-w-3xl drop-shadow-md">
              Ready to Skip the Wait?
            </h2>
            <p className="text-xs xs:text-sm sm:text-base lg:text-lg 3xl:text-xl text-white/90 relative z-10 max-w-lg 3xl:max-w-xl font-medium leading-relaxed">
              Join 50,000+ diners experiencing the future of restaurants today. No app download required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 xs:gap-3 sm:gap-4 w-full sm:w-auto justify-center relative z-10">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 xs:px-7 sm:px-8 py-3 xs:py-3.5 bg-zinc-950 hover:bg-black text-white font-extrabold text-xs xs:text-sm sm:text-base rounded-xl xs:rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl whitespace-nowrap group/cta">
                <span>Start Booking Now</span>
                <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 group-hover/cta:translate-x-1 transition-transform shrink-0" />
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 xs:px-7 sm:px-8 py-3 xs:py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur border border-white/30 hover:border-white/50 text-white font-extrabold text-xs xs:text-sm sm:text-base rounded-xl xs:rounded-2xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
                Partner with Us
              </button>
            </div>

            {/* Fine print */}
            <p className="text-[9px] xs:text-[10px] sm:text-xs text-white/60 relative z-10 font-medium">
              Free to get started · No credit card required · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>


      {/* Scroll-to-top FAB with Dynamic Circular Progress & Hover Tooltip */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-5 xs:bottom-7 xs:right-6 sm:bottom-8 sm:right-8 z-50 group flex items-center gap-2"
          >
            {/* Desktop hover label pill */}
            <span className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-all duration-250 bg-zinc-950/90 dark:bg-white/90 text-white dark:text-zinc-950 text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur pointer-events-none whitespace-nowrap -translate-x-1 group-hover:translate-x-0">
              Back to Top
            </span>

            {/* Circular button with progress ring */}
            <button
              onClick={scrollToTop}
              className="relative w-12 h-12 xs:w-13 xs:h-13 sm:w-14 sm:h-14 rounded-full bg-card/90 dark:bg-card/90 backdrop-blur-xl border border-border/80 shadow-[0_10px_35px_rgba(255,107,53,0.3)] hover:shadow-[0_14px_45px_rgba(255,107,53,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Scroll smoothly to top of page"
            >
              {/* SVG Circular Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-0.5" viewBox="0 0 36 36">
                <path
                  className="text-muted/40 dark:text-muted/20"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-500 transition-all duration-150 ease-out"
                  strokeDasharray={`${scrollProgress}, 100`}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              {/* Inner glowing orange icon container */}
              <div className="w-8.5 h-8.5 xs:w-9.5 xs:h-9.5 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#FF6B35] to-[#FF4D0F] flex items-center justify-center text-white shadow-md group-hover:from-[#e85a25] group-hover:to-[#f03205] transition-colors">
                <ArrowUp className="w-4.5 h-4.5 xs:w-5 xs:h-5 text-white transition-transform group-hover:-translate-y-0.5 duration-250" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
