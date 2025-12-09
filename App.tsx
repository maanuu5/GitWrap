import React, { useState, useEffect } from 'react';
import { AppState, WrappedData } from './types';
import { fetchGithubData, processStats } from './services/githubService';
import { generateGeminiInsights } from './services/geminiService';
import { 
  RhythmSlide, 
  CommitsSlide, 
  DNASlide, 
  FavoriteDaySlide, 
  ZoneSlide, 
  ImpactSlide, 
  PaletteSlide, 
  TopProjectsSlide, 
  TopProjectSlide,
  SummaryCardSlide
} from './components/Slides';
import { AnimatePresence, motion } from 'framer-motion';

const SLIDE_COMPONENTS = [
  RhythmSlide,
  CommitsSlide,
  DNASlide,
  FavoriteDaySlide,
  ZoneSlide, 
  ImpactSlide, 
  PaletteSlide, 
  TopProjectsSlide, 
  TopProjectSlide,
  SummaryCardSlide
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WrappedData | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    // Easter egg check
    if (username.trim() === 'akshit-MMQH') {
      setAppState(AppState.EASTER_EGG);
      return;
    }

    setAppState(AppState.LOADING);
    setError(null);

    try {
      // 1. Fetch Raw Data
      const { user, repos, events, contributions, year } = await fetchGithubData(username);
      
      // 2. Process Stats locally
      const stats = processStats(repos, events, contributions, year);
      
      // 3. Get AI Insights
      const topRepo = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
      const insights = await generateGeminiInsights(user, stats, topRepo ? topRepo.name : "None");

      setData({ user, repos, stats, insights });
      setAppState(AppState.PLAYING);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load profile. Please check the username.");
      setAppState(AppState.INPUT);
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < SLIDE_COMPONENTS.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (appState === AppState.PLAYING) {
        if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
          e.preventDefault();
          prevSlide();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [appState, currentSlideIndex]);

  // --- Render Views ---

  if (appState === AppState.EASTER_EGG) {
    const easterEggData: WrappedData = {
      user: { login: 'akshit-MMQH', avatar_url: 'https://github.com/akshit-MMQH.png', followers: 0 },
      repos: [],
      stats: { totalCommits: 0, totalPRs: 0, totalIssues: 0, activeDays: 0, longestStreak: 0, busiestDay: 'Monday', peakHour: 0, busiestTimeOfDay: 'Night', topLanguages: [], contributionGrid: [], year: new Date().getFullYear() },
      insights: { archetype: 'The Procrastinator', archetypeDescription: 'Focus on DSA instead!', motivationalMessage: 'DSA karle bhai' }
    };
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
        <div className="relative w-full max-w-[420px] md:max-w-[480px] aspect-[1.586/1] z-10">
          <motion.div 
            className="w-full h-full rounded-[20px] relative"
            initial={{ rotateX: 90, y: 100, opacity: 0 }}
            animate={{ rotateX: 0, y: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 1.5, bounce: 0.3 }}
          >
            <div className="absolute inset-0 rounded-[20px] overflow-hidden border border-white/10 bg-[#1a1a1a]">
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#2b2b2b] to-[#0f0f0f]"></div>
              <div className="absolute inset-0 z-[1] opacity-30 mix-blend-overlay" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0, transparent 1px, #000 1px, #000 2px), repeating-linear-gradient(0deg, transparent 0, transparent 2px, #fff 2px, #fff 3px)" }}></div>
              <div className="absolute inset-0 z-10 p-6 md:p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 text-white/90">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    </div>
                    <div className="font-bold italic text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">GITWRAP</div>
                  </div>
                  <div className="text-[10px] font-mono text-white/50 border border-white/10 px-2 py-1 rounded bg-black/20">{new Date().getFullYear()}</div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-start">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-white/80"><path d="M12 2v20M2 12h20M6.34 6.34l11.32 11.32M17.66 6.34L6.34 17.66" /><path d="M12 6l-2-2M12 6l2-2M12 18l-2 2M12 18l2 2M6 12l-2-2M6 12l-2 2M18 12l2-2M18 12l2 2" /><path d="M8.5 8.5l-1-1M8.5 8.5l1-1M15.5 15.5l-1 1M15.5 15.5l1 1M15.5 8.5l1-1M15.5 8.5l-1-1M8.5 15.5l-1 1M8.5 15.5l1 1" /></svg>
                  </div>
                </div>
                <div className="flex justify-between font-mono text-lg md:text-2xl tracking-[0.18em] text-white/90 mt-4"><span>0000</span><span>0000</span><span>0000</span><span>{new Date().getFullYear()}</span></div>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex flex-col">
                    <span className="text-[6px] text-neutral-400 uppercase tracking-widest mb-1 ml-0.5">Cardholder</span>
                    <span className="font-mono text-sm md:text-base text-white/80 uppercase tracking-wider">akshit-MMQH</span>
                  </div>
                  <div className="relative w-12 h-12 rounded-full border border-white/20 overflow-hidden bg-black"><img src="https://github.com/akshit-MMQH.png" className="w-full h-full object-cover opacity-80 grayscale mix-blend-luminosity" alt="User" /></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className="text-6xl md:text-8xl font-serif text-white tracking-wider mt-8 z-20"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          DSA karle
        </motion.h1>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={() => { setAppState(AppState.INPUT); setUsername(''); }}
          className="fixed bottom-8 right-8 px-6 py-3 bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-wide rounded-full hover:bg-white/20 transition-all border border-white/20"
        >
          ↻ Return
        </motion.button>
      </div>
    );
  }

  if (appState === AppState.INPUT) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
         <div className="absolute inset-0 z-0 bg-[url('https://i.pinimg.com/1200x/f7/ca/e3/f7cae3583c74c8e8466ce2b8be08263c.jpg')] bg-cover bg-center"></div>

         <div className="z-10 w-full max-w-xl flex flex-col items-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-2 font-poppins">
              GitWrap
            </h1>
            <p className="text-gray-300 text-lg font-beth">
              Discover your coding journey this year
            </p>
          </motion.div>

          <form onSubmit={handleStart} className="w-full flex flex-col gap-6">
            <input
              type="text"
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/30 backdrop-blur-sm border border-white/20 text-white px-6 py-4 text-base rounded-2xl focus:outline-none focus:border-white/40 transition-colors placeholder-gray-400"
            />
            
            <button
              type="submit"
              className="bg-white/10 backdrop-blur-md text-white font-bold text-lg py-4 px-8 rounded-full transition-all hover:bg-white/20 border border-white/20 shadow-lg relative overflow-hidden"
              style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')", backgroundBlendMode: 'overlay' }}
            >
              Create My Wrap
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-8 text-center">
            View your GitHub stats, top languages, and contribution<br/>highlights
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="mt-6 text-red-300 text-sm border border-red-400/30 p-4 bg-red-900/30 backdrop-blur-sm rounded-xl"
            >
              {error}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  if (appState === AppState.LOADING) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
         <div className="flex flex-col items-center gap-3" aria-busy="true" aria-live="polite">
           <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
           <span className="text-xs text-neutral-400 font-poppins">Loading…</span>
         </div>
      </div>
    );
  }

  // --- Slider View ---
  if (appState === AppState.PLAYING && data) {
    const CurrentSlide = SLIDE_COMPONENTS[currentSlideIndex];
    const isLast = currentSlideIndex === SLIDE_COMPONENTS.length - 1;

    return (
      <div className="fixed inset-0 relative text-white font-sans overflow-hidden bg-background">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full z-50 flex gap-0.5 p-4">
           {SLIDE_COMPONENTS.map((_, idx) => (
             <div key={idx} className="h-0.5 flex-1 bg-neutral-900 overflow-hidden">
                <motion.div 
                  className="h-full bg-white"
                  initial={{ width: idx < currentSlideIndex ? '100%' : '0%' }}
                  animate={{ width: idx <= currentSlideIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
             </div>
           ))}
        </div>

        {/* Final Slide Restart Button (always visible when last) */}
        {isLast && null}

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlideIndex} 
            className="w-full h-full relative z-10"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
             <CurrentSlide 
               data={data} 
               onNext={nextSlide}
               onPrev={currentSlideIndex > 0 ? prevSlide : undefined}
               active={true} 
               onRestart={isLast ? () => {
                 setAppState(AppState.INPUT);
                 setCurrentSlideIndex(0);
                 setUsername('');
                 setData(null);
               } : undefined}
             />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

export default App;