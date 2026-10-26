import React, { useState } from 'react';
import { PR } from '../types';
import { Calculator, Dumbbell, Award, ArrowRight } from 'lucide-react';

interface CalculatorSectionProps {
  prs: PR[];
}

export const CalculatorSection: React.FC<CalculatorSectionProps> = ({ prs }) => {
  const [baseWeight, setBaseWeight] = useState<number>(100);
  const [selectedExercise, setSelectedExercise] = useState<string>('Personalizado');

  const barbellPRs = prs.filter((p) => p.unidad === 'kg' && (p.categoria === 'CrossFit' || p.categoria === 'Weightlifting'));

  const percentages = [
    { pct: 100, label: '100% 1RM (Máximo)', reps: '1 rep' },
    { pct: 95, label: '95% Muy Pesado', reps: '1-2 reps' },
    { pct: 90, label: '90% Fuerza Máxima', reps: '2-3 reps' },
    { pct: 85, label: '85% Fuerza / Potencia', reps: '3-4 reps' },
    { pct: 80, label: '80% Hipertrofia Pesada', reps: '5-6 reps' },
    { pct: 75, label: '75% Trabajo Técnico WOD', reps: '6-8 reps' },
    { pct: 70, label: '70% Resistencia de Fuerza', reps: '8-10 reps' },
    { pct: 65, label: '65% Ciclo de Barra Rápido', reps: '10-12 reps' },
    { pct: 60, label: '60% Velocidad / Potencia', reps: '12-15 reps' },
    { pct: 50, label: '50% Calentamiento / Descarga', reps: '15+ reps' },
  ];

  const handleSelectPR = (pr: PR) => {
    setBaseWeight(pr.valor);
    setSelectedExercise(`${pr.nombre_atleta} - ${pr.ejercicio} (${pr.valor} kg)`);
  };

  // Plate calculation for standard 20kg barbell
  const calculatePlatesPerSide = (targetWeight: number) => {
    const barWeight = 20;
    if (targetWeight <= barWeight) return [];
    let weightPerSide = (targetWeight - barWeight) / 2;
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const platesUsed: { plate: number; count: number }[] = [];

    for (const plate of availablePlates) {
      if (weightPerSide >= plate) {
        const count = Math.floor(weightPerSide / plate);
        platesUsed.push({ plate, count });
        weightPerSide -= count * plate;
      }
    }
    return platesUsed;
  };

  return (
    <section className="space-y-6">
      {/* Title */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 text-[#84B026] text-xs font-bold tracking-widest uppercase mb-1">
          <Calculator className="w-4 h-4" />
          <span>Herramienta de Rendimiento Atlético</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-heading">
          CALCULADORA DE PORCENTAJES 1RM
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Calculá los porcentajes de trabajo para los bloques de fuerza y WODs según tus marcas registradas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input and Quick selection from PRs */}
        <div className="bg-[#141417] p-5 rounded-2xl border border-zinc-800 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2 font-heading">
              1RM Base de Levantamiento (kg)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="10"
                max="400"
                step="2.5"
                value={baseWeight}
                onChange={(e) => {
                  setBaseWeight(Number(e.target.value) || 0);
                  setSelectedExercise('Personalizado');
                }}
                className="w-full bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] rounded-xl px-4 py-3 text-2xl font-black font-heading text-white outline-none"
              />
              <span className="text-lg font-black font-heading text-[#84B026]">KG</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Seleccionado: {selectedExercise}</p>
          </div>

          {/* Quick Select from Atletas' PRs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 font-heading flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#84B026]" />
              <span>Cargar desde PRs del Box:</span>
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {barbellPRs.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No hay PRs en kg registrados aún.</p>
              ) : (
                barbellPRs.map((pr) => (
                  <button
                    key={pr.id}
                    onClick={() => handleSelectPR(pr)}
                    className="w-full text-left bg-[#1A1A1E] hover:bg-[#84B026]/10 border border-zinc-800/80 hover:border-[#84B026]/40 p-2.5 rounded-lg text-xs text-zinc-300 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-white block">{pr.ejercicio}</span>
                      <span className="text-[10px] text-zinc-500">{pr.nombre_atleta}</span>
                    </div>
                    <span className="font-mono font-black text-sm text-[#84B026]">
                      {pr.valor} kg
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Plate Loader Breakdown for Current 1RM */}
          <div className="bg-[#1A1A1E] p-4 rounded-xl border border-zinc-800">
            <div className="text-xs font-bold uppercase tracking-wider text-[#84B026] font-heading mb-1.5 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" />
              <span>Discos por lado (Barra Olímpica 20kg):</span>
            </div>
            <div className="text-xs text-zinc-300">
              Para {baseWeight} kg totales:
              <div className="flex flex-wrap gap-1.5 mt-2">
                {calculatePlatesPerSide(baseWeight).length > 0 ? (
                  calculatePlatesPerSide(baseWeight).map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-zinc-800 px-2 py-1 rounded text-xs font-mono font-bold text-zinc-200 border border-zinc-700"
                    >
                      {item.count}x {item.plate}kg
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-500 italic">Sólo la barra de 20kg</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Percentages Table */}
        <div className="lg:col-span-2 bg-[#141417] p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <h3 className="text-sm font-black uppercase text-white font-heading">
              Tabla de Cargas (% de {baseWeight} kg)
            </h3>
            <span className="text-xs text-[#84B026] font-mono font-bold">1RM = {baseWeight} KG</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {percentages.map((p) => {
              const weight = Math.round((baseWeight * (p.pct / 100)) * 2) / 2; // round to 0.5kg
              const isHeavy = p.pct >= 85;

              return (
                <div
                  key={p.pct}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isHeavy
                      ? 'bg-[#18181B] border-[#84B026]/30 hover:border-[#84B026]'
                      : 'bg-[#18181B]/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-black font-heading ${isHeavy ? 'text-[#84B026]' : 'text-zinc-300'}`}>
                        {p.pct}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                        {p.reps}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{p.label}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black font-heading text-white font-mono">
                      {weight}
                    </span>
                    <span className="text-xs font-bold text-[#84B026] ml-1">KG</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
