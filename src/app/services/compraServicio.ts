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
    fechaNacimiento?: string; // Formato YYYY-MM-DD para calcular +50 años
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

        // Disminuye la cantidad de un producto o lo elimina si llega a 0
    reducirProductoCandy(productoId: number | string) {
    const indice = this.productosCandy.findIndex(p => p.id === productoId);
    if (indice !== -1) {
        if ((this.productosCandy[indice].cantidad || 1) > 1) {
        this.productosCandy[indice].cantidad!--;
        } else {
        this.productosCandy.splice(indice, 1);
        }
    }
    }

    // Elimina completamente el producto del carrito sin importar la cantidad
    eliminarProductoCandy(productoId: number | string) {
    this.productosCandy = this.productosCandy.filter(p => p.id !== productoId);
    }

    // Helper para saber cuántas unidades de un producto hay seleccionadas
    getCantidadProducto(productoId: number | string): number {
    const encontrado = this.productosCandy.find(p => p.id === productoId);
    return encontrado?.cantidad || 0;
    }

    seleccionarAsientos(asientos: Butaca[]) {
        this.asientosSeleccionados = asientos;
    }

    // --- LÓGICA DE CÁLCULO DE DESCUENTOS ---

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

    /**
     * Obtiene el porcentaje de descuento a aplicar leyendo la config del Admin en Supabase
     */
    async calcularPorcentajeDescuento(): Promise<number> {
        if (!this.usuarioInfo.esRegistrado || !this.usuarioInfo.id) {
        return 0; // Usuarios no registrados / invitados no tienen descuento
        }

        try {
        // 1. Consultar configuración cargada por el Admin
        const { data: configs } = await this.supabase
            .from('configuraciones')
            .select('clave, valor');

        const porcPrimeraCompra = configs?.find(c => c.clave === 'descuento_primera_compra')?.valor || 20;
        const porcMayor50 = configs?.find(c => c.clave === 'descuento_mayor_50')?.valor || 20;

        // 2. Consultar si el usuario ya realizó compras previas
        const { count: totalCompras } = await this.supabase
            .from('compras')
            .select('id', { count: 'exact', head: true })
            .eq('usuarioId', this.usuarioInfo.id);

        let porcentajeAplicable = 0;

        // Regla A: Primera compra de usuario registrado
        if (totalCompras === 0) {
            porcentajeAplicable = Math.max(porcentajeAplicable, porcPrimeraCompra);
        }

        // Regla B: Mayor de 50 años
        const edad = this.calcularEdad(this.usuarioInfo.fechaNacimiento);
        if (edad >= 50) {
            porcentajeAplicable = Math.max(porcentajeAplicable, porcMayor50);
        }

        return porcentajeAplicable;
        } catch (err) {
        console.error('Error calculando descuento:', err);
        return 0;
        }
    }

    private generarCodigoQR(): string {
        return 'CINE-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Date.now();
    }

    // --- CONFIRMACIÓN Y GUARDADO DE COMPRA ---

    async confirmarYGuardarCompra(
        subtotal: number,
        creditoUsado: number = 0
    ): Promise<{ exito: boolean; codigoQR?: string; compraId?: number }> {
        try {
        const porcentajeDescuento = await this.calcularPorcentajeDescuento();
        const descuentoMonto = (subtotal * porcentajeDescuento) / 100;
        const totalFinal = Math.max(0, subtotal - descuentoMonto - creditoUsado);

        const codigoQR = this.generarCodigoQR();
        const puntosCalculados = Math.floor(totalFinal); // 1 punto por peso gastado (ajustable)

        // Inserción en la tabla 'compras' (usando los nombres de columnas de tu Supabase)
        const { data: compra, error: errorCompra } = await this.supabase
            .from('compras')
            .insert([{
            usuarioId: this.usuarioInfo.esRegistrado ? this.usuarioInfo.id : null,
            total: totalFinal,
            descuentoAplicado: descuentoMonto,
            creditoUsado: creditoUsado,
            puntosGanados: this.usuarioInfo.esRegistrado ? puntosCalculados : 0,
            codigoQr: codigoQR,
            qrEntradaValidado: false,
            qrCandyValidado: false,
            estado: 'CONFIRMADA'
            }])
            .select()
            .single();

        if (errorCompra || !compra) {
            console.error('Error al insertar en compras:', errorCompra);
            return { exito: false };
        }

        const detalles: any[] = [];

        // A) Entradas de cine
        this.asientosSeleccionados.forEach(asiento => {
            detalles.push({
            compraId: compra.id,
            tipo: 'ENTRADA',
            peliculaId: this.peliculaSeleccionada?.id || null,
            asiento: `${asiento.fila}-${asiento.columna}`,
            cantidad: 1,
            precioUnitario: asiento.precio || 5000
            });
        });

        // B) Productos del Candy
        this.productosCandy.forEach(p => {
            detalles.push({
            compraId: compra.id,
            tipo: 'CANDY',
            productoId: p.id,
            cantidad: p.cantidad || 1,
            precioUnitario: p.precio
            });
        });

        if (detalles.length > 0) {
            const { error: errorDetalles } = await this.supabase
            .from('detalleCompras')
            .insert(detalles);

            if (errorDetalles) {
            console.error('Error al guardar el detalleCompras:', errorDetalles);
            return { exito: false };
            }
        }

        return { exito: true, codigoQR, compraId: compra.id };

        } catch (err) {
        console.error('Excepción al confirmar compra:', err);
        return { exito: false };
        }
    }

    
    getResumenCompra() {
    return {
        asientos: this.asientosSeleccionados,
        candy: this.productosCandy,
        usuario: this.usuarioInfo,
        pelicula: this.peliculaSeleccionada,
        funcionId: this.funcionId,
        fecha: this.fechaSeleccionada,
        horario: this.horarioSeleccionado
    };
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