import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../enviroments/enviroments';
import { PeliculaData } from '../models/peliculaData';
import { Butaca } from '../models/butacaData';
import { Producto } from '../models/productoData';

export interface UsuarioCompra {
    id?: string;
    esRegistrado: boolean;
    esPrimeraCompra: boolean;
    creditoDisponible: number;
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
    public productosCandy: Producto[] = [];

    public usuarioInfo: UsuarioCompra = {
        esRegistrado: false,
        esPrimeraCompra: false,
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

    seleccionarFuncion(pelicula: PeliculaData) {
        this.peliculaSeleccionada = pelicula;
    }

    agregarProductoCandy(producto: Producto) {
        const existente = this.productosCandy.find(p => p.id === producto.id);
        if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1;
        } else {
        this.productosCandy.push({
            ...producto,
            cantidad: 1
        });
        }
    }

    seleccionarAsientos(asientos: Butaca[]) {
        this.asientosSeleccionados = asientos;
    }


    private generarCodigoQR(): string {
        return 'CINE-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Date.now();
    }


    async confirmarYGuardarCompra(montoTotal: number, descuentoAplicado: number = 0): Promise<{ exito: boolean; codigoQR?: string; compraId?: number }> {
        try {
        const codigoQR = this.generarCodigoQR();
        const puntosCalculados = Math.floor(montoTotal);

        const { data: compra, error: errorCompra } = await this.supabase
            .from('compras')
            .insert([{
            usuario_id: this.usuarioInfo.esRegistrado ? this.usuarioInfo.id : null,
            total: montoTotal,
            descuento_aplicado: descuentoAplicado,
            puntos_ganados: this.usuarioInfo.esRegistrado ? puntosCalculados : 0,
            codigo_qr: codigoQR,
            qr_validado: false,
            estado: 'CONFIRMADA'
            }])
            .select()
            .single();

        if (errorCompra || !compra) {
            console.error('Error al insertar en la tabla compras:', errorCompra);
            return { exito: false };
        }

        const detalles: any[] = [];

        // A) Entradas de cine
        this.asientosSeleccionados.forEach(asiento => {
            detalles.push({
            compra_id: compra.id,
            tipo_item: 'ENTRADA',
            pelicula_id: this.peliculaSeleccionada?.id || null,
            asiento: `${asiento.fila}-${asiento.columna}`,
            cantidad: 1,
            precio_unitario: asiento.precio || 5000
            });
        });

        // B) Productos del Candy Bar
        this.productosCandy.forEach(p => {
            detalles.push({
            compra_id: compra.id,
            tipo_item: 'CANDY',
            producto_id: p.id,
            cantidad: p.cantidad || 1,
            precio_unitario: p.precio
            });
        });

        if (detalles.length > 0) {
            const { error: errorDetalles } = await this.supabase
            .from('detalle_compras')
            .insert(detalles);

            if (errorDetalles) {
            console.error('Error al guardar el detalle de compra:', errorDetalles);
            return { exito: false };
            }
        }

        return { exito: true, codigoQR, compraId: compra.id };

        } catch (err) {
        console.error('Excepción al confirmar compra:', err);
        return { exito: false };
        }
    }

    limpiar() {
        this._peliculaSeleccionada = null;
        localStorage.removeItem('pelicula_seleccionada');
        this.funcionId = null;
        this.fechaSeleccionada = '';
        this.horarioSeleccionado = '';
        this.idiomaSeleccionado = 'Castellano';
        this.dimensionSeleccionada = '2D';
        this.asientosSeleccionados = [];
        this.productosCandy = [];
    }
}