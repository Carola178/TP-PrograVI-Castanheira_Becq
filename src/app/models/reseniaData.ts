export interface Resenia {
  id?: number;
  peliculaid: number;
  usuarioid?: string;
  rating: number;
  comentario: string;
  created_at?: string;
  Usuarios?: {
    nombre?: string;
    apellido?: string;
  };
}