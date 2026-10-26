export type Disciplina = 'CrossFit' | 'HYROX' | 'Endurance' | 'Open Box' | 'Weightlifting';
export type CategoriaPR = 'CrossFit' | 'HYROX' | 'Weightlifting' | 'Cardio';
export type UnidadPR = 'kg' | 'lbs' | 'min' | 'seg' | 'reps';

export interface AtletaInscripto {
  id: string;
  nombre_atleta: string;
  estado: 'confirmada' | 'cancelada' | 'lista_espera';
  created_at: string;
}

export interface Clase {
  id: string;
  titulo: string;
  disciplina: Disciplina;
  profesor: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cupos_totales: number;
  cupos_disponibles: number;
  descripcion: string;
  nivel: string;
  created_at: string;
  atletas_reservados?: AtletaInscripto[];
}

export interface Reserva {
  id: string;
  clase_id: string;
  nombre_atleta: string;
  telefono?: string;
  email?: string;
  estado: 'confirmada' | 'cancelada' | 'lista_espera';
  created_at: string;
}

export interface PR {
  id: string;
  nombre_atleta: string;
  ejercicio: string;
  categoria: CategoriaPR;
  valor: number;
  unidad: UnidadPR;
  notas?: string;
  fecha: string;
  created_at: string;
}
