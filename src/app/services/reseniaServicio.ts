import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../enviroments/enviroments';
import { Resenia } from './../models/reseniaData';

@Injectable({
  providedIn: 'root'
})
export class ReseniaServicio {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabasePublishableKey);
  }

  async getReviewsByMovie(peliculaId: number): Promise<Resenia[]> {
    const { data, error } = await this.supabase
      .from('reseñas')
      .select('*, Usuarios(nombre, apellido)')
      .eq('peliculaid', peliculaId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMovieRatingSummary(peliculaId: number) {
    const { data, error } = await this.supabase
      .from('reseñas')
      .select('rating')
      .eq('peliculaid', peliculaId);

    if (error) throw error;
    if (!data || data.length === 0) return { average: 0, count: 0 };

    const total = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = Number((total / data.length).toFixed(1));

    return { average, count: data.length };
  }

  async addReview(review: Omit<Resenia, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('reseñas')
      .insert([review]);

    if (error) throw error;
    return data;
  }
}