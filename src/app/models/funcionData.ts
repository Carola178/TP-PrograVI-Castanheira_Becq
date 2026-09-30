import { PeliculaData } from './peliculaData';

export interface FuncionData {
    id?: number;
    pelicula_id: number;
    sala_id: number;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    idioma: 'Castellano' | 'Subtitulada';
    dimension: '2D' | '3D' | '4D' | '5D';
    precio_base: number;
    pelicula?: PeliculaData;
}

export interface SalaData {
    id: number;
    nombre: string;
    capacidad: number;
}