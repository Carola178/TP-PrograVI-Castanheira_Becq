import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ReplaySubject, Observable } from 'rxjs';
import { enviroment } from '../enviroments/enviroments';
import { PeliculaData } from '../models/peliculaData';

@Injectable({
  providedIn: 'root'
})
export class PeliculaServicio { 
  private supabase: SupabaseClient;

  private peliculasSubject = new ReplaySubject<PeliculaData[]>(1);
  public peliculas$: Observable<PeliculaData[]> = this.peliculasSubject.asObservable();

  constructor() {
    this.supabase = createClient(
      enviroment.supabaseUrl,
      enviroment.supabasePublishableKey 
    );
  }

  async getPeliculas(): Promise<PeliculaData[]> {
    const { data, error } = await this.supabase
      .from('Peliculas')
      .select('*');

    if (error) {
      console.error('Error al cargar películas desde Supabase:', error);
      return [];
    }

    const listaFormateada: PeliculaData[] = (data || []).map(p => ({
      id: p.id,
      titulo: p.titulo,
      sinopsis: p.sinopsis,
      duracionMinutos: p.duracionMinutos ?? p.duracion_minutos,
      imagenUrl: p.imagenUrl ?? p.imagen_url,
      generos: p.generos,
      EsteProximamente: p.EsteProximamente,
      fechaEstreno: p.fechaEstreno,
      enPreventa: p.enPreventa,
      precio: p.precio,
      precioPreventa: p.precioPreventa,
      sala: p.sala,
      // Mapeamos ambas variantes (camelCase y snake_case)
      esMayor18: p.esMayor18 ?? p.es_mayor_18 ?? false 
    }));

    this.peliculasSubject.next(listaFormateada);
    return listaFormateada;
  }

  async getPeliculaPorId(id: string | number): Promise<PeliculaData | null> {
    const { data, error } = await this.supabase
      .from('Peliculas')
      .select('*')
      .eq('id', id)
      .maybeSingle(); 

    if (error || !data) {
      console.error(`Error al obtener película con id ${id}:`, error);
      return null;
    }

    return {
      id: data.id,
      titulo: data.titulo,
      sinopsis: data.sinopsis,
      duracionMinutos: data.duracionMinutos ?? data.duracion_minutos,
      imagenUrl: data.imagenUrl ?? data.imagen_url,
      generos: data.generos,
      EsteProximamente: data.EsteProximamente,
      fechaEstreno: data.fechaEstreno,
      enPreventa: data.enPreventa,
      precio: data.precio,
      precioPreventa: data.precioPreventa,
      sala: data.sala,
      esMayor18: data.esMayor18 ?? false
    };
  }

  async crearPelicula(nuevaPeli: Omit<PeliculaData, 'id'>): Promise<PeliculaData | null> {
    const payload = {
      titulo: nuevaPeli.titulo || 'Sin título',
      sinopsis: nuevaPeli.sinopsis || '',
      duracionMinutos: Number(nuevaPeli.duracionMinutos) || 120,
      imagenUrl: nuevaPeli.imagenUrl || '',
      generos: nuevaPeli.generos || '',
      EsteProximamente: Boolean(nuevaPeli.EsteProximamente),
      fechaEstreno: nuevaPeli.fechaEstreno || new Date().toISOString().split('T')[0],
      enPreventa: Boolean(nuevaPeli.enPreventa),
      precio: Number(nuevaPeli.precio) || 35000,
      precioPreventa: Number(nuevaPeli.precioPreventa) || 0,
      sala: nuevaPeli.sala || 'sala 1',
      esMayor18: Boolean(nuevaPeli.esMayor18),
    };

    const { data, error } = await this.supabase
      .from('Peliculas')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error al registrar película en Supabase:', error);
      return null;
    }

    await this.getPeliculas();
    return data as PeliculaData;
  }

  async actualizarPelicula(pelicula: PeliculaData): Promise<boolean> {
    if (!pelicula.id) {
      console.error('No se proporcionó un ID válido para actualizar');
      return false;
    }

    const { id, ...datosSinId } = pelicula;

    const payload = {
      titulo: datosSinId.titulo || 'Sin título',
      sinopsis: datosSinId.sinopsis || '',
      duracionMinutos: Number(datosSinId.duracionMinutos) || 120,
      imagenUrl: datosSinId.imagenUrl || '',
      generos: datosSinId.generos || '',
      EsteProximamente: Boolean(datosSinId.EsteProximamente),
      fechaEstreno: datosSinId.fechaEstreno || new Date().toISOString().split('T')[0],
      enPreventa: Boolean(datosSinId.enPreventa),
      precio: Number(datosSinId.precio) || 35000,
      precioPreventa: Number(datosSinId.precioPreventa) || 0,
      sala: datosSinId.sala || 'sala 1',
      esMayor18: Boolean(datosSinId.esMayor18),
    };

    const { data, error } = await this.supabase
      .from('Peliculas') // Reemplaza por el nombre exacto de tu tabla en Supabase
      .update(payload)
      .eq('id', Number(id)); // Nos aseguramos de que el ID sea un número puro

    if (error) {
      console.error('Error al actualizar película:', error);
      return false;
    }

    return true;
  }

  async eliminarPelicula(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('Peliculas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar película:', error);
      return false;
    }

    await this.getPeliculas();
    return true;
  }
}