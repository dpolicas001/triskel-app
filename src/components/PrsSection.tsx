import React, { useState, useMemo } from 'react';
import { PR, CategoriaPR, UnidadPR } from '../types';
import { 
  Trophy, 
  PlusCircle, 
  Search, 
  Filter, 
  Trash2, 
  Flame, 
  Zap, 
  Dumbbell, 
  Timer, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Sparkles,
  TrendingUp,
  User
} from 'lucide-react';

interface PrsSectionProps {
  prs: PR[];
  loading: boolean;
  onCrearPR: (data: Omit<PR, 'id' | 'created_at'>) => Promise<void>;
  onEliminarPR: (id: string) => Promise<void>;
  onFilterByAtleta: (atleta: string) => Promise<void>;
}

// Benchmark presets for one-click selection
const PRESETS = [
  { nombre: 'Snatch', categoria: 'CrossFit' as CategoriaPR, unidad: 'kg' as UnidadPR, icon: 'barbell' },
  { nombre: 'Clean & Jerk', categoria: 'CrossFit' as CategoriaPR, unidad: 'kg' as UnidadPR, icon: 'barbell' },
  { nombre: 'Back Squat', categoria: 'CrossFit' as CategoriaPR, unidad: 'kg' as UnidadPR, icon: 'barbell' },
  { nombre: 'Deadlift', categoria: 'CrossFit' as CategoriaPR, unidad: 'kg' as UnidadPR, icon: 'barbell' },
  { nombre: 'Front Squat', categoria: 'CrossFit' as CategoriaPR, unidad: 'kg' as UnidadPR, icon: 'barbell' },
  { nombre: 'HYROX 1km Run', categoria: 'HYROX' as CategoriaPR, unidad: 'min' as UnidadPR, icon: 'timer' },
  { nombre: 'Sled Push (152kg)', categoria: 'HYROX' as CategoriaPR, unidad: 'seg' as UnidadPR, icon: 'flame' },
  { nombre: 'SkiErg 1000m', categoria: 'HYROX' as CategoriaPR, unidad: 'min' as UnidadPR, icon: 'timer' },
  { nombre: 'Wall Balls 100 reps', categoria: 'HYROX' as CategoriaPR, unidad: 'min' as UnidadPR, icon: 'zap' },
  { nombre: 'Burpee Broad Jumps', categoria: 'HYROX' as CategoriaPR, unidad: 'min' as UnidadPR, icon: 'zap' },
];

