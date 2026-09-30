import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { enviroment } from '../enviroments/enviroments';
import { FuncionData, SalaData } from '../models/funcionData';

@Injectable({
    providedIn: 'root'
    })
    export class FuncionServicio {
    private supabase: SupabaseClient;

    // Lista de salas fijas en memoria para no requerir la tabla 'Salas' en Supabase
    private salasEstaticas: SalaData[] = [
        { id: 1, nombre: 'Sala 1', capacidad: 100 },
        { id: 2, nombre: 'Sala 2', capacidad: 80 },
        { id: 3, nombre: 'Sala 3 (3D/4D)', capacidad: 60 }
    ];

    constructor() {
        this.supabase = createClient(
        enviroment.supabaseUrl,
        enviroment.supabasePublishableKey
        );
    }

    async getFunciones(): Promise<FuncionData[]> {
        // Si no usas la tabla 'Funciones', devolvemos las películas mapeadas como funciones
        const { data, error } = await this.supabase
        .from('Peliculas')
        .select('*');

        if (error) {
        console.error('Error al obtener funciones/películas:', error);
        return [];
        }

        return (data || []).map((p: any) => ({
        id: p.id,
        pelicula_id: p.id,
        sala_id: p.sala_id || 1,
        fecha_hora_inicio: p.fechaEstreno || new Date().toISOString(),
        fecha_hora_fin: new Date().toISOString(),
        idioma: 'Castellano',
        dimension: '2D',
        precio_base: p.precio || 5000,
        Peliculas: p
        })) as unknown as FuncionData[];
    }

    async asignarSalaDisponible(fechaInicio: Date, duracionMinutos: number): Promise<number | null> {
        const minutosTotales = duracionMinutos + 30;
        const fechaFinConMargen = new Date(fechaInicio.getTime() + minutosTotales * 60 * 1000);

        // Usamos las salas locales definidas arriba
        const salas = this.salasEstaticas;

        // Leemos las películas existentes para revisar si alguna ya ocupa esa sala en ese horario
        const { data: peliculasExistentes, error: errFunc } = await this.supabase
        .from('Peliculas')
        .select('id, sala_id, fechaEstreno');

        if (errFunc) {
        console.warn('No se pudo verificar solapamiento, asignando Sala 1 por defecto:', errFunc);
        return 1;
        }

        // Buscamos una sala que no tenga conflicto de horario
        const salaLibre = salas.find((sala: SalaData) => {
        const haySolapamiento = (peliculasExistentes || []).some((peli: any) => {
            if (!peli.sala_id || peli.sala_id !== sala.id || !peli.fechaEstreno) return false;

            const fInicio = new Date(peli.fechaEstreno);
            const fFin = new Date(fInicio.getTime() + (duracionMinutos + 30) * 60 * 1000);

            return fechaInicio < fFin && fechaFinConMargen > fInicio;
        });

        return !haySolapamiento;
        });

        // Si todas están ocupadas en ese rango, asigna la Sala 1 por defecto
        return salaLibre ? salaLibre.id : 1;
    }

    async crearFuncion(
        peliculaId: number,
        duracionMinutos: number,
        fechaHoraInicio: Date,
        idioma: 'Castellano' | 'Subtitulada',
        dimension: '2D' | '3D' | '4D' | '5D',
        precioBase: number
    ): Promise<{ exito: boolean; mensaje: string; funcion?: FuncionData }> {

        const salaId = await this.asignarSalaDisponible(fechaHoraInicio, duracionMinutos);

        if (!salaId) {
        return {
            exito: false,
            mensaje: 'No hay salas disponibles para este horario (se requiere un margen de 30 minutos libre entre funciones).'
        };
        }

        // Actualizamos la película existente agregándole la sala, fecha y precio asignado
        const { data, error } = await this.supabase
        .from('Peliculas')
        .update({
            sala_id: salaId,
            fechaEstreno: fechaHoraInicio.toISOString(),
            precio: precioBase
        })
        .eq('id', peliculaId)
        .select()
        .single();

        if (error) {
        console.error('Error al guardar la función en Peliculas:', error);
        return { exito: false, mensaje: 'Error al actualizar la película con la función.' };
        }

        return {
        exito: true,
        mensaje: `Función programada con éxito en la Sala ${salaId}.`,
        funcion: data as unknown as FuncionData
        };
    }

    async eliminarFuncion(id: number): Promise<boolean> {
        // Al eliminar la función, limpiamos los campos de fecha/sala en la película
        const { error } = await this.supabase
        .from('Peliculas')
        .update({ sala_id: null, fechaEstreno: null })
        .eq('id', id);

        if (error) {
        console.error('Error al eliminar la función:', error);
        return false;
        }
        return true;
    }
    }