-- ==============================================================================
-- TRISKEL HYBRID TRAINING CLUB - DATABASE SCHEMA
-- PostgreSQL / Supabase Compatible Script
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Limpieza de tablas existentes (en orden de dependencias)
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS prs CASCADE;
DROP TABLE IF EXISTS clases CASCADE;

-- 3. Tabla de Clases del Box (CrossFit / HYROX / Endurance / Open Box)
CREATE TABLE clases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(120) NOT NULL,
    disciplina VARCHAR(50) NOT NULL CHECK (disciplina IN ('CrossFit', 'HYROX', 'Endurance', 'Open Box', 'Weightlifting')),
    profesor VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    cupos_totales INT NOT NULL DEFAULT 16,
    cupos_disponibles INT NOT NULL DEFAULT 16,
    descripcion TEXT,
    nivel VARCHAR(50) DEFAULT 'Todos los niveles',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Reservas de Atletas
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clase_id UUID NOT NULL REFERENCES clases(id) ON DELETE CASCADE,
    nombre_atleta VARCHAR(120) NOT NULL,
    telefono VARCHAR(30),
    email VARCHAR(120),
    estado VARCHAR(20) DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'cancelada', 'lista_espera')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Personal Records (PRs)
CREATE TABLE prs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_atleta VARCHAR(120) NOT NULL,
    ejercicio VARCHAR(100) NOT NULL, -- Ej: Snatch, Clean & Jerk, Back Squat, Deadlift, HYROX 1km Run, etc.
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('CrossFit', 'HYROX', 'Weightlifting', 'Cardio')),
    valor NUMERIC(10, 2) NOT NULL, -- peso en kg o tiempo en min/seg o repeticiones
    unidad VARCHAR(20) NOT NULL DEFAULT 'kg', -- 'kg', 'lbs', 'min', 'seg', 'reps'
    notas TEXT,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Índices para optimizar rendimiento
CREATE INDEX idx_clases_fecha ON clases(fecha);
CREATE INDEX idx_reservas_clase_id ON reservas(clase_id);
CREATE INDEX idx_reservas_atleta ON reservas(nombre_atleta);
CREATE INDEX idx_prs_atleta ON prs(nombre_atleta);
CREATE INDEX idx_prs_ejercicio ON prs(ejercicio);

-- 7. Trigger para descontar / reponer cupos automáticamente
CREATE OR REPLACE FUNCTION actualizar_cupos_reserva()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE clases 
        SET cupos_disponibles = GREATEST(cupos_disponibles - 1, 0)
        WHERE id = NEW.clase_id;
    ELSIF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.estado = 'cancelada' AND OLD.estado != 'cancelada')) THEN
        UPDATE clases 
        SET cupos_disponibles = LEAST(cupos_disponibles + 1, cupos_totales)
        WHERE id = OLD.clase_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_actualizar_cupos
AFTER INSERT OR UPDATE OR DELETE ON reservas
FOR EACH ROW EXECUTE FUNCTION actualizar_cupos_reserva();

-- ==============================================================================
-- 8. Datos Iniciales de Prueba (3 clases de hoy + PRs de referencia)
-- ==============================================================================