export const PrsSection: React.FC<PrsSectionProps> = ({
  prs,
  loading,
  onCrearPR,
  onEliminarPR,
  onFilterByAtleta,
}) => {
  // Form State
  const [nombreAtleta, setNombreAtleta] = useState('');
  const [ejercicio, setEjercicio] = useState('Snatch');
  const [categoria, setCategoria] = useState<CategoriaPR>('CrossFit');
  const [valor, setValor] = useState<string>('');
  const [unidad, setUnidad] = useState<UnidadPR>('kg');
  const [notas, setNotas] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoriaFilter, setSelectedCategoriaFilter] = useState<string>('Todas');
  const [selectedAtletaFilter, setSelectedAtletaFilter] = useState<string>('Todos');

  // Unique athletes list
  const uniqueAthletes = useMemo(() => {
    const names = Array.from(new Set(prs.map((p) => p.nombre_atleta))).sort();
    return names;
  }, [prs]);

  // Handle Preset Click
  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setEjercicio(preset.nombre);
    setCategoria(preset.categoria);
    setUnidad(preset.unidad);
    setShowNewForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreAtleta.trim()) {
      setFormError('Ingresá el nombre del atleta.');
      return;
    }
    const num = parseFloat(valor);
    if (isNaN(num) || num <= 0) {
      setFormError('Ingresá una marca numérica válida mayor a 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await onCrearPR({
        nombre_atleta: nombreAtleta.trim(),
        ejercicio: ejercicio.trim(),
        categoria,
        valor: num,
        unidad,
        notas: notas.trim() || undefined,
        fecha,
      });

      setFormSuccess(`¡Nuevo PR guardado para ${nombreAtleta}! 🚀`);
      setValor('');
      setNotas('');
      setTimeout(() => {
        setFormSuccess(null);
        setShowNewForm(false);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el PR');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered PR list
  const filteredPrs = prs.filter((pr) => {
    const matchesSearch =
      pr.nombre_atleta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.ejercicio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoriaFilter === 'Todas' || pr.categoria === selectedCategoriaFilter;
    const matchesAtleta =
      selectedAtletaFilter === 'Todos' || pr.nombre_atleta.toLowerCase() === selectedAtletaFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesAtleta;
  });

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#84B026] text-xs font-bold tracking-widest uppercase mb-1">
            <Trophy className="w-4 h-4 fill-current" />
            <span>Leaderboard &amp; Marcas Personales</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-heading">
            TABLERO DE PRs (PERSONAL RECORDS)
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Registrá tus 1RM de Halterofilia CrossFit y tiempos oficiales de HYROX.
          </p>
        </div>

        {/* Action Toggle */}
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            showNewForm
              ? 'bg-zinc-800 text-zinc-300 hover:text-white'
              : 'bg-[#84B026] text-black hover:bg-[#96c82c] shadow-lg shadow-[#84B026]/25'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showNewForm ? 'Ocultar Formulario' : 'Registrar Nuevo PR'}</span>
        </button>
      </div>

      {/* Quick Benchmark Preset Pills */}
      <div className="bg-[#141417] p-3.5 rounded-xl border border-zinc-800/80">
        <div className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#84B026]" />
          <span>Atajos Rápidos de Ejercicios Clave:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.nombre}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1.5 rounded-md bg-[#1F1F23] hover:bg-[#84B026]/20 border border-zinc-800 hover:border-[#84B026]/50 text-xs text-zinc-300 hover:text-[#84B026] font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {preset.categoria === 'CrossFit' ? (
                <Dumbbell className="w-3 h-3 text-[#84B026]" />
              ) : (
                <Timer className="w-3 h-3 text-amber-400" />
              )}
              <span>{preset.nombre}</span>
              <span className="text-[10px] text-zinc-500 font-mono">({preset.unidad})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Formulario Rápido para Registrar Marcas (Expandible) */}
      {showNewForm && (
        <div className="bg-[#141417] border border-[#84B026]/50 rounded-2xl p-5 sm:p-6 shadow-2xl relative animate-fadeIn">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <h3 className="text-base font-black uppercase text-white font-heading flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#84B026]" />
              Formulario Rápido de Marca Personal
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Triskel Hybrid Tracking</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Atleta */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 font-heading">
                  Nombre del Atleta <span className="text-[#84B026]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="atletas-list"
                    placeholder="Ej: Rodrigo Álvarez"
                    value={nombreAtleta}
                    onChange={(e) => setNombreAtleta(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none"
                  />
                  <datalist id="atletas-list">
                    {uniqueAthletes.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Ejercicio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 font-heading">
                  Ejercicio / Evento <span className="text-[#84B026]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Snatch, Back Squat, Sled Push..."
                  value={ejercicio}
                  onChange={(e) => setEjercicio(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 font-heading">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaPR)}
                  className="w-full bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] rounded-lg px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="CrossFit">CrossFit</option>
                  <option value="HYROX">HYROX</option>
                  <option value="Weightlifting">Halterofilia</option>
                  <option value="Cardio">Cardio / Monostructural</option>
                </select>
              </div>

              {/* Valor & Unidad */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 font-heading">
                  Marca Lograda <span className="text-[#84B026]">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="105.0"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-2/3 bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] rounded-lg px-3 py-2 text-sm text-white font-bold font-mono outline-none"
                  />
                  <select
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value as UnidadPR)}
                    className="w-1/3 bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] rounded-lg px-2 py-2 text-xs text-white font-bold outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                    <option value="min">min</option>
                    <option value="seg">seg</option>
                    <option value="reps">reps</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 font-heading">
                  Fecha del Récord
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              {/* Notas del Coach */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 font-heading">
                  Notas / Observaciones del Box <span className="text-zinc-500 text-[10px]">(Opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Con cinto de palanca y rodilleras 7mm"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-2.5 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="flex items-center gap-2 p-2.5 bg-[#84B026]/20 border border-[#84B026]/60 rounded-lg text-white text-xs font-bold font-heading">
                <CheckCircle2 className="w-4 h-4 text-[#84B026] shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg font-heading font-black text-xs uppercase tracking-wider bg-[#84B026] text-black hover:bg-[#96c82c] shadow-lg shadow-[#84B026]/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Récord Personal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#141417] p-3 rounded-xl border border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por atleta o ejercicio (ej: Rodrigo, Snatch, HYROX)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D0D0D] border border-zinc-700/80 focus:border-[#84B026] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
          />
        </div>

        {/* Filter Athlete Select */}
        <div className="flex items-center gap-2">
          <select
            value={selectedAtletaFilter}
            onChange={(e) => setSelectedAtletaFilter(e.target.value)}
            className="bg-[#0D0D0D] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-300 font-medium outline-none cursor-pointer"
          >
            <option value="Todos">Todos los Atletas</option>
            {uniqueAthletes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Filter Category */}
          <div className="flex items-center gap-1 bg-[#0D0D0D] p-1 rounded-lg border border-zinc-700/80">
            {['Todas', 'CrossFit', 'HYROX'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoriaFilter(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  selectedCategoriaFilter === cat
                    ? 'bg-[#84B026] text-black font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual PR Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-[#141417] p-5 rounded-xl border border-zinc-800 animate-pulse space-y-3">
              <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
              <div className="h-8 bg-zinc-800 rounded w-1/2"></div>
              <div className="h-4 bg-zinc-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredPrs.length === 0 ? (
        <div className="bg-[#141417] rounded-xl p-12 text-center border border-zinc-800">
          <Trophy className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
          <p className="font-heading font-black text-lg text-zinc-300 uppercase">
            No se encontraron marcas registradas
          </p>
          <p className="text-zinc-500 text-xs mt-1">
            Probá ajustando la búsqueda o utilizá el botón "Registrar Nuevo PR".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrs.map((pr) => {
            const isCrossfit = pr.categoria === 'CrossFit' || pr.categoria === 'Weightlifting';
            return (
              <div
                key={pr.id}
                className="bg-[#141417] rounded-xl border border-zinc-800/80 hover:border-[#84B026]/60 transition-all duration-300 p-5 flex flex-col justify-between group shadow-lg hover:shadow-[#84B026]/10"
              >
                {/* Top: Athlete Avatar & Category Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6E9320] to-[#84B026] text-black font-black text-xs flex items-center justify-center font-heading border border-black shadow-sm">
                        {pr.nombre_atleta.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block truncate leading-tight">
                          {pr.nombre_atleta}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {pr.fecha}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-heading ${
                        isCrossfit
                          ? 'bg-[#84B026]/20 text-[#84B026] border border-[#84B026]/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {pr.categoria}
                    </span>
                  </div>

                  {/* Exercise Name */}
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-heading">
                    {pr.ejercicio}
                  </h4>

                  {/* Big Number / Value */}
                  <div className="my-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black font-heading text-white tracking-tight group-hover:text-[#84B026] transition-colors">
                      {pr.valor}
                    </span>
                    <span className="text-sm font-bold font-heading text-[#84B026] uppercase">
                      {pr.unidad}
                    </span>
                  </div>

                  {/* Notes / Sensations */}
                  {pr.notas && (
                    <p className="text-xs text-zinc-400 bg-[#1A1A1E] p-2.5 rounded-lg border border-zinc-800/80 italic mt-2">
                      "{pr.notas}"
                    </p>
                  )}
                </div>

                {/* Footer: Date & Delete button */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3 text-[#84B026]" />
                    {pr.fecha}
                  </span>

                  <button
                    onClick={() => onEliminarPR(pr.id)}
                    title="Eliminar este PR"
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-zinc-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
