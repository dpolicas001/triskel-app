import React, { useState } from 'react';
import { Clase } from '../types';
import { 
  Users, 
  Clock, 
  UserCheck, 
  Flame, 
  Zap, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  X,
  Dumbbell
} from 'lucide-react';

interface ClasesSectionProps {
  clases: Clase[];
  loading: boolean;
  onReservar: (claseId: string, nombreAtleta: string, telefono?: string, email?: string) => Promise<void>;
  onCancelarReserva: (reservaId: string) => Promise<void>;
}

export const ClasesSection: React.FC<ClasesSectionProps> = ({
  clases,
  loading,
  onReservar,
  onCancelarReserva,
}) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Todas');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'hoy' | 'todas'>('hoy');
  
  // Modal state for reservation
  const [modalClase, setModalClase] = useState<Clase | null>(null);
  const [nombreAtleta, setNombreAtleta] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Expanded athletes lists
  const [expandedClaseId, setExpandedClaseId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredClases = clases.filter((c) => {
    const matchesDiscipline = selectedDiscipline === 'Todas' || c.disciplina === selectedDiscipline;
    const matchesDate = selectedDateFilter === 'todas' || c.fecha === todayStr;
    return matchesDiscipline && matchesDate;
  });

  const totalCuposDisponibles = filteredClases.reduce((acc, c) => acc + c.cupos_disponibles, 0);
  const totalInscriptos = filteredClases.reduce((acc, c) => acc + (c.atletas_reservados?.length || 0), 0);

  const handleOpenModal = (clase: Clase) => {
    setModalClase(clase);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleCloseModal = () => {
    setModalClase(null);
    setNombreAtleta('');
    setTelefono('');
    setEmail('');
    setErrorMsg(null);
    setIsSubmitting(false);
  };

  const handleSubmitReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalClase) return;
    if (!nombreAtleta.trim()) {
      setErrorMsg('Por favor ingresá tu nombre completo de atleta.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onReservar(modalClase.id, nombreAtleta.trim(), telefono.trim(), email.trim());
      setSuccessMsg(`¡Lugar confirmado para ${nombreAtleta}! Te esperamos en el box.`);
      setTimeout(() => {
        handleCloseModal();
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Section Header & KPI Cards */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#84B026] text-xs font-bold tracking-widest uppercase mb-1">
            <Flame className="w-4 h-4 fill-current" />
            <span>Sistema de Entrenamiento Oficial</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-heading">
            RESERVAS DE CLASES
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Seleccioná tu horario de CrossFit o HYROX y asegurá tu cupo para hoy.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-[#18181B] border border-zinc-800 rounded-lg px-4 py-2.5 text-center min-w-[110px]">
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Cupos Libres</div>
            <div className="text-xl font-black font-heading text-[#84B026]">{totalCuposDisponibles}</div>
          </div>
          <div className="bg-[#18181B] border border-zinc-800 rounded-lg px-4 py-2.5 text-center min-w-[110px]">
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Inscriptos Hoy</div>
            <div className="text-xl font-black font-heading text-white">{totalInscriptos}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141417] p-3 rounded-xl border border-zinc-800/80">
        {/* Disciplines */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2 hidden sm:inline">
            Disciplina:
          </span>
          {['Todas', 'CrossFit', 'HYROX', 'Endurance'].map((disc) => (
            <button
              key={disc}
              onClick={() => setSelectedDiscipline(disc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                selectedDiscipline === disc
                  ? 'bg-[#84B026] text-black font-black shadow-md shadow-[#84B026]/20'
                  : 'bg-[#1F1F23] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {disc}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedDateFilter('hoy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedDateFilter === 'hoy'
                ? 'bg-zinc-200 text-black font-black'
                : 'bg-[#1F1F23] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setSelectedDateFilter('todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedDateFilter === 'todas'
                ? 'bg-zinc-200 text-black font-black'
                : 'bg-[#1F1F23] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Ver Semana
          </button>
        </div>
      </div>

      {/* Clases Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-[#18181B] rounded-xl p-5 border border-zinc-800 animate-pulse space-y-4">
              <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
              <div className="h-8 bg-zinc-800 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
              <div className="h-10 bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredClases.length === 0 ? (
        <div className="bg-[#18181B] rounded-xl p-10 text-center border border-zinc-800 text-zinc-400">
          <AlertCircle className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
          <p className="font-heading font-bold text-lg text-zinc-300 uppercase">No hay clases programadas</p>
          <p className="text-sm text-zinc-500 mt-1">Probá cambiando los filtros o seleccionando "Ver Semana".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClases.map((clase) => {
            const isFull = clase.cupos_disponibles <= 0;
            const percentageUsed = Math.min(
              100,
              Math.round(((clase.cupos_totales - clase.cupos_disponibles) / clase.cupos_totales) * 100)
            );
            const isExpanded = expandedClaseId === clase.id;
            const inscritos = clase.atletas_reservados || [];

            return (
              <div
                key={clase.id}
                className="bg-[#141417] rounded-xl border border-zinc-800/80 hover:border-[#84B026]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg hover:shadow-[#84B026]/10"
              >
                {/* Top Badge & Time */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider font-heading ${
                        clase.disciplina === 'CrossFit'
                          ? 'bg-[#84B026]/20 text-[#84B026] border border-[#84B026]/40'
                          : clase.disciplina === 'HYROX'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      }`}
                    >
                      {clase.disciplina === 'CrossFit' && <Dumbbell className="w-3.5 h-3.5" />}
                      {clase.disciplina === 'HYROX' && <Zap className="w-3.5 h-3.5" />}
                      {clase.disciplina}
                    </span>

                    <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-bold font-heading bg-[#1F1F23] px-2.5 py-1 rounded border border-zinc-800">
                      <Clock className="w-3.5 h-3.5 text-[#84B026]" />
                      <span>{clase.hora_inicio.slice(0, 5)} - {clase.hora_fin.slice(0, 5)} HS</span>
                    </div>
                  </div>

                  {/* Class Title */}
                  <h3 className="text-lg font-black uppercase tracking-wide text-white font-heading group-hover:text-[#84B026] transition-colors leading-snug">
                    {clase.titulo}
                  </h3>

                  {/* Coach & Level */}
                  <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/60 pb-3">
                    <span className="font-medium flex items-center gap-1 text-zinc-300">
                      <span className="text-[#84B026] font-bold">Coach:</span> {clase.profesor}
                    </span>
                    <span className="bg-zinc-900 px-2 py-0.5 rounded text-[10px] uppercase font-semibold text-zinc-400">
                      {clase.nivel}
                    </span>
                  </div>

                  {/* Description */}
                  {clase.descripcion && (
                    <p className="mt-3 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {clase.descripcion}
                    </p>
                  )}
                </div>

                {/* Cupos status bar */}
                <div className="px-5 py-3 bg-[#18181B]/60 border-t border-zinc-800/70">
                  <div className="flex items-center justify-between text-xs font-heading uppercase mb-1.5">
                    <span className="text-zinc-400 font-bold tracking-wider">Cupos Restantes</span>
                    <span
                      className={`font-black ${
                        isFull
                          ? 'text-red-400'
                          : clase.cupos_disponibles <= 3
                          ? 'text-amber-400'
                          : 'text-[#84B026]'
                      }`}
                    >
                      {isFull ? 'Agotados' : `${clase.cupos_disponibles} de ${clase.cupos_totales}`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isFull
                          ? 'bg-red-500'
                          : clase.cupos_disponibles <= 3
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-[#6E9320] to-[#84B026]'
                      }`}
                      style={{ width: `${percentageUsed}%` }}
                    />
                  </div>
                </div>

                {/* Expandable registered athletes list */}
                {inscritos.length > 0 && (
                  <div className="px-5 py-2 border-t border-zinc-800/50 bg-[#121214]">
                    <button
                      onClick={() => setExpandedClaseId(isExpanded ? null : clase.id)}
                      className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer py-1"
                    >
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#84B026]" />
                        Atletas inscriptos ({inscritos.length})
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1 py-1">
                        {inscritos.map((atleta) => (
                          <div
                            key={atleta.id}
                            className="flex items-center justify-between bg-[#1A1A1E] px-2.5 py-1 rounded text-xs text-zinc-300 border border-zinc-800/80"
                          >
                            <span className="font-medium truncate">{atleta.nombre_atleta}</span>
                            <button
                              onClick={() => onCancelarReserva(atleta.id)}
                              title="Cancelar esta reserva"
                              className="text-zinc-500 hover:text-red-400 text-[10px] uppercase font-bold transition-colors ml-2 cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Action Button */}
                <div className="p-4 pt-2">
                  <button
                    disabled={isFull}
                    onClick={() => handleOpenModal(clase)}
                    className={`w-full py-2.5 px-4 rounded-lg font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                      isFull
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                        : 'bg-[#84B026] text-black hover:bg-[#96c82c] shadow-lg shadow-[#84B026]/20 active:scale-[0.99]'
                    }`}
                  >
                    {isFull ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>Cupos Agotados</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Reservar Lugar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reservation Modal */}
      {modalClase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141417] border border-[#84B026]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 text-[#84B026] text-xs font-bold uppercase tracking-widest font-heading mb-1">
              <Flame className="w-4 h-4" />
              <span>Confirmar Reserva de Cupo</span>
            </div>
            <h3 className="text-xl font-black uppercase text-white font-heading">
              {modalClase.titulo}
            </h3>

            {/* Class brief details */}
            <div className="mt-3 bg-[#1A1A1E] p-3 rounded-lg border border-zinc-800 text-xs text-zinc-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase font-semibold">Disciplina:</span>
                <span className="text-[#84B026] font-bold">{modalClase.disciplina}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase font-semibold">Horario:</span>
                <span className="font-bold">{modalClase.hora_inicio.slice(0, 5)} - {modalClase.hora_fin.slice(0, 5)} HS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase font-semibold">Coach a cargo:</span>
                <span className="font-bold">{modalClase.profesor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase font-semibold">Cupos restantes:</span>
                <span className="font-bold text-[#84B026]">{modalClase.cupos_disponibles} libres</span>
              </div>
            </div>

            {/* Reservation Form */}
            <form onSubmit={handleSubmitReserva} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 font-heading">
                  Nombre y Apellido del Atleta <span className="text-[#84B026]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Rodrigo Álvarez"
                  value={nombreAtleta}
                  onChange={(e) => setNombreAtleta(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] focus:ring-1 focus:ring-[#84B026] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 font-heading">
                  Teléfono / WhatsApp <span className="text-zinc-500 text-[10px]">(Opcional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ej: +54 9 11 4455-6677"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] focus:ring-1 focus:ring-[#84B026] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 font-heading">
                  Email de Notificación <span className="text-zinc-500 text-[10px]">(Opcional)</span>
                </label>
                <input
                  type="email"
                  placeholder="atleta@triskel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-zinc-700 focus:border-[#84B026] focus:ring-1 focus:ring-[#84B026] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-700/60 rounded-lg text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-[#84B026]/20 border border-[#84B026]/60 rounded-lg text-white text-xs font-bold font-heading">
                  <CheckCircle2 className="w-4 h-4 text-[#84B026] shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg font-heading font-black text-xs uppercase tracking-wider bg-[#84B026] text-black hover:bg-[#96c82c] shadow-lg shadow-[#84B026]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
