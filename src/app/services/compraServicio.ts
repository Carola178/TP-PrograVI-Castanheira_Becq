import { Injectable } from '@angular/core';
import { Butaca } from '../models/butacaData';

export interface ProductoCandy {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
}

@Injectable({
    providedIn: 'root'
})
export class CompraServicio {
    funcionId: number | null = null;
    asientosSeleccionados: Butaca[] = [];
    productosCandy: ProductoCandy[] = [];

    setReservaInicial(funcionId: number, asientos: Butaca[]) {
        this.funcionId = funcionId;
        this.asientosSeleccionados = asientos;
    }

    setProductosCandy(productos: ProductoCandy[]) {
        this.productosCandy = productos;
    }

    getResumenCompra() {
    return {
        funcionId: this.funcionId,
        asientos: this.asientosSeleccionados,
        candy: this.productosCandy
    };
    }

    limpiar() {
    this.funcionId = null;
    this.asientosSeleccionados = [];
    this.productosCandy = [];
    }
}