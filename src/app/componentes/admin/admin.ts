import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importación de subcomponentes requeridos
import { AdminFunciones } from './admin-funciones/admin-funciones';
import { AdminCandy } from './admin-candy/admin-candy';
import { AdminDescuentos } from './admin-descuentos/admin-descuentos';

// Tipo estricto para las 3 secciones activas
export type SeccionAdmin = 'funciones' | 'candy' | 'descuentos';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, AdminFunciones, AdminCandy, AdminDescuentos],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  // Sección activa por defecto
  seccionActual: SeccionAdmin = 'funciones';

  // /**
  //  * Cambia la sección activa del panel de administración
  //  * @param seccion Nombre de la sección a activar
  //  */
  cambiarSeccion(seccion: SeccionAdmin): void {
    this.seccionActual = seccion;
  }
}