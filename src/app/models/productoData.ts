export interface Producto {
    id?: number;
    created_at?: string;
    nombre: string;
    categoria: string;
    descripcion: string;
    imagen_url: string;
    precio: number;
    puntos_canje: number;
    combo_especial: boolean;
    descuento_semanal?: string | null;
    cantidad?: number;
}