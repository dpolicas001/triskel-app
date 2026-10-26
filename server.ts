import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pg from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// --- Database Connection & Storage Layer ---
const DATABASE_URL = process.env.DATABASE_URL;
let pgPool: pg.Pool | null = null;
let isPgConnected = false;

if (DATABASE_URL && DATABASE_URL.trim() !== '') {
  try {
    pgPool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    });

    pgPool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.warn('⚠️ [PostgreSQL] Connection error with DATABASE_URL, falling back to in-memory store:', err.message);
        isPgConnected = false;
      } else {
        console.log('✅ [PostgreSQL] Successfully connected to database at:', res.rows[0].now);
        isPgConnected = true;
      }
    });
  } catch (error) {
    console.warn('⚠️ [PostgreSQL] Pool initialization error, using in-memory store:', error);
    isPgConnected = false;
  }
}

// In-Memory Fallback Store (Ensures seamless preview execution and zero downtime)
interface Clase {
  id: string;
  titulo: string;
  disciplina: 'CrossFit' | 'HYROX' | 'Endurance' | 'Open Box' | 'Weightlifting';
  profesor: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cupos_totales: number;
  cupos_disponibles: number;
  descripcion: string;
  nivel: string;
  created_at: string;
}

interface Reserva {
  id: string;
  clase_id: string;
  nombre_atleta: string;
  telefono?: string;
  email?: string;
  estado: 'confirmada' | 'cancelada' | 'lista_espera';
  created_at: string;
}

interface PR {
  id: string;
  nombre_atleta: string;
  ejercicio: string;
  categoria: 'CrossFit' | 'HYROX' | 'Weightlifting' | 'Cardio';
  valor: number;
  unidad: 'kg' | 'lbs' | 'min' | 'seg' | 'reps';
  notas?: string;
  fecha: string;
  created_at: string;
}

const todayStr = new Date().toISOString().split('T')[0];

const initialClases: Clase[] = [
  {
    id: 'b1010001-1111-4000-8000-000000000001',
    titulo: 'CrossFit WOD: Heavy Fran & Bar Muscle-ups',
    disciplina: 'CrossFit',
    profesor: 'Coach Marcos "Toro" Díaz',
    fecha: todayStr,
    hora_inicio: '08:00',
    hora_fin: '09:00',
    cupos_totales: 16,
    cupos_disponibles: 14,
    descripcion: 'Foco en halterofilia técnica pesada seguido de sprint gimnástico de alta intensidad.',
    nivel: 'Avanzado / Intermedio',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1010001-1111-4000-8000-000000000002',
    titulo: 'HYROX Engine & Sled Simulator',
    disciplina: 'HYROX',
    profesor: 'Coach Valentina Ríos',
    fecha: todayStr,
    hora_inicio: '18:00',
    hora_fin: '19:15',
    cupos_totales: 20,
    cupos_disponibles: 18,
    descripcion: 'Entrenamiento específico de resistencia híbrida: trineo empuje/arrastre + SkiErg + carreras 1km.',
    nivel: 'Todos los niveles',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1010001-1111-4000-8000-000000000003',
    titulo: 'CrossFit Conditioning: The Hybrid Chipper',
    disciplina: 'CrossFit',
    profesor: 'Coach Facundo Gómez',
    fecha: todayStr,
    hora_inicio: '19:30',
    hora_fin: '20:30',
    cupos_totales: 16,
    cupos_disponibles: 15,
    descripcion: 'Trabajo en parejas con Dumbbells pesadas, Box Jumps y 5000m de remo por postas.',
    nivel: 'Todos los niveles',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1010001-1111-4000-8000-000000000004',
    titulo: 'HYROX Pro Race Prep & Wall Balls',
    disciplina: 'HYROX',
    profesor: 'Coach Valentina Ríos',
    fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fin: '10:15',
    cupos_totales: 18,
    cupos_disponibles: 18,
    descripcion: 'Simulación de bloques de carrera HYROX: 100 Wall Balls 9kg/6kg + 80m Burpee Broad Jumps.',
    nivel: 'Competición / Pro',
    created_at: new Date().toISOString(),
  },
];

