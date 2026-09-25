import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { enviroment } from '../enviroments/enviroments';

@Injectable({
    providedIn: 'root'
})
export class SalaServicio {
    private supabase: SupabaseClient;

    constructor() {
    this.supabase = createClient(
        enviroment.supabaseUrl,
        enviroment.supabasePublishableKey
    );
}

async getButacasOcupadas(funcionId: number) {
    const { data, error } = await this.supabase
        .from('reserva_butacas')
        .select('fila, columna')
        .eq('funcion_id', funcionId);

    if (error) {
        console.error('Error al obtener reservas:', error);
        return [];
    }
    return data;
    }

suscribirAButacas(funcionId: number, callback: (payload: any) => void): RealtimeChannel {
    return this.supabase
        .channel(`sala-funcion-${funcionId}`)
        .on(
        'postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: 'reserva_butacas',
            filter: `funcion_id=eq.${funcionId}`
        },
        (payload) => callback(payload)).subscribe();
    }

async reservarButacas(funcionId: number, asientos: { fila: string; columna: number }[]) {
    const registros = asientos.map(a => ({
        funcion_id: funcionId,
        fila: a.fila,
        columna: a.columna,
        estado: 'ocupada'
    }));

const { data, error } = await this.supabase
        .from('reserva_butacas')
        .insert(registros);

    if (error) throw error;
    return data;
    }
}