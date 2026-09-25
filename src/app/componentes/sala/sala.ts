import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; 
import { RealtimeChannel } from '@supabase/supabase-js';
import { SalaServicio } from '../../services/salaServicio';
import { Butaca } from '../../models/butacaData';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sala.html',
  styleUrl: './sala.css'
})
export class Sala implements OnInit, OnDestroy {
  funcionId: number = 1;
  filasLetras: string[] = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
  
  bloqueIzq: number[] = [1, 2, 3, 4];
  bloqueCentro: number[] = Array.from({ length: 20 }, (_, i) => i + 6);
  bloqueDer: number[] = [27, 28, 29, 30];

  matrizButacas: { [key: string]: Butaca } = {};
  asientosSeleccionados: Butaca[] = [];
  private canalRealtime!: RealtimeChannel;

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inyección de Router agregada
    private salaServicio: SalaServicio,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('funcionId');
    if (id) this.funcionId = Number(id);

    this.inicializarMapa();
    await this.cargarReservasExistentes();
    this.iniciarRealtime();
  }

  inicializarMapa() {
    const filasVip = ['R', 'S', 'T']; 
    
    this.filasLetras.forEach(fila => {
      const esVip = filasVip.includes(fila);
      const totalCols = [...this.bloqueIzq, ...this.bloqueCentro, ...this.bloqueDer];
      
      totalCols.forEach(col => {
        const key = `${fila}-${col}`;
        this.matrizButacas[key] = {
          fila,
          columna: col,
          esVip,
          ocupada: false
        };
      });
    });
  }

  async cargarReservasExistentes() {
    const ocupadas = await this.salaServicio.getButacasOcupadas(this.funcionId);
    ocupadas.forEach((reserva: any) => {
      const key = `${reserva.fila}-${reserva.columna}`;
      if (this.matrizButacas[key]) {
        this.matrizButacas[key].ocupada = true;
      }
    });
    this.cdr.detectChanges();
  }

  iniciarRealtime() {
    this.canalRealtime = this.salaServicio.suscribirAButacas(this.funcionId, (payload) => {
      if (payload.eventType === 'INSERT') {
        const nueva = payload.new;
        const key = `${nueva.fila}-${nueva.columna}`;
        
        if (this.matrizButacas[key]) {
          this.matrizButacas[key].ocupada = true;
          this.asientosSeleccionados = this.asientosSeleccionados.filter(
            b => !(b.fila === nueva.fila && b.columna === nueva.columna)
          );
        }
        this.cdr.detectChanges();
      }
    });
  }

  toggleSeleccion(butaca: Butaca) {
    if (!butaca || butaca.ocupada) return;

    butaca.seleccionada = !butaca.seleccionada;
    if (butaca.seleccionada) {
      this.asientosSeleccionados.push(butaca);
    } else {
      this.asientosSeleccionados = this.asientosSeleccionados.filter(
        b => !(b.fila === butaca.fila && b.columna === butaca.columna)
      );
    }
  }

  async confirmarReserva() {
    if (this.asientosSeleccionados.length === 0) return;

    try {
      await this.salaServicio.reservarButacas(this.funcionId, this.asientosSeleccionados);
      
      this.router.navigate(['/candy']);
    } catch (err) {
      alert('Ocurrió un error o algún asiento ya fue reservado.');
    }
  }

  ngOnDestroy() {
    if (this.canalRealtime) {
      this.canalRealtime.unsubscribe();
    }
  }
}