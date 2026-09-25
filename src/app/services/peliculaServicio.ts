import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { enviroment } from '../enviroments/enviroments';
import { PeliculaData } from '../models/peliculaData';

@Injectable({
  providedIn: 'root'
})
export class PeliculaServicio { 
  private supabase: SupabaseClient;

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
      console.error('Error al cargar películas:', error);
      return [];
    }
    return data as PeliculaData[];
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
      esMasVendida: data.esMasVendida ?? data.es_mas_vendida,
      enPreventa: data.enPreventa ?? data.en_preventa,
      precioPreventa: data.precioPreventa ?? data.precio_preventa,
      promedioEstrellas: data.promedioEstrellas ?? data.promedio_estrellas
    };
  }
}