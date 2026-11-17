import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { PeliculaServicio } from './peliculaServicio';
import { PropuestaPeliculaData } from '../models/propuestaPeliculaData';

@Injectable({
  providedIn: 'root'
})
export class PropuestasServicio {

  constructor(
    private auth: Auth,
    private peliculaServicio: PeliculaServicio
  ) {}

  async obtenerMisPropuestas(): Promise<PropuestaPeliculaData[]> {
    const usuario = await this.auth.getUsuarioActual();

    if (!usuario) {
      throw new Error('Debés iniciar sesión para consultar tus propuestas.');
    }

    const { data, error } = await this.auth.supabase
      .from('PropuestasPeliculas')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as PropuestaPeliculaData[];
  }

  async tienePropuestaPendiente(): Promise<boolean> {
    const propuestas = await this.obtenerMisPropuestas();

    return propuestas.some(
      propuesta => propuesta.estado === 'pendiente'
    );
  }

  async crearPropuesta(
    titulo: string,
    descripcion: string,
    justificacion: string
  ): Promise<PropuestaPeliculaData> {

    const usuario = await this.auth.getUsuarioActual();

    if (!usuario) {
      throw new Error('Debés iniciar sesión para proponer una película.');
    }

    titulo = titulo.trim();
    descripcion = descripcion.trim();
    justificacion = justificacion.trim();

    if (!titulo || !descripcion || !justificacion) {
      throw new Error('Todos los campos son obligatorios.');
    }

    const tienePendiente = await this.tienePropuestaPendiente();

    if (tienePendiente) {
      throw new Error(
        'Ya tenés una propuesta pendiente de revisión.'
      );
    }

    const peliculas = await this.peliculaServicio.getPeliculas();

    const normalizar = (texto: string) =>
      texto.trim().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const existe = peliculas.some(
      pelicula => normalizar(pelicula.titulo) === normalizar(titulo)
    );

    if (existe) {
      throw new Error(
        'Esta película ya se encuentra registrada en el cine.'
      );
    }

    const { data, error } = await this.auth.supabase
      .from('PropuestasPeliculas')
      .insert({
        usuario_id: usuario.id,
        titulo,
        descripcion,
        justificacion,
        estado: 'pendiente'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'Ya tenés una propuesta pendiente de revisión.'
        );
      }

      console.error('Error al crear propuesta:', error);
      throw new Error(error.message);
    }

    return data as PropuestaPeliculaData;
  }

  async obtenerTodasLasPropuestas(): Promise<PropuestaPeliculaData[]> {

    if (!(await this.auth.esAdmin())) {
      throw new Error('No tenés permisos de administrador.');
    }

    const { data, error } = await this.auth.supabase
      .from('PropuestasPeliculas')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as PropuestaPeliculaData[];
  }

  async cambiarEstado(
    id: string,
    estado: 'aceptada' | 'rechazada'
  ): Promise<void> {

    if (!(await this.auth.esAdmin())) {
      throw new Error('No tenés permisos de administrador.');
    }

    const { data, error } = await this.auth.supabase
      .from('PropuestasPeliculas')
      .update({ estado })
      .eq('id', id)
      .eq('estado', 'pendiente')
      .select('id');

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error(
        'La propuesta ya fue procesada o no existe.'
      );
    }
  }
}
