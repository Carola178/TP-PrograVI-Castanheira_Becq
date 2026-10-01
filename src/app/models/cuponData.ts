export interface Cupon {
    id?: number;
    codigo: string;
    porcentaje_descuento: number;
    solo_mayores_edad: boolean;
    activo: boolean;
    created_at?: string;
}

export interface ConfiguracionPuntos {
    id?: number;
    descuento_primera_compra: number; 
    puntos_por_peso: number;           
    puntos_por_entrada: number;        
}