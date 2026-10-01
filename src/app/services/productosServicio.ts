import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { enviroment } from '../enviroments/enviroments';
import { Producto } from '../models/productoData';

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

    async getProductos(): Promise<Producto[]> {
        const { data, error } = await this.supabase
        .from('Productos')
        .select('*')
        .order('id', { ascending: true });

        if (error) {
        console.error('Error obteniendo productos:', error);
        return [];
        }

        return data || [];
    }

    async crearProducto(producto: Producto): Promise<boolean> {
        const { error } = await this.supabase
        .from('Productos')
        .insert([producto]);

        if (error) {
        console.error('Error al crear producto:', error);
        return false;
        }
        return true;
    }

    async actualizarProducto(id: number, producto: Partial<Producto>): Promise<boolean> {
        const { error } = await this.supabase
        .from('Productos')
        .update(producto)
        .eq('id', id);

        if (error) {
        console.error('Error al actualizar producto:', error);
        return false;
        }
        return true;
    }

    async eliminarProducto(id: number): Promise<boolean> {
        const { error } = await this.supabase
        .from('Productos')
        .delete()
        .eq('id', id);

        if (error) {
        console.error('Error al eliminar producto:', error);
        return false;
        }
        return true;
    }
    }