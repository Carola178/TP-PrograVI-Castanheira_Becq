export interface PropuestaPeliculaData {
  id: string;
  usuario_id: string;
  titulo: string;
  descripcion: string;
  justificacion: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fecha_creacion: string;
}
