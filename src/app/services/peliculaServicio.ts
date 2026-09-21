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
      .from('Peliculas').select('*').eq('id', id).single();

    if (error) {
      console.error(`Error al obtener película con id ${id}:`, error);
      return null;
    }
    return data as PeliculaData;
  }
}