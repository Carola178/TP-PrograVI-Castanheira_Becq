export interface PeliculaData {
    id: number;
    created_at?: string;
    titulo: string;
    sinopsis?: string;
    duracionMinutos?: number;
    imagenUrl?: string;
    generos?: string;
    esMasVendida?: boolean;
    enPreventa?: boolean;
    precioPreventa?: number;
    promedioEstrellas?: number;
}