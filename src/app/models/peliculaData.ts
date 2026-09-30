export interface PeliculaData {
    id: number;
    titulo: string;
    sinopsis: string;
    duracionMinutos: number;
    imagenUrl: string;
    generos: string;
    EsteProximamente?: boolean;
    fechaEstreno?: string;
    enPreventa?: boolean;
    precio?: number;
    precioPreventa?: number;
    sala?: string;
    esMasVendida?: boolean;
    promedioEstrellas?: number;
    esMayor18?: boolean;
}