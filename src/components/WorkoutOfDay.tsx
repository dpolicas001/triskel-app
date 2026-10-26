import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, Dumbbell, Zap, Volume2, Timer } from 'lucide-react';

export const WorkoutOfDay: React.FC = () => {
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'emom' | 'tabata'>('stopwatch');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#141417] border border-zinc-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#84B026]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Daily Briefing / WOD */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#84B026]/20 text-[#84B026]">
                <Flame className="w-4 h-4" />
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-[#84B026] font-heading">
                WOD DEL DÍA • TRISKEL HYBRID
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              PROGRAMACIÓN OFICIAL BOX
            </span>
          </div>

          <h3 className="text-xl font-black uppercase text-white font-heading">
            "HYBRID ENGINE CONQUEROR"
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Part A */}
            <div className="bg-[#18181B] p-3.5 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-zinc-300 font-bold font-heading uppercase mb-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-[#84B026]" />
                <span>PARTE A: FUERZA / TÉCNICA (15')</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Every 2:30 x 5 sets:<br />
                • 1 Squat Clean + 2 Front Squat + 1 Split Jerk<br />
                <span className="text-[#84B026] font-semibold">Carga:</span> Empezar en 70% y construir hasta marca del día.
              </p>
            </div>

            {/* Part B */}
            <div className="bg-[#18181B] p-3.5 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-zinc-300 font-bold font-heading uppercase mb-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>PARTE B: METCON HYROX (20' CAP)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                4 Rondas por tiempo:<br />
                • 500m SkiErg / Remo<br />
                • 25m Sled Push (120kg/80kg)<br />
                • 15 Wall Balls 9kg/6kg (unbroken)<br />
                • 10 Burpee Broad Jumps
              </p>
            </div>
          </div>
        </div>

        {/* Right col: Gym Clock / Timer */}
        <div className="bg-[#0D0D0D] p-5 rounded-xl border border-[#84B026]/40 flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between text-zinc-400 text-[11px] font-heading uppercase">
            <span className="flex items-center gap-1 text-[#84B026] font-bold">
              <Timer className="w-3.5 h-3.5" />
              Box Stopwatch
            </span>
            <span className="font-mono">{isRunning ? 'Running' : 'Ready'}</span>
          </div>

          {/* Big Digital Display */}
          <div className="my-4 font-heading font-black text-5xl tracking-widest text-[#84B026] font-mono drop-shadow-[0_0_12px_rgba(132,176,38,0.4)]">
            {formatTime(seconds)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-lg font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 text-black hover:bg-amber-400'
                  : 'bg-[#84B026] text-black hover:bg-[#96c82c] shadow-lg shadow-[#84B026]/20'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pausar' : 'Iniciar'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
