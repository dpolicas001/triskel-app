import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, Download, ExternalLink, ShieldCheck, Server } from 'lucide-react';
import { getSqlSchema } from '../services/api';

export const SqlSchemaSection: React.FC = () => {
  const [sqlContent, setSqlContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSqlSchema()
      .then((data) => {
        setSqlContent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching SQL script:', err);
        setLoading(false);
      });
  }, []);

  const handleCopy = () => {
    if (!sqlContent) return;
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!sqlContent) return;
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'triskel_supabase_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      {/* Title */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 text-[#84B026] text-xs font-bold tracking-widest uppercase mb-1">
          <Database className="w-4 h-4" />
          <span>Supabase PostgreSQL Integration</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-heading">
          SCRIPT DE BASE DE DATOS SUPABASE
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Script SQL listo para ejecutar en el SQL Editor de Supabase o cualquier base de datos PostgreSQL.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141417] p-4 rounded-xl border border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-[#84B026]/20 text-[#84B026] flex items-center justify-center font-bold text-sm mb-3">
            1
          </div>
          <h4 className="font-heading font-black text-sm text-white uppercase">Abrir Supabase</h4>
          <p className="text-xs text-zinc-400 mt-1">
            Creá o seleccioná tu proyecto en <span className="text-[#84B026]">supabase.com</span> y andá a la pestaña <span className="font-mono text-zinc-200">SQL Editor</span>.
          </p>
        </div>

        <div className="bg-[#141417] p-4 rounded-xl border border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-[#84B026]/20 text-[#84B026] flex items-center justify-center font-bold text-sm mb-3">
            2
          </div>
          <h4 className="font-heading font-black text-sm text-white uppercase">Pegar y Ejecutar</h4>
          <p className="text-xs text-zinc-400 mt-1">
            Copiá el script que tenés abajo, pegalo en una nueva consulta y hacé clic en <span className="text-[#84B026] font-bold">Run</span>. Creará las tablas <span className="font-mono text-zinc-200">clases</span>, <span className="font-mono text-zinc-200">reservas</span>, <span className="font-mono text-zinc-200">prs</span> y los datos iniciales.
          </p>
        </div>

        <div className="bg-[#141417] p-4 rounded-xl border border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-[#84B026]/20 text-[#84B026] flex items-center justify-center font-bold text-sm mb-3">
            3
          </div>
          <h4 className="font-heading font-black text-sm text-white uppercase">Conectar al Backend</h4>
          <p className="text-xs text-zinc-400 mt-1">
            En Supabase andá a <span className="font-mono text-zinc-200">Settings &gt; Database &gt; URI</span> y pegá la cadena en la variable <span className="font-mono text-[#84B026]">DATABASE_URL</span> del archivo <span className="font-mono text-zinc-200">.env</span>.
          </p>
        </div>
      </div>

      {/* Code Display Box */}
      <div className="bg-[#141417] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Toolbar */}
        <div className="bg-[#1A1A1E] px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#84B026]" />
            <span className="text-xs font-mono font-bold text-zinc-300">
              supabase_schema.sql
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
              PostgreSQL DDL + DML
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#84B026]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#84B026] text-black font-black hover:bg-[#96c82c] transition shadow-md shadow-[#84B026]/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .sql</span>
            </button>
          </div>
        </div>

        {/* Code View */}
        <div className="p-4 overflow-x-auto max-h-[550px] bg-[#09090B]">
          {loading ? (
            <div className="text-center py-12 text-zinc-500 font-mono text-xs">
              Cargando script SQL...
            </div>
          ) : (
            <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
              <code>{sqlContent}</code>
            </pre>
          )}
        </div>
      </div>
    </section>
  );
};
