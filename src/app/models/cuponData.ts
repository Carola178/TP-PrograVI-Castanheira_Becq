export interface ConfiguracionPuntos {
    id?: number;
    puntosPorMonto: number;           
    descuentoPrimeraCompra: number;   
    descuentoMayores50: number;         
}

export interface Cupon {
    id?: number;
    codigo: string;
    porcentajeDescuento: number;
    activo: boolean;
    montoMinimo?: number;
    fechaExpiracion?: string;
    created_at?: string;
}