-- 3 Clases para el día de hoy (y 1 adicional para mañana)
INSERT INTO clases (id, titulo, disciplina, profesor, fecha, hora_inicio, hora_fin, cupos_totales, cupos_disponibles, descripcion, nivel) VALUES
('b1010001-1111-4000-8000-000000000001', 'CrossFit WOD: Heavy Fran & Bar Muscle-ups', 'CrossFit', 'Coach Marcos "Toro" Díaz', CURRENT_DATE, '08:00:00', '09:00:00', 16, 14, 'Foco en halterofilia técnica pesada seguido de sprint gimnástico de alta intensidad.', 'Avanzado / Intermedio'),
('b1010001-1111-4000-8000-000000000002', 'HYROX Engine & Sled Simulator', 'HYROX', 'Coach Valentina Ríos', CURRENT_DATE, '18:00:00', '19:15:00', 20, 18, 'Entrenamiento específico de resistencia híbrida: trineo empuje/arrastre + SkiErg + carreras 1km.', 'Todos los niveles'),
('b1010001-1111-4000-8000-000000000003', 'CrossFit Conditioning: The Hybrid Chipper', 'CrossFit', 'Coach Facundo Gómez', CURRENT_DATE, '19:30:00', '20:30:00', 16, 15, 'Trabajo en parejas con Dumbbells pesadas, Box Jumps y 5000m de remo por postas.', 'Todos los niveles'),
('b1010001-1111-4000-8000-000000000004', 'HYROX Pro Race Prep & Wall Balls', 'HYROX', 'Coach Valentina Ríos', CURRENT_DATE + INTERVAL '1 day', '09:00:00', '10:15:00', 18, 18, 'Simulación de bloques de carrera HYROX: 100 Wall Balls 9kg/6kg + 80m Burpee Broad Jumps.', 'Competición / Pro');

-- Reservas de prueba iniciales
INSERT INTO reservas (clase_id, nombre_atleta, telefono, email) VALUES
('b1010001-1111-4000-8000-000000000001', 'Rodrigo Álvarez', '+54 9 11 4455-6677', 'rodrigo@triskel.com'),
('b1010001-1111-4000-8000-000000000001', 'Lucas Romero', '+54 9 11 3344-5566', 'lucas@triskel.com'),
('b1010001-1111-4000-8000-000000000002', 'Camila Benítez', '+54 9 11 2233-4455', 'camila@triskel.com'),
('b1010001-1111-4000-8000-000000000002', 'Sofia Rossi', '+54 9 11 7788-9900', 'sofia@triskel.com'),
('b1010001-1111-4000-8000-000000000003', 'Matías Varela', '+54 9 11 6655-4433', 'matias@triskel.com');

-- Registros de PRs de Atletas
INSERT INTO prs (nombre_atleta, ejercicio, categoria, valor, unidad, notas, fecha) VALUES
('Rodrigo Álvarez', 'Snatch', 'CrossFit', 105.00, 'kg', '1RM logrado en bloque de halterofilia con Coach Marcos.', CURRENT_DATE - INTERVAL '3 days'),
('Rodrigo Álvarez', 'Clean & Jerk', 'CrossFit', 130.00, 'kg', 'Prueba limpia y bloqueo sólido.', CURRENT_DATE - INTERVAL '10 days'),
('Rodrigo Álvarez', 'Back Squat', 'CrossFit', 170.00, 'kg', 'Profundidad válida bajo paralelo.', CURRENT_DATE - INTERVAL '15 days'),
('Camila Benítez', 'HYROX 1km Run', 'HYROX', 3.42, 'min', 'Ritmo sostenido en pista para Hyrox Doubles.', CURRENT_DATE - INTERVAL '2 days'),
('Camila Benítez', 'Sled Push (152kg)', 'HYROX', 48.50, 'seg', '4x12.5m en alfombra oficial.', CURRENT_DATE - INTERVAL '5 days'),
('Camila Benítez', 'Snatch', 'CrossFit', 62.50, 'kg', 'Nuevo récord personal!', CURRENT_DATE - INTERVAL '7 days'),
('Lucas Romero', 'Clean & Jerk', 'CrossFit', 120.00, 'kg', 'Split jerk impecable.', CURRENT_DATE - INTERVAL '4 days'),
('Lucas Romero', 'Back Squat', 'CrossFit', 155.00, 'kg', 'Con cinto y rodilleras 7mm.', CURRENT_DATE - INTERVAL '8 days'),
('Sofia Rossi', 'SkiErg 1000m', 'HYROX', 3.38, 'min', 'Pace promedio 1:49/500m.', CURRENT_DATE - INTERVAL '1 day'),
('Sofia Rossi', 'Wall Balls 100 reps', 'HYROX', 4.15, 'min', 'Balón 6kg unbroken hasta la 60.', CURRENT_DATE - INTERVAL '6 days');
