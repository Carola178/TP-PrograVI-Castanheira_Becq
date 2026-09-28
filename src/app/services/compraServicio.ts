import { Injectable } from '@angular/core';
import { PeliculaData } from '../models/peliculaData';
import { Butaca } from '../models/butacaData';

export interface ProductoCandy {
    id: number | string;
    nombre: string;
    precio: number;
    cantidad?: number;
    }

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
    public funcionId: number | string | null = null;
    public fechaSeleccionada: string = '';
    public horarioSeleccionado: string = '';
    public idiomaSeleccionado: string = 'Castellano';
    public dimensionSeleccionada: string = '2D';

    public asientosSeleccionados: Butaca[] = [];
    public productosCandy: ProductoCandy[] = [];

    public usuarioInfo: UsuarioCompra = {
        esRegistrado: false,
        esPrimeraCompra: false,
        creditoDisponible: 0
    };

    private _peliculaSeleccionada: PeliculaData | null = null;

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

    seleccionarFuncion(pelicula: PeliculaData, funcion?: any) {
        this.peliculaSeleccionada = pelicula;
        if (funcion) {
        this.funcionId = funcion.id || null;
        this.fechaSeleccionada = funcion.fecha || '';
        this.horarioSeleccionado = funcion.horario || '';
        this.idiomaSeleccionado = funcion.idioma || 'Castellano';
        this.dimensionSeleccionada = funcion.dimension || '2D';
        }
    }

    agregarProductoCandy(producto: ProductoCandy) {
        const existente = this.productosCandy.find(p => p.id === producto.id);
        if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1;
        } else {
        this.productosCandy.push({
            ...producto,
            cantidad: producto.cantidad || 1
        });
        }
    }

    seleccionarAsientos(asientos: Butaca[]) {
        this.asientosSeleccionados = asientos;
    }

    getResumenCompra() {
        return {
        pelicula: this.peliculaSeleccionada,
        fecha: this.fechaSeleccionada,
        horario: this.horarioSeleccionado,
        idioma: this.idiomaSeleccionado,
        dimension: this.dimensionSeleccionada,
        asientos: this.asientosSeleccionados,
        candy: this.productosCandy,
        usuario: this.usuarioInfo
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