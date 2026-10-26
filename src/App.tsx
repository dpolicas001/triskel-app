import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ClasesSection } from './components/ClasesSection';
import { PrsSection } from './components/PrsSection';
import { CalculatorSection } from './components/CalculatorSection';
import { SqlSchemaSection } from './components/SqlSchemaSection';
import { WorkoutOfDay } from './components/WorkoutOfDay';
import { Clase, PR } from './types';
import { 
  getClases, 
  getPRs, 
  createReserva, 
  deleteReserva, 
  createPR, 
  deletePR, 
  getStatus 
} from './services/api';
import { MapPin, Clock, Phone, Instagram, ShieldCheck, Flame, Dumbbell } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'clases' | 'prs' | 'calculator' | 'sql'>('clases');
  
  // Data states
  const [clases, setClases] = useState<Clase[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [loadingClases, setLoadingClases] = useState(true);
  const [loadingPrs, setLoadingPrs] = useState(true);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Load Initial Data
  const loadClasesData = async () => {
    try {
      setLoadingClases(true);
      const data = await getClases();
      setClases(data);
    } catch (err) {
      console.error('Error loading clases:', err);
    } finally {
      setLoadingClases(false);
    }
  };

  const loadPrsData = async () => {
    try {
      setLoadingPrs(true);
      const data = await getPRs();
      setPrs(data);
    } catch (err) {
      console.error('Error loading PRs:', err);
    } finally {
      setLoadingPrs(false);
    }
  };

  useEffect(() => {
    loadClasesData();
    loadPrsData();
    getStatus()
      .then((status) => setDbStatus(status.database))
      .catch((e) => console.log('Status endpoint:', e));
  }, []);

  // Handlers
  const handleReservar = async (
    claseId: string, 
    nombreAtleta: string, 
    telefono?: string, 
    email?: string
  ) => {
    await createReserva({
      clase_id: claseId,
      nombre_atleta: nombreAtleta,
      telefono,
      email,
    });
    // Refresh classes to update spots and athletes
    await loadClasesData();
  };

  const handleCancelarReserva = async (reservaId: string) => {
    await deleteReserva(reservaId);
    await loadClasesData();
  };

  const handleCrearPR = async (data: Omit<PR, 'id' | 'created_at'>) => {
    await createPR(data);
    await loadPrsData();
  };

  const handleEliminarPR = async (id: string) => {
    await deletePR(id);
    await loadPrsData();
  };

  const handleFilterByAtleta = async (atleta: string) => {
    try {
      setLoadingPrs(true);
      const data = await getPRs();
      if (atleta && atleta !== 'Todos') {
        setPrs(data.filter((p) => p.nombre_atleta.toLowerCase() === atleta.toLowerCase()));
      } else {
        setPrs(data);
      }
    } catch (err) {
      console.error('Error filtering PRs:', err);
    } finally {
      setLoadingPrs(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F4F4F5] flex flex-col industrial-grid selection:bg-[#84B026] selection:text-black">
      {/* Official Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        dbStatus={dbStatus} 
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Daily WOD Briefing & Athletic Timer Banner */}
        <WorkoutOfDay />

        {/* Tab View Content */}
        {activeTab === 'clases' && (
          <ClasesSection
            clases={clases}
            loading={loadingClases}
            onReservar={handleReservar}
            onCancelarReserva={handleCancelarReserva}
          />
        )}

        {activeTab === 'prs' && (
          <PrsSection
            prs={prs}
            loading={loadingPrs}
            onCrearPR={handleCrearPR}
            onEliminarPR={handleEliminarPR}
            onFilterByAtleta={handleFilterByAtleta}
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorSection prs={prs} />
        )}

        {activeTab === 'sql' && (
          <SqlSchemaSection />
        )}
      </main>

      {/* Industrial Footer */}
      <footer className="bg-[#121214] border-t border-zinc-800/80 mt-16 text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Box Brand */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/Logo_Triskel_6fa6e464.jpeg"
                  alt="Triskel Hybrid Training Club Logo"
                  className="w-10 h-10 rounded-full border border-[#84B026]/40 object-cover"
                />
                <span className="font-heading font-black text-white text-base tracking-wider uppercase">
                  TRISKEL <span className="text-[#84B026]">HYBRID</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Comunidad atlética especializada en CrossFit de alto rendimiento y preparación física para eventos oficiales HYROX.
              </p>
            </div>

            {/* Location & Info */}
            <div className="space-y-2">
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-white">
                Ubicación del Box
              </h4>
              <div className="flex items-start gap-2 text-xs text-zinc-400">
                <MapPin className="w-4 h-4 text-[#84B026] shrink-0 mt-0.5" />
                <span>Av. Libertador &amp; Combatientes, Box Central • Zona Norte</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Clock className="w-4 h-4 text-[#84B026] shrink-0" />
                <span>Lunes a Sábados: 07:00 a 22:00 hs</span>
              </div>
            </div>

            {/* Disciplines */}
            <div className="space-y-2">
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-white">
                Modalidades de Entrenamiento
              </h4>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#84B026]"></span>
                  CrossFit WOD &amp; Levantamiento Olímpico
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#84B026]"></span>
                  HYROX Simulator &amp; Running Engine
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#84B026]"></span>
                  Endurance &amp; Open Box Libre
                </li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div className="space-y-2">
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-white">
                Contacto &amp; Comunidad
              </h4>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Phone className="w-4 h-4 text-[#84B026]" />
                <span>+54 9 11 9876-5432</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Instagram className="w-4 h-4 text-[#84B026]" />
                <span>@triskelhybridclub</span>
              </div>
              <div className="pt-1 text-[11px] text-zinc-500">
                Reserva de clases gestionada con PostgreSQL Supabase.
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-2">
            <div>
              &copy; {new Date().getFullYear()} Triskel Hybrid Training Club. Todos los derechos reservados.
            </div>
            <div className="font-heading font-bold text-[11px] text-zinc-500 uppercase tracking-widest">
              HYBRID FITNESS REVOLUTION
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
