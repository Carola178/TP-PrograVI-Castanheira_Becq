import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { enviroment } from '../enviroments/enviroments';

@Injectable({
    providedIn: 'root'
})
export class ProductosServicio {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
        enviroment.supabaseUrl,
        enviroment.supabasePublishableKey
        );
    }

    async getProductos() {
    const { data, error } = await this.supabase
        .from('Productos')
        .select('*');

    if (error) {
        console.error('Error obteniendo productos:', error);
        return [];
    }

    return data;
    }
}