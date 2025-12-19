import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, Cell, PieChart, Pie, Tooltip as RechartsTooltip } from 'recharts';
import { SlideProps } from '../types';
import { toPng } from 'html-to-image';

// --- Assets & Icons ---
const GitHubLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const SnowflakeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-white/80">
        <path d="M12 2v20M2 12h20M6.34 6.34l11.32 11.32M17.66 6.34L6.34 17.66" />
        <path d="M12 6l-2-2M12 6l2-2M12 18l-2 2M12 18l2 2M6 12l-2-2M6 12l-2 2M18 12l2-2M18 12l2 2" />
        <path d="M8.5 8.5l-1-1M8.5 8.5l1-1M15.5 15.5l-1 1M15.5 15.5l1 1M15.5 8.5l1-1M15.5 8.5l-1-1M8.5 15.5l-1 1M8.5 15.5l1 1" />
    </svg>
);

// --- Shared Layout ---
const SlideLayout: React.FC<{ 
  title: string; 
  subtitle?: string; 
  children: React.ReactNode; 
  onNext: () => void;
  onPrev?: () => void;
  align?: 'center' | 'left';
  bgClass?: string;
}> = ({ title, subtitle, children, onNext, onPrev, align = 'center', bgClass = 'bg-black' }) => (
  <div 
    className={`relative h-screen w-full flex flex-col p-4 md:p-6 ${bgClass} overflow-hidden select-none`}
  >
    {/* Background Noise */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    
    {/* Header */}
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative z-10 mb-4 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      <h2 className="text-2xl md:text-4xl font-black text-white mb-1 tracking-tighter uppercase">{title}</h2>
      {subtitle && <p className="text-xs md:text-sm font-mono text-neutral-400 tracking-tight">{subtitle}</p>}
    </motion.div>

    {/* Content */}
    <div className="flex-1 flex items-center justify-center w-full min-h-0 relative z-10 cursor-pointer" onClick={onNext}>
      {children}
    </div>

    {/* Navigation */}
    <div className="relative z-10 flex justify-between items-center mt-2">
      {onPrev ? (
        <button 
          onClick={onPrev}
          className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 hover:text-white transition-colors px-4 py-2"
        >
          ← Previous
        </button>
      ) : <div />}
    </div>
  </div>
);

// --- 1. Rhythm ---
export const RhythmSlide: React.FC<SlideProps> = ({ data, onNext, onPrev }) => {
  return (
    <SlideLayout title="The Pulse" subtitle={`${data.stats.year} • Frequency Analysis`} onNext={onNext} onPrev={onPrev}>
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative group"
        >
          {/* Glowing orb behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-colors"></div>
          <div className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2 relative z-10">{data.stats.activeDays}</div>
          <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Active Days</div>
        </motion.div>
        
        <div className="h-px w-24 bg-neutral-800 md:hidden"></div>
        <div className="w-px h-24 bg-neutral-800 hidden md:block"></div>

        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="text-center relative group"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-colors"></div>
          <div className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2 relative z-10">{data.stats.longestStreak}</div>
          <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Day Streak</div>
        </motion.div>
      </div>
    </SlideLayout>
  );
};

// --- 2. Every Commit Counts ---
export const CommitsSlide: React.FC<SlideProps> = ({ data, onNext, onPrev }) => {
  const recentContributions = data.stats.contributionGrid.slice(-84); // 12 weeks

  return (
    <SlideLayout title="Velocity" subtitle="Contribution Density" onNext={onNext} onPrev={onPrev}>
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
        >
            <span className="text-6xl md:text-8xl leading-none font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-600 tracking-tighter">
            {data.stats.totalCommits}
            </span>
            <span className="block text-sm font-mono text-neutral-500 mt-2 uppercase tracking-widest">Total Contributions</span>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-[3px] md:gap-[4px]"
        >
          {recentContributions.map((day, i) => {
            const intensity = 
              day.level === 0 ? 'bg-neutral-900/50' :
              day.level === 1 ? 'bg-neutral-800' :
              day.level === 2 ? 'bg-neutral-600' :
              day.level === 3 ? 'bg-neutral-400' :
              'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]';
              
            return (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.005 * i + 0.5 }}
                    key={day.date + i} 
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${intensity}`} 
                />
            );
          })}
        </motion.div>
      </div>
    </SlideLayout>
  );
};

// --- 3. The DNA ---
export const DNASlide: React.FC<SlideProps> = ({ data, onNext, onPrev }) => {
  const chartData = [
    { name: 'Commits', value: data.stats.totalCommits, fill: '#ffffff' },
    { name: 'PRs', value: data.stats.totalPRs, fill: '#737373' },
    { name: 'Issues', value: data.stats.totalIssues, fill: '#333333' },
  ].filter(d => d.value > 0);

  return (
    <SlideLayout title="Composition" subtitle="Activity Breakdown" onNext={onNext} onPrev={onPrev}>
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="relative w-48 h-48 md:w-64 md:h-64">
            {/* Spinning ring decorative */}
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
             className="absolute inset-[-20px] rounded-full border border-neutral-800 border-dashed opacity-50"
           />
           
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                innerRadius="60%" 
                outerRadius="90%" 
                paddingAngle={5} 
                dataKey="value" 
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter">
                {Math.round((data.stats.totalCommits / (data.stats.totalCommits + data.stats.totalPRs + data.stats.totalIssues || 1)) * 100)}%
            </span>
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1">Code Focus</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 md:gap-8 w-full max-w-lg">
          {chartData.map((item, idx) => (
            <motion.div 
                key={item.name} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex flex-col items-center text-center p-2 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm"
            >
              <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: item.fill }} />
              <span className="text-lg font-bold text-white mb-1">{item.value}</span>
              <span className="text-[9px] text-neutral-500 uppercase tracking-wider">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
};

// --- 4. Favorite Day ---
export const FavoriteDaySlide: React.FC<SlideProps> = ({ data, onNext, onPrev }) => {
  return (
    <SlideLayout title="Prime Time" subtitle="Consistency analysis." onNext={onNext} onPrev={onPrev}>
       <div className="flex flex-col items-center gap-3">
         <div className="text-5xl md:text-7xl font-bold text-white">
           {data.stats.busiestDay.toUpperCase()}
         </div>
         <p className="text-neutral-400 text-sm">Most Active Day</p>
       </div>
    </SlideLayout>
  );
};

// --- 5. The Zone ---
export const ZoneSlide: React.FC<SlideProps> = ({ data, onNext, onPrev }) => {
  return (
    <SlideLayout title="Temporal Zone" subtitle="Habitual Analysis" onNext={onNext} onPrev={onPrev}>
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
        <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 bg-neutral-900/50 border border-white/10 p-6 flex flex-col justify-between rounded-xl backdrop-blur-md"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Peak Productivity</h3>
            </div>
            <div className="text-4xl md:text-6xl font-mono font-light text-white tracking-tighter">
                {String(data.stats.peakHour).padStart(2, '0')}<span className="text-neutral-600">:00</span>
            </div>
          </div>
          <div className="text-base md:text-xl text-neutral-400 font-light border-l-2 border-white/20 pl-4 mt-3">
            {data.stats.busiestTimeOfDay}
          </div>
        </motion.div>

        <motion.div 
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="flex-1 bg-white text-black p-6 flex flex-col justify-center rounded-xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-24 bg-neutral-200 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4 relative z-10">Developer Archetype</h3>
            <div className="text-2xl md:text-3xl font-black mb-3 tracking-tighter leading-none relative z-10">{data.insights?.archetype || "The Builder"}</div>
            <p className="text-xs md:text-sm leading-relaxed opacity-80 relative z-10 font-medium">
                {data.insights?.archetypeDescription}
            </p>
        </motion.div>
      </div>
    </SlideLayout>
  );
};

// --- 7. The Impact ---
export const ImpactSlide: React.FC<SlideProps> = ({ data, onNext, onPrev }) => {
  const totalStars = data.repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);

  return (
    <SlideLayout title="Impact" subtitle="The ripple effect." onNext={onNext} onPrev={onPrev}>
       <div className="flex flex-col items-center gap-6">
         <div className="flex gap-8 md:gap-12">
           <div className="text-center">
             <span className="text-3xl md:text-4xl font-light text-white block mb-2">{totalStars}</span>
             <span className="text-xs text-neutral-500">Total Stars</span>
           </div>
           <div className="text-center">
             <span className="text-3xl md:text-4xl font-light text-white block mb-2">{data.user.followers}</span>
             <span className="text-xs text-neutral-500">Followers</span>
           </div>
         </div>
         <div className="text-sm md:text-base text-center max-w-xl text-white/80 italic">
           "{data.insights?.motivationalMessage}"
         </div>
       </div>
    </SlideLayout>
  );
};

// --- 8. The Palette ---
export const PaletteSlide: React.FC<SlideProps> = ({ data, onNext, onPrev }) => {
  return (
    <SlideLayout title="Syntax Palette" subtitle="Language Frequency" onNext={onNext} onPrev={onPrev}>
      <div className="w-full max-w-xl space-y-4">
        {data.stats.topLanguages.map((lang, idx) => (
          <motion.div 
            key={lang.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15 }}
            className="group"
          >
            <div className="flex justify-between items-end mb-2">
              <span className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-neutral-300 transition-colors">{lang.name}</span>
              <span className="text-sm font-mono text-neutral-500">{lang.percentage}%</span>
            </div>
            <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${lang.percentage}%` }}
                transition={{ duration: 1, delay: 0.5 + idx * 0.15, ease: "circOut" }}
                className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
              />
            </div>
          </motion.div>
        ))}
      </div>
    </SlideLayout>
  );
};

// --- 9. Top 5 Projects ---
export const TopProjectsSlide: React.FC<SlideProps> = ({ data, onNext, onPrev }) => {
  const topProjects = [...data.repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  return (
    <SlideLayout title="Top Shelf" subtitle="Highest engaged repositories." onNext={onNext} onPrev={onPrev}>
      <div className="w-full max-w-2xl space-y-2">
        {topProjects.map((repo, i) => (
          <div key={repo.name} className="flex items-center justify-between p-3 md:p-4 bg-neutral-900">
            <div className="flex items-center gap-3">
              <div className="text-neutral-600 text-xs">0{i + 1}</div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white">{repo.name}</h3>
                {repo.language && <span className="text-[8px] text-neutral-500">{repo.language}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm">{repo.stargazers_count}</span>
              <span className="text-neutral-600">★</span>
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
};

// --- 10. The One Project ---
export const TopProjectSlide: React.FC<SlideProps> = ({ data, onNext, onPrev }) => {
  const topProject = [...data.repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
  if (!topProject) return <SlideLayout title="404" onNext={onNext} onPrev={onPrev}><div>No Projects Found</div></SlideLayout>;

  return (
    <SlideLayout title="Magnum Opus" subtitle="Crown Jewel Repository" onNext={onNext} onPrev={onPrev}>
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-6 md:p-8 shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 blur-[60px] rounded-full pointer-events-none"></div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 bg-white text-black text-[9px] font-bold px-2 py-1 uppercase tracking-widest mb-4"
        >
            Most Starred
        </motion.div>
        
        <motion.h2 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="z-10 text-2xl md:text-4xl font-black mb-4 text-white tracking-tighter"
        >
            {topProject.name}
        </motion.h2>
        
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="z-10 text-sm md:text-base text-neutral-400 mb-6 max-w-lg font-light"
        >
            {topProject.description || "A masterpiece of code."}
        </motion.p>
        
        <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.6 }}
             className="z-10 flex gap-8 md:gap-12 border-t border-white/10 pt-4"
        >
          <div className="text-center">
            <span className="text-xl md:text-2xl font-mono text-white block mb-1">{topProject.stargazers_count}</span>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Stars</span>
          </div>
          <div className="text-center">
            <span className="text-xl md:text-2xl font-mono text-white block mb-1">{topProject.forks_count}</span>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Forks</span>
          </div>
           <div className="text-center">
            <span className="text-xl md:text-2xl font-mono text-white block mb-1">{topProject.language || 'N/A'}</span>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Core</span>
          </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
};

// --- FINAL SLIDE: The Titanium Card ---
export const SummaryCardSlide: React.FC<SlideProps> = ({ data, onRestart }) => {
    // Card formatting
    const block1 = String(data.stats.totalCommits).padStart(4, '0');
    const block2 = String(data.repos.reduce((a, b) => a + b.stargazers_count, 0)).padStart(4, '0');
    const block3 = String(data.stats.longestStreak).padStart(4, '0');
    const block4 = String(data.stats.year);
    const isAkshit = data.user.login === 'akshit-MMQH';

    // Mouse tilt logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [15, -15]); // Inverted for correct tilt
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);
    
    // Spring physics for smooth return
    const springConfig = { damping: 25, stiffness: 150 };
    const springRotateX = useSpring(rotateX, springConfig);
    const springRotateY = useSpring(rotateY, springConfig);

    // Dynamic sheen position (moves opposite to tilt)
    const sheenX = useTransform(x, [-100, 100], [100, 0]);
    const sheenY = useTransform(y, [-100, 100], [100, 0]);
    
    
    const cardRef = useRef<HTMLDivElement>(null);
    const [bgColor, setBgColor] = useState('#050505');

    const colors = ['#050505', '#1a1a2e', '#2d1b69', '#0f3460', '#16213e', '#1f1f1f', '#2c003e', '#1a0033'];
    
    const handleColorSelect = (color: string) => {
        setBgColor(color);
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        
        // Temporarily reset tilt for clean capture
        const currentX = x.get();
        const currentY = y.get();
        x.set(0);
        y.set(0);

        // Wait for frame to update
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                cacheBust: true,
            });
            
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `gitwrap-${data.stats.year}-summary.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading slide:", error);
        } finally {
            // Restore tilt
            x.set(currentX);
            y.set(currentY);
        }
    };

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = (mouseX / width - 0.5) * 200; // -100 to 100
        const yPct = (mouseY / height - 10.5) * 200;
        x.set(xPct);
        y.set(yPct);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden font-inter select-none" style={{ backgroundColor: bgColor }}>
        
        {/* Environment Lighting */}
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/[0.05] blur-[100px] rounded-full pointer-events-none"></div>
        </>

        {/* 3D Stage */}
        <div 
            ref={cardRef}
            className="relative w-full max-w-[420px] md:max-w-[480px] aspect-[1.586/1] perspective-1000 z-10"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1200 }}
        >
          <motion.div 
            className="w-full h-full rounded-[20px] relative preserve-3d"
            initial={{ rotateX: 90, y: 100, opacity: 0 }}
            animate={{ rotateX: 0, y: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 1.5, bounce: 0.3 }}
            style={{ 
              rotateX: springRotateX,
              rotateY: springRotateY,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* --- CARD FACE --- */}
            <div className="absolute inset-0 rounded-[20px] overflow-hidden backface-hidden border border-white/10 bg-[#1a1a1a]">
                
                {/* 1. Base Material (Brushed Metal) */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#2b2b2b] to-[#0f0f0f]"></div>
                {/* Brushed Texture */}
                <div 
                    className="absolute inset-0 z-[1] opacity-30 mix-blend-overlay" 
                    style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0, transparent 1px, #000 1px, #000 2px), repeating-linear-gradient(0deg, transparent 0, transparent 2px, #fff 2px, #fff 3px)" }}
                ></div>
                {/* Noise */}
                <div className="absolute inset-0 z-[2] opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                {/* 2. Dynamic Sheen/Lighting */}
                <motion.div 
                    className="absolute inset-0 z-[3] mix-blend-soft-light pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)',
                        translateX: sheenX,
                        translateY: sheenY,
                        scale: 1.5,
                        opacity: 0.7
                    }}
                />

                {/* 3. Content Layer */}
                <div className="absolute inset-0 z-10 p-6 md:p-8 flex flex-col justify-between" style={{ transform: 'translateZ(2px)' }}>
                    
                    {/* Top Row */}
                    <div className="flex justify-between items-start">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 text-white/90">
                                <GitHubLogo />
                             </div>
                             <div className="font-bold italic text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 drop-shadow-sm">
                                GITWRAP <span className="text-xs align-top font-normal text-neutral-400"></span>
                             </div>
                        </div>
                        <div className="text-[10px] font-mono text-white/50 border border-white/10 px-2 py-1 rounded bg-black/20 backdrop-blur-md shadow-inner flex items-center justify-center">
                            {data.stats.year}
                        </div>
                    </div>

                    {/* Chip & Contactless */}
                    <div className="flex items-center justify-between mt-2">
                         <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-start">
                            <SnowflakeIcon />
                         </div>
                         <div className="text-white/30">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 4c4.41 0 8 3.59 8 8h-2c0-3.31-2.69-6-6-6V4zm0 3c2.76 0 5 2.24 5 5h-2c0-1.66-1.34-3-3-3V7z" opacity="0.8"/></svg>
                         </div>
                    </div>

                    {/* Card Numbers (Embossed Effect) */}
                    <div className="flex justify-between font-mono text-lg md:text-2xl tracking-[0.18em] text-white/90 mt-4 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)] shadow-inner-text">
                         <span>{block1}</span>
                         <span>{block2}</span>
                         <span>{block3}</span>
                         <span>{block4}</span>
                    </div>
                    <div className="flex justify-between px-1 text-[6px] text-neutral-500 uppercase tracking-widest font-bold">
                        <span className="w-1/4">Commits</span>
                        <span className="w-1/4 text-center">Stars</span>
                        <span className="w-1/4 text-center">Streak</span>
                        <span className="w-1/4 text-right">Valid Thru</span>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex justify-between items-end mt-4">
                        <div className="flex flex-col">
                            <span className="text-[6px] text-neutral-400 uppercase tracking-widest mb-1 ml-0.5">Cardholder</span>
                            <span className="font-mono text-sm md:text-base text-white/80 uppercase tracking-wider drop-shadow-md truncate max-w-[150px]">{data.user.login}</span>
                            {isAkshit && (
                              <span className="text-xs text-neutral-300 italic mt-1">dsa karle</span>
                            )}
                        </div>
                        
                        {/* Avatar / Hologram */}
                        <div className="relative w-12 h-12 rounded-full border border-white/20 overflow-hidden shadow-inner bg-black">
                            <img src={data.user.avatar_url} className="w-full h-full object-cover opacity-80 grayscale mix-blend-luminosity" alt="User" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CARD THICKNESS (Fake 3D side) --- */}
            {/* We simulate thickness by adding pseudo-elements or extra divs translated in Z, but for this level of CSS 3D, a simple shadow usually suffices. However, let's add a subtle rim glow. */}
          </motion.div>

          {/* Floor Shadow */}
          <motion.div 
            className="absolute -bottom-12 left-4 right-4 h-8 bg-black/60 blur-xl rounded-[50%]"
            style={{ 
                scaleX: useTransform(springRotateY, [-15, 15], [0.9, 1.1]),
                opacity: useTransform(springRotateX, [15, -15], [0.4, 0.8])
            }}
          />
        </div>

        {/* Action Buttons */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="relative z-10 mt-8 flex gap-4"
        >
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-wide rounded-full transition-all hover:bg-white/20 border border-white/20 shadow-lg"
          >
            DOWNLOAD
          </button>
          <button
            onClick={() => (onRestart ? onRestart() : window.location.reload())}
            className="px-6 py-3 bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-wide rounded-full hover:bg-white/20 transition-all border border-white/20"
          >
            ↻
          </button>
        </motion.div>

        {/* Color Palette - Minimal Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="fixed bottom-6 right-6 z-40 flex gap-2 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-full border border-white/5"
        >
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={`w-6 h-6 rounded-full border transition-all ${
                bgColor === color 
                  ? 'border-white/60 scale-110' 
                  : 'border-white/10 hover:border-white/30 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Background color ${color}`}
            />
          ))}
        </motion.div>


      </div>
    );
};