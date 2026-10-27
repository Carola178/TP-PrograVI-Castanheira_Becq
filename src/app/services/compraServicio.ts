import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../enviroments/enviroments'; 
import { PeliculaData } from '../models/peliculaData';
import { Butaca } from '../models/butacaData';
import { Producto } from '../models/productoData';

export interface UsuarioCompra {
    id?: string;
    esRegistrado: boolean;
    creditoDisponible: number;
    fechaNacimiento?: string;
}

export interface ConfiguracionDescuento {
    clave: string;
    valor: number;
    descripcion?: string;
}

export interface ItemCandySeleccionado {
    producto: Producto;
    cantidad: number;
}

@Injectable({
    providedIn: 'root'
})
export class CompraServicio {
    private supabase: SupabaseClient;

    public funcionId: number | string | null = null;
    public fechaSeleccionada: string = '';
    public horarioSeleccionado: string = '';
    public idiomaSeleccionado: string = 'Castellano';
    public dimensionSeleccionada: string = '2D';

    public asientosSeleccionados: Butaca[] = [];
    public productosCandy: ItemCandySeleccionado[] = [];

    public usuarioInfo: UsuarioCompra = {
        esRegistrado: false,
        creditoDisponible: 0
    };

    private _peliculaSeleccionada: PeliculaData | null = null;

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabasePublishableKey);
    }

    get peliculaSeleccionada(): PeliculaData | null {
        if (!this._peliculaSeleccionada) {
            const guardada = localStorage.getItem('pelicula_seleccionada');
            if (guardada) {
                try {
                    this._peliculaSeleccionada = JSON.parse(guardada);
                } catch (e) {
                    console.error('Error al parsear película guardada', e);
                }
            }
        }
        return this._peliculaSeleccionada;
    }

    set peliculaSeleccionada(pelicula: PeliculaData | null) {
        this._peliculaSeleccionada = pelicula;
        if (pelicula) {
            localStorage.setItem('pelicula_seleccionada', JSON.stringify(pelicula));
        } else {
            localStorage.removeItem('pelicula_seleccionada');
        }
    }

    seleccionarFuncion(pelicula: PeliculaData | any, funcionId?: number | string): void {
        if (pelicula) {
            this.peliculaSeleccionada = pelicula;
        }
        if (funcionId !== undefined) {
            this.funcionId = funcionId;
        }
    }

    seleccionarAsientos(asientos: Butaca[], funcionId?: number | string): void {
        this.asientosSeleccionados = asientos;
        if (funcionId !== undefined) {
            this.funcionId = funcionId;
        }
    }

    agregarProductoCandy(producto: Producto): void {
        const index = this.productosCandy.findIndex(item => item.producto.id === producto.id);
        if (index >= 0) {
            this.productosCandy[index].cantidad++;
        } else {
            this.productosCandy.push({ producto, cantidad: 1 });
        }
    }

    reducirProductoCandy(productoId: number | string): void {
        const index = this.productosCandy.findIndex(item => item.producto.id === productoId);
        if (index >= 0) {
            this.productosCandy[index].cantidad--;
            if (this.productosCandy[index].cantidad <= 0) {
                this.productosCandy.splice(index, 1);
            }
        }
    }

    getCantidadProducto(productoId: number | string): number {
        const item = this.productosCandy.find(i => i.producto.id === productoId);
        return item ? item.cantidad : 0;
    }

    getResumenCompra() {
        const totalEntradas = this.asientosSeleccionados.reduce((acc, b: any) => {
            const fila = b?.fila?.toUpperCase();
            const esVip = b?.esVip || ['R', 'S', 'T'].includes(fila);
            const precioBase = esVip ? 7500 : 5000;
            return acc + (Number(b.precio) || precioBase);
        }, 0);

        const totalCandy = this.productosCandy.reduce((acc, item: any) => {
            const precio = Number(item?.producto?.precio) || Number(item?.precio) || 0;
            const cant = Number(item?.cantidad) || 1;
            return acc + (precio * cant);
        }, 0);
        
        return {
            pelicula: this.peliculaSeleccionada,
            funcionId: this.funcionId,
            asientos: this.asientosSeleccionados,
            candy: this.productosCandy,
            usuario: this.usuarioInfo,
            totalEntradas,
            totalCandy,
            totalGeneral: totalEntradas + totalCandy
        };
    }

    async confirmarYGuardarCompra(
        montoOMetodo: string | number = 'Efectivo',
        creditoAplicado: number = 0,
        montoDescuento: number = 0
    ): Promise<{ exito: boolean; codigoQR?: string; error?: any }> {
        try {
            const resumen = this.getResumenCompra();
            let montoTotalCalculado = resumen.totalGeneral;

            if (typeof montoOMetodo === 'number') {
                montoTotalCalculado = montoOMetodo;
            }

            const subtotalConDescuento = Math.max(0, montoTotalCalculado - montoDescuento);
            const montoFinal = Math.max(0, subtotalConDescuento - creditoAplicado);
            const codigoQRGenerado = `CINE-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`;

            const compraData = {
                usuarioId: this.usuarioInfo.id || null,
                total: montoFinal,
                descuentoAplicado: montoDescuento,
                creditoUsado: creditoAplicado,
                puntosGanados: 0,
                puntosUsados: 0,
                codigoQr: codigoQRGenerado,
                estado: 'CONFIRMADA',
                qrEntradaValidado: false,
                qrCandyValidado: false
            };

            const { data, error } = await this.supabase
                .from('compras')
                .insert([compraData])
                .select()
                .single();

            if (error) {
                console.error('Error al registrar compra en Supabase:', error);
                return { exito: false, error };
            }

            return { 
                exito: true, 
                codigoQR: codigoQRGenerado 
            };
        } catch (err) {
            console.error('Error general en confirmarYGuardarCompra:', err);
            return { exito: false, error: err };
        }
    }

    limpiar(): void {
        this.funcionId = null;
        this.fechaSeleccionada = '';
        this.horarioSeleccionado = '';
        this.asientosSeleccionados = [];
        this.productosCandy = [];
        this.peliculaSeleccionada = null;
    }

    private calcularEdad(fechaNacimientoStr?: string): number {
        if (!fechaNacimientoStr) return 0;
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimientoStr);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }

    async calcularPorcentajeDescuento(): Promise<number> {
        if (!this.usuarioInfo.esRegistrado || !this.usuarioInfo.id) {
            return 0;
        }

        try {
            const { data: configs, error: errConfigs } = await this.supabase
                .from('configuracionesAdmin')
                .select('clave, valor');

            if (errConfigs) {
                console.error('Error al leer configuraciones desde BDD:', errConfigs);
            }

            const itemPrimera = configs?.find(c => c.clave === 'descuento_primera_compra');
            const itemMayorEdad = configs?.find(c => c.clave === 'descuento_mayor_edad');

            const porcPrimeraCompra = itemPrimera ? Number(itemPrimera.valor) : 20;
            const porcMayorEdad = itemMayorEdad ? Number(itemMayorEdad.valor) : 0;

            let totalCompras = 0;
            
            const res = await this.supabase
                .from('compras')
                .select('id', { count: 'exact', head: true })
                .eq('usuarioId', this.usuarioInfo.id);

            totalCompras = res.count || 0;

            let porcentajeAplicable = 0;

            if (totalCompras === 0) {
                porcentajeAplicable = Math.max(porcentajeAplicable, porcPrimeraCompra);
            }

            const edad = this.calcularEdad(this.usuarioInfo.fechaNacimiento);
            if (edad >= 18 && porcMayorEdad > 0) {
                porcentajeAplicable = Math.max(porcentajeAplicable, porcMayorEdad);
            }

            return porcentajeAplicable;

        } catch (err) {
            console.error('Error calculando descuento:', err);
            return 0;
        }
    }

    async obtenerConfiguracionesDescuentos(): Promise<ConfiguracionDescuento[]> {
        const { data, error } = await this.supabase
            .from('configuracionesAdmin')
            .select('clave, valor')
            .in('clave', ['descuento_primera_compra', 'descuento_mayor_edad']);

        if (error || !data || data.length === 0) {
            return [
                { clave: 'descuento_primera_compra', valor: 20 },
                { clave: 'descuento_mayor_edad', valor: 0 }
            ];
        }

        return data.map(item => ({
            clave: item.clave,
            valor: Number(item.valor)
        }));
    }

    async guardarPorcentajeDescuento(clave: string, nuevoPorcentaje: number): Promise<boolean> {
        try {
            const { data, error: updateError } = await this.supabase
                .from('configuracionesAdmin')
                .update({ valor: nuevoPorcentaje })
                .eq('clave', clave)
                .select();

            if (updateError) {
                console.error(`Error actualizando descuento ${clave}:`, updateError);
                return false;
            }

            if (!data || data.length === 0) {
                const { error: insertError } = await this.supabase
                    .from('configuracionesAdmin')
                    .insert({ clave: clave, valor: nuevoPorcentaje });

                if (insertError) {
                    console.error(`Error insertando descuento ${clave}:`, insertError);
                    return false;
                }
            }

            return true;
        } catch (err) {
            console.error(`Error general al guardar descuento ${clave}:`, err);
            return false;
        }
    }
}