const initialReservas: Reserva[] = [
  {
    id: 'res-001',
    clase_id: 'b1010001-1111-4000-8000-000000000001',
    nombre_atleta: 'Rodrigo Álvarez',
    telefono: '+54 9 11 4455-6677',
    email: 'rodrigo@triskel.com',
    estado: 'confirmada',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'res-002',
    clase_id: 'b1010001-1111-4000-8000-000000000001',
    nombre_atleta: 'Lucas Romero',
    telefono: '+54 9 11 3344-5566',
    email: 'lucas@triskel.com',
    estado: 'confirmada',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'res-003',
    clase_id: 'b1010001-1111-4000-8000-000000000002',
    nombre_atleta: 'Camila Benítez',
    telefono: '+54 9 11 2233-4455',
    email: 'camila@triskel.com',
    estado: 'confirmada',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'res-004',
    clase_id: 'b1010001-1111-4000-8000-000000000002',
    nombre_atleta: 'Sofia Rossi',
    telefono: '+54 9 11 7788-9900',
    email: 'sofia@triskel.com',
    estado: 'confirmada',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'res-005',
    clase_id: 'b1010001-1111-4000-8000-000000000003',
    nombre_atleta: 'Matías Varela',
    telefono: '+54 9 11 6655-4433',
    email: 'matias@triskel.com',
    estado: 'confirmada',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

const initialPRs: PR[] = [
  {
    id: 'pr-001',
    nombre_atleta: 'Rodrigo Álvarez',
    ejercicio: 'Snatch',
    categoria: 'CrossFit',
    valor: 105,
    unidad: 'kg',
    notas: '1RM logrado en bloque de halterofilia con Coach Marcos.',
    fecha: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'pr-002',
    nombre_atleta: 'Rodrigo Álvarez',
    ejercicio: 'Clean & Jerk',
    categoria: 'CrossFit',
    valor: 130,
    unidad: 'kg',
    notas: 'Prueba limpia y bloqueo sólido.',
    fecha: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'pr-003',
    nombre_atleta: 'Rodrigo Álvarez',
    ejercicio: 'Back Squat',
    categoria: 'CrossFit',
    valor: 170,
    unidad: 'kg',
    notas: 'Profundidad válida bajo paralelo.',
    fecha: new Date(Date.now() - 86400000 * 15).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'pr-004',
    nombre_atleta: 'Camila Benítez',
    ejercicio: 'HYROX 1km Run',
    categoria: 'HYROX',
    valor: 3.42,
    unidad: 'min',
    notas: 'Ritmo sostenido en pista para Hyrox Doubles.',
    fecha: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'pr-005',
    nombre_atleta: 'Camila Benítez',
    ejercicio: 'Sled Push (152kg)',
    categoria: 'HYROX',
    valor: 48.5,
    unidad: 'seg',
    notas: '4x12.5m en alfombra oficial.',
    fecha: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'pr-006',
    nombre_atleta: 'Camila Benítez',
    ejercicio: 'Snatch',
    categoria: 'CrossFit',
    valor: 62.5,
    unidad: 'kg',
    notas: 'Nuevo récord personal con técnica perfeccionada!',
    fecha: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'pr-007',
    nombre_atleta: 'Lucas Romero',
    ejercicio: 'Clean & Jerk',
    categoria: 'CrossFit',
    valor: 120,
    unidad: 'kg',
    notas: 'Split jerk impecable.',
    fecha: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'pr-008',
    nombre_atleta: 'Lucas Romero',
    ejercicio: 'Back Squat',
    categoria: 'CrossFit',
    valor: 155,
    unidad: 'kg',
    notas: 'Con cinto y rodilleras 7mm.',
    fecha: new Date(Date.now() - 86400000 * 8).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'pr-009',
    nombre_atleta: 'Sofia Rossi',
    ejercicio: 'SkiErg 1000m',
    categoria: 'HYROX',
    valor: 3.38,
    unidad: 'min',
    notas: 'Pace promedio 1:49/500m.',
    fecha: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'pr-010',
    nombre_atleta: 'Sofia Rossi',
    ejercicio: 'Wall Balls 100 reps',
    categoria: 'HYROX',
    valor: 4.15,
    unidad: 'min',
    notas: 'Balón 6kg unbroken hasta la rep 60.',
    fecha: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
];

let clasesStore: Clase[] = [...initialClases];
let reservasStore: Reserva[] = [...initialReservas];
let prsStore: PR[] = [...initialPRs];

// Helper to generate IDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ==============================================================================
// REST API ENDPOINTS
// ==============================================================================

// System status and DB info
app.get('/api/status', async (req: Request, res: Response) => {
  res.json({
    app: 'Triskel Hybrid Training Club API',
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      isPostgresConnected: isPgConnected,
      configuredUrl: DATABASE_URL ? 'Configurada' : 'No configurada (Modo simulación en memoria)',
      mode: isPgConnected ? 'PostgreSQL Live' : 'In-Memory Store',
    },
  });
});

// GET /api/clases - Visualización de clases del día (CrossFit / HYROX, horario, profesor y cupos restantes)
app.get('/api/clases', async (req: Request, res: Response) => {
  try {
    if (isPgConnected && pgPool) {
      const result = await pgPool.query(`
        SELECT c.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', r.id,
                'nombre_atleta', r.nombre_atleta,
                'estado', r.estado,
                'created_at', r.created_at
              )
            ) FILTER (WHERE r.id IS NOT NULL AND r.estado = 'confirmada'), '[]'
          ) AS atletas_reservados
        FROM clases c
        LEFT JOIN reservas r ON c.id = r.clase_id
        GROUP BY c.id
        ORDER BY c.fecha ASC, c.hora_inicio ASC
      `);
      return res.json(result.rows);
    }

    // In-memory response with athletes list
    const clasesWithReservas = clasesStore.map((clase) => {
      const reservasClase = reservasStore.filter(
        (r) => r.clase_id === clase.id && r.estado === 'confirmada'
      );
      return {
        ...clase,
        cupos_disponibles: Math.max(0, clase.cupos_totales - reservasClase.length),
        atletas_reservados: reservasClase.map((r) => ({
          id: r.id,
          nombre_atleta: r.nombre_atleta,
          estado: r.estado,
          created_at: r.created_at,
        })),
      };
    });

    res.json(clasesWithReservas);
  } catch (error) {
    console.error('Error fetching clases:', error);
    res.status(500).json({ error: 'Error al obtener las clases' });
  }
});

// POST /api/reservas - Botón 'Reservar' que pide el nombre del atleta
app.post('/api/reservas', async (req: Request, res: Response) => {
  try {
    const { clase_id, nombre_atleta, telefono, email } = req.body;

    if (!clase_id || !nombre_atleta || !nombre_atleta.trim()) {
      return res.status(400).json({ error: 'Debe ingresar el ID de la clase y el nombre del atleta' });
    }

    const trimmedNombre = nombre_atleta.trim();

    if (isPgConnected && pgPool) {
      // Check current spots
      const checkClase = await pgPool.query('SELECT * FROM clases WHERE id = $1', [clase_id]);
      if (checkClase.rows.length === 0) {
        return res.status(404).json({ error: 'Clase no encontrada' });
      }

      const clase = checkClase.rows[0];
      if (clase.cupos_disponibles <= 0) {
        return res.status(400).json({ error: 'No quedan cupos disponibles para esta clase' });
      }

      // Check if athlete already registered
      const checkExisting = await pgPool.query(
        'SELECT * FROM reservas WHERE clase_id = $1 AND LOWER(nombre_atleta) = LOWER($2) AND estado = $3',
        [clase_id, trimmedNombre, 'confirmada']
      );

      if (checkExisting.rows.length > 0) {
        return res.status(400).json({ error: `El atleta ${trimmedNombre} ya tiene una reserva confirmada en esta clase` });
      }

      // Insert reservation
      const insertRes = await pgPool.query(
        'INSERT INTO reservas (clase_id, nombre_atleta, telefono, email, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [clase_id, trimmedNombre, telefono || null, email || null, 'confirmada']
      );

      // Decrement spots
      await pgPool.query(
        'UPDATE clases SET cupos_disponibles = GREATEST(cupos_disponibles - 1, 0) WHERE id = $1',
        [clase_id]
      );

      return res.status(201).json(insertRes.rows[0]);
    }

    // In-memory logic
    const clase = clasesStore.find((c) => c.id === clase_id);
    if (!clase) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    const currentReservas = reservasStore.filter(
      (r) => r.clase_id === clase_id && r.estado === 'confirmada'
    );

    if (currentReservas.length >= clase.cupos_totales) {
      return res.status(400).json({ error: 'No quedan cupos disponibles para esta clase' });
    }

    const existing = currentReservas.find(
      (r) => r.nombre_atleta.toLowerCase() === trimmedNombre.toLowerCase()
    );
    if (existing) {
      return res.status(400).json({ error: `El atleta ${trimmedNombre} ya tiene una reserva confirmada en esta clase` });
    }

    const nuevaReserva: Reserva = {
      id: generateUUID(),
      clase_id,
      nombre_atleta: trimmedNombre,
      telefono: telefono || '',
      email: email || '',
      estado: 'confirmada',
      created_at: new Date().toISOString(),
    };

    reservasStore.push(nuevaReserva);
    clase.cupos_disponibles = Math.max(0, clase.cupos_totales - (currentReservas.length + 1));

    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error('Error creating reserva:', error);
    res.status(500).json({ error: 'Error al procesar la reserva' });
  }
});

// DELETE /api/reservas/:id - Cancelar reserva
app.delete('/api/reservas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isPgConnected && pgPool) {
      const resQuery = await pgPool.query('SELECT * FROM reservas WHERE id = $1', [id]);
      if (resQuery.rows.length === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }
      const reserva = resQuery.rows[0];
      await pgPool.query('DELETE FROM reservas WHERE id = $1', [id]);
      await pgPool.query('UPDATE clases SET cupos_disponibles = LEAST(cupos_disponibles + 1, cupos_totales) WHERE id = $1', [reserva.clase_id]);
      return res.json({ success: true, message: 'Reserva cancelada exitosamente' });
    }

    const index = reservasStore.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const [deleted] = reservasStore.splice(index, 1);
    const clase = clasesStore.find((c) => c.id === deleted.clase_id);
    if (clase) {
      const activeCount = reservasStore.filter((r) => r.clase_id === clase.id && r.estado === 'confirmada').length;
      clase.cupos_disponibles = clase.cupos_totales - activeCount;
    }

    res.json({ success: true, message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Error deleting reserva:', error);
    res.status(500).json({ error: 'Error al cancelar la reserva' });
  }
});

// GET /api/prs - Listar todos los PRs (con filtro opcional)
app.get('/api/prs', async (req: Request, res: Response) => {
  try {
    const { categoria, ejercicio } = req.query;

    if (isPgConnected && pgPool) {
      let query = 'SELECT * FROM prs WHERE 1=1';
      const params: any[] = [];
      if (categoria) {
        params.push(categoria);
        query += ` AND categoria = $${params.length}`;
      }
      if (ejercicio) {
        params.push(ejercicio);
        query += ` AND ejercicio = $${params.length}`;
      }
      query += ' ORDER BY created_at DESC';
      const result = await pgPool.query(query, params);
      return res.json(result.rows);
    }

    let filtered = [...prsStore];
    if (categoria) {
      filtered = filtered.filter((p) => p.categoria.toLowerCase() === String(categoria).toLowerCase());
    }
    if (ejercicio) {
      filtered = filtered.filter((p) => p.ejercicio.toLowerCase() === String(ejercicio).toLowerCase());
    }

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching PRs:', error);
    res.status(500).json({ error: 'Error al obtener los PRs' });
  }
});

// GET /api/prs/:atleta - Marcas registradas de un atleta específico
app.get('/api/prs/:atleta', async (req: Request, res: Response) => {
  try {
    const { atleta } = req.params;

    if (isPgConnected && pgPool) {
      const result = await pgPool.query(
        'SELECT * FROM prs WHERE LOWER(nombre_atleta) = LOWER($1) ORDER BY fecha DESC, created_at DESC',
        [atleta]
      );
      return res.json(result.rows);
    }

    const filtered = prsStore
      .filter((p) => p.nombre_atleta.toLowerCase() === atleta.toLowerCase())
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching athlete PRs:', error);
    res.status(500).json({ error: 'Error al obtener los PRs del atleta' });
  }
});

// POST /api/prs - Formulario rápido para registrar marcas en Snatch, Clean & Jerk, Back Squat o Tiempos de HYROX
app.post('/api/prs', async (req: Request, res: Response) => {
  try {
    const { nombre_atleta, ejercicio, categoria, valor, unidad, notas, fecha } = req.body;

    if (!nombre_atleta || !ejercicio || valor === undefined || valor === null) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre_atleta, ejercicio y valor' });
    }

    const numValor = parseFloat(valor);
    if (isNaN(numValor) || numValor <= 0) {
      return res.status(400).json({ error: 'El valor del PR debe ser un número positivo' });
    }

    const fechaRegistro = fecha || new Date().toISOString().split('T')[0];
    const cat = categoria || 'CrossFit';
    const uni = unidad || 'kg';

    if (isPgConnected && pgPool) {
      const result = await pgPool.query(
        `INSERT INTO prs (nombre_atleta, ejercicio, categoria, valor, unidad, notas, fecha)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [nombre_atleta.trim(), ejercicio.trim(), cat, numValor, uni, notas ? notas.trim() : null, fechaRegistro]
      );
      return res.status(201).json(result.rows[0]);
    }

    const nuevoPR: PR = {
      id: generateUUID(),
      nombre_atleta: nombre_atleta.trim(),
      ejercicio: ejercicio.trim(),
      categoria: cat,
      valor: numValor,
      unidad: uni,
      notas: notas ? notas.trim() : undefined,
      fecha: fechaRegistro,
      created_at: new Date().toISOString(),
    };

    prsStore.unshift(nuevoPR);
    res.status(201).json(nuevoPR);
  } catch (error) {
    console.error('Error creating PR:', error);
    res.status(500).json({ error: 'Error al registrar el PR' });
  }
});

// DELETE /api/prs/:id - Eliminar PR
app.delete('/api/prs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isPgConnected && pgPool) {
      await pgPool.query('DELETE FROM prs WHERE id = $1', [id]);
      return res.json({ success: true, message: 'PR eliminado con éxito' });
    }

    const index = prsStore.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'PR no encontrado' });
    }

    prsStore.splice(index, 1);
    res.json({ success: true, message: 'PR eliminado con éxito' });
  } catch (error) {
    console.error('Error deleting PR:', error);
    res.status(500).json({ error: 'Error al eliminar el PR' });
  }
});

// GET /api/sql-schema - Descarga o visualización del script SQL de Supabase
app.get('/api/sql-schema', (req: Request, res: Response) => {
  const schemaPath = path.resolve(__dirname, 'supabase_schema.sql');
  if (fs.existsSync(schemaPath)) {
    const content = fs.readFileSync(schemaPath, 'utf-8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(content);
  }
  res.status(404).json({ error: 'Archivo de esquema SQL no encontrado' });
});

// ==============================================================================
// Vite Dev Server / Static File Serving
// ==============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev mode, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 [Triskel Hybrid Training Club] Server running on http://localhost:${PORT}`);
    console.log(`📡 Database mode: ${isPgConnected ? 'PostgreSQL Active' : 'In-Memory Simulation Store Active'}`);
  });
}

startServer();
