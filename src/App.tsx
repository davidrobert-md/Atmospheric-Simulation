import { useState, useEffect, useRef } from 'react';
import { 
  Snowflake, 
  Wind, 
  HelpCircle, 
  ShieldAlert, 
  RefreshCw, 
  Activity, 
  Clock, 
  Compass
} from 'lucide-react';

interface Particle {
  id: number;
  type: 'snowflake' | 'balloon';
  left: number; // percentage (0 - 100)
  size: number; // font size or scale
  duration: number; // animation duration in seconds
  delay: number; // start delay in seconds
  symbol?: string; // for snowflakes
  color?: string; // hex color for balloons
  driftX?: number; // drift offset in pixels for float-up animation
}

export default function App() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationType, setSimulationType] = useState<'snowflakes' | 'balloons' | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Decorative metric that fluctuates subtly
  const [stabilityMetric, setStabilityMetric] = useState(98.4);
  const stabilityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fluctuating stability percentage effect
  useEffect(() => {
    stabilityIntervalRef.current = setInterval(() => {
      setStabilityMetric((prev) => {
        const change = (Math.random() - 0.5) * 0.2;
        const next = prev + change;
        return parseFloat(Math.max(97.8, Math.min(99.2, next)).toFixed(1));
      });
    }, 1500);

    return () => {
      if (stabilityIntervalRef.current) clearInterval(stabilityIntervalRef.current);
    };
  }, []);

  // Precise millisecond countdown timer using requestAnimationFrame
  useEffect(() => {
    if (!simulationActive) {
      setTimeLeft(0);
      return;
    }

    const startTime = performance.now();
    const duration = 5000; // 5 seconds
    let frameId: number;

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / 1000);
      setTimeLeft(remaining);

      if (elapsed < duration) {
        frameId = requestAnimationFrame(tick);
      } else {
        setSimulationActive(false);
        setSimulationType(null);
        setParticles([]);
      }
    };

    frameId = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [simulationActive]);

  // Triggers the respective simulation
  const handleTriggerSimulation = (type: 'snowflakes' | 'balloons') => {
    // Clear any existing particles
    setParticles([]);
    
    // Set immediate status
    setSimulationType(type);
    setSimulationActive(true);

    const generatedParticles: Particle[] = [];
    const count = type === 'snowflakes' ? 45 : 30;

    if (type === 'snowflakes') {
      const snowflakeSymbols = ['❄', '❅', '❆', '✳'];
      for (let i = 0; i < count; i++) {
        generatedParticles.push({
          id: Math.random() + i,
          type: 'snowflakes',
          // Snowflakes occupy full width, with safe margins
          left: Math.random() * 98 + 1,
          // Medium size snowflakes: 14px to 26px
          size: Math.floor(Math.random() * 13) + 14,
          // Staggered duration of falls: 2.2s to 4.2s
          duration: parseFloat((2.2 + Math.random() * 2.0).toFixed(2)),
          // Staggered start delay across the 5 seconds interval: 0s to 1.8s
          delay: parseFloat((Math.random() * 1.8).toFixed(2)),
          symbol: snowflakeSymbols[Math.floor(Math.random() * snowflakeSymbols.length)]
        });
      }
    } else {
      // Exquisite colors coordinating with a formal slate dashboard
      const balloonColors = [
        '#F43F5E', // Rose 500
        '#38BDF8', // Sky 400
        '#FBBF24', // Amber 400
        '#34D399', // Emerald 400
        '#A78BFA', // Violet 400
        '#ED64A6', // Pink 500
      ];

      for (let i = 0; i < count; i++) {
        generatedParticles.push({
          id: Math.random() + i,
          type: 'balloons',
          // Balloon horizontal distribution
          left: Math.random() * 90 + 5,
          // Medium size balloons styled via width/height scale
          // Standard width ranges from 24px to 34px
          size: Math.floor(Math.random() * 11) + 24,
          // Rise duration: 2.8s to 4.5s
          duration: parseFloat((2.8 + Math.random() * 1.7).toFixed(2)),
          // Delay start up to 1.5 seconds to distribute floating
          delay: parseFloat((Math.random() * 1.5).toFixed(2)),
          color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
          // Sways to left/right during ascent
          driftX: Math.floor(Math.random() * 81) - 40 // -40px to +40px
        });
      }
    }

    setParticles(generatedParticles);
  };

  return (
    <div id="simulation-app" className="min-h-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden flex flex-col relative selection:bg-blue-500/30">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-blue-900/10 via-transparent to-transparent pointer-events-none z-0" />

      {/* Navigation Header */}
      <nav id="nav-header" className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xs font-bold text-white tracking-wider">AM</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-200">AERO_MODULE</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#3B82F6] -mt-0.5">Fluidics Lab v4.1</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-6 text-[11px] font-mono text-slate-500 tracking-wider">
          <span className="flex items-center space-x-1.5 font-medium transition-colors duration-300">
            <span className={`inline-block w-2 h-2 rounded-full ${simulationActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
            <span className={simulationActive ? 'text-blue-400' : 'text-slate-500'}>
              {simulationActive ? 'SIMULATION_ACTIVE' : 'SYSTEM_STANDBY'}
            </span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="uppercase">Env: Normal</span>
          <span className="text-slate-700">|</span>
          <span>SYS_DEV_8195</span>
        </div>
      </nav>

      {/* Main Body */}
      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 md:py-16 flex flex-col items-center justify-between z-20 relative">
        
        {/* Title Block */}
        <div className="text-center space-y-4 max-w-2xl mt-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-[10px] font-mono text-blue-400 uppercase tracking-widest leading-none">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Atmospheric Research Division</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white leading-tight">
            Atmospheric Simulation <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">Interface</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed font-light">
            Select a particle interaction below to initialize the localized environment simulation. 
            All visual effects calculate fluid physics dynamically and persist for a precise duration of 5.0 seconds.
          </p>
        </div>

        {/* Buttons Grid */}
        <div id="interactive-triggers" className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl my-10 relative">
          
          {/* Snowflakes Button */}
          <button 
            id="trigger-snowflakes"
            onClick={() => handleTriggerSimulation('snowflakes')}
            className={`btn-sleek p-6 rounded-xl flex flex-col items-center text-center space-y-4 group cursor-pointer ${
              simulationType === 'snowflakes' 
                ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500/30' 
                : 'bg-slate-800/20 border-slate-800'
            }`}
          >
            <div className={`p-4 rounded-full transition-all duration-300 ${
              simulationType === 'snowflakes' 
                ? 'bg-blue-500/20 text-blue-400 scale-110 shadow-lg shadow-blue-500/10' 
                : 'bg-slate-800/80 text-blue-400 group-hover:scale-105 group-hover:bg-slate-800'
            }`}>
              <Snowflake className={`w-8 h-8 ${simulationType === 'snowflakes' ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            </div>
            
            <div className="space-y-1.5">
              <span className="block text-sm font-semibold tracking-widest uppercase transition-colors group-hover:text-blue-400">
                Snowflakes
              </span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                Top-Down Precipitation
              </span>
            </div>
            
            <div className="h-1 w-12 rounded-full bg-slate-800 overflow-hidden">
              <div className={`h-full bg-blue-500 transition-all ${
                simulationType === 'snowflakes' ? 'w-full duration-1000' : 'w-0 duration-300'
              }`} />
            </div>
          </button>

          {/* Balloons Button */}
          <button 
            id="trigger-balloons"
            onClick={() => handleTriggerSimulation('balloons')}
            className={`btn-sleek p-6 rounded-xl flex flex-col items-center text-center space-y-4 group cursor-pointer ${
              simulationType === 'balloons' 
                ? 'bg-pink-500/10 border-pink-500 ring-1 ring-pink-500/30' 
                : 'bg-slate-800/20 border-slate-800'
            }`}
          >
            <div className={`p-4 rounded-full transition-all duration-300 ${
              simulationType === 'balloons' 
                ? 'bg-pink-500/20 text-pink-400 scale-110 shadow-lg shadow-pink-500/10' 
                : 'bg-slate-800/80 text-pink-400 group-hover:scale-105 group-hover:bg-slate-800'
            }`}>
              <Compass className="w-8 h-8 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            
            <div className="space-y-1.5">
              <span className="block text-sm font-semibold tracking-widest uppercase transition-colors group-hover:text-pink-400">
                Balloons
              </span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                Bottom-Up Suspension
              </span>
            </div>

            <div className="h-1 w-12 rounded-full bg-slate-800 overflow-hidden">
              <div className={`h-full bg-pink-500 transition-all ${
                simulationType === 'balloons' ? 'w-full duration-1000' : 'w-0 duration-300'
              }`} />
            </div>
          </button>
        </div>

        {/* Real-time Telemetry Metrics Grid */}
        <div id="metrics-panel" className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mt-4">
          
          {/* Stability Card */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-800 flex flex-col justify-between transition-colors duration-300 group">
            <div className="flex items-center justify-between text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2 font-mono">
              <span>Terminal Status</span>
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400/60 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="text-3xl font-mono text-white leading-none font-semibold">
              {stabilityMetric}%
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mt-2">
              Stability Index
            </div>
          </div>

          {/* Active Timer Card */}
          <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all duration-500 group ${
            simulationActive 
              ? 'bg-slate-900/40 border-blue-500/20 shadow-inner' 
              : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2 font-mono">
              <span>Active Threads</span>
              <Clock className={`w-3.5 h-3.5 ${simulationActive ? 'text-blue-400 animate-spin' : 'text-blue-400/60'} transition-colors`} />
            </div>
            <div className="text-3xl font-mono text-white leading-none font-semibold">
              {simulationActive ? `${timeLeft.toFixed(2)}s` : '00:00:00'}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mt-2 flex justify-between">
              <span>Time Interval (5s)</span>
              {simulationActive && <span className="text-blue-400 text-[9px] animate-pulse">SOLVED</span>}
            </div>
          </div>

          {/* Load Metric Card */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-800 flex flex-col justify-between transition-colors duration-300 group">
            <div className="flex items-center justify-between text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2 font-mono">
              <span>Active Load</span>
              <Wind className="w-3.5 h-3.5 text-blue-400/60 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="text-3xl font-mono text-white leading-none font-semibold uppercase">
              {simulationActive ? `${particles.length} pt` : 'STANDBY'}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mt-2">
              Atmospheric Load
            </div>
          </div>
        </div>

      </main>

      {/* Particle Canvas Layer */}
      <div 
        id="particle-layer-container" 
        className="absolute inset-0 overflow-hidden pointer-events-none z-10"
      >
        {particles.map((p) => {
          if (simulationType === 'snowflakes') {
            return (
              <div
                key={p.id}
                className="absolute text-slate-200/90 pointer-events-none select-none animate-fall"
                style={{
                  left: `${p.left}%`,
                  fontSize: `${p.size}px`,
                  top: '-40px',
                  '--duration': `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties}
              >
                {p.symbol}
              </div>
            );
          } else {
            // Balloons
            return (
              <div
                key={p.id}
                className="absolute pointer-events-none select-none animate-float-up"
                style={{
                  left: `${p.left}%`,
                  top: '102vh',
                  '--duration': `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                  '--drift-x': `${p.driftX}px`,
                  zIndex: 12,
                } as React.CSSProperties}
              >
                {/* Balloon Body */}
                <div
                  className="relative rounded-full shadow-lg"
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size * 1.3}px`,
                    backgroundColor: p.color,
                    boxShadow: 'inset -3px -4px 10px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Highlight sheen for extra realism */}
                  <div 
                    className="absolute top-2 left-2 rounded-full bg-white/20"
                    style={{
                      width: `${p.size * 0.25}px`,
                      height: `${p.size * 0.4}px`,
                      transform: 'rotate(-15deg)',
                    }}
                  />
                  
                  {/* Balloon String Node */}
                  <div 
                    className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent"
                    style={{ borderBottom: `4px solid ${p.color}` }}
                  />

                  {/* Balloon String */}
                  <div 
                    className="absolute bottom-[-22px] left-1/2 -translate-x-1/2 w-[1px] h-[20px] bg-slate-400/40"
                  />
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Footer Branding Area */}
      <footer id="footer-credits" className="py-6 px-6 text-[10px] text-slate-600 uppercase tracking-[0.25em] text-center bg-slate-950/40 border-t border-slate-900/60 z-20">
        &copy; 2026 Aero-Module Design Systems // Atmospheric Research Division
      </footer>

    </div>
  );
}
