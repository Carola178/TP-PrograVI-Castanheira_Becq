import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminFunciones } from './admin-funciones/admin-funciones';
import { AdminCandy } from './admin-candy/admin-candy';
import { AdminDescuentos } from './admin-descuentos/admin-descuentos';
import { AdminReportes } from './admin-reportes/admin-reportes';
import { AdminLog } from './admin-log/admin-log';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, AdminFunciones, AdminCandy, AdminDescuentos, AdminReportes, AdminLog],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  seccionActual: string = 'funciones'; 
}