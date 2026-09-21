import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PeliculaData } from '../../models/peliculaData';
import { PeliculaServicio } from '../../services/peliculaServicio';

@Component({
  selector: 'app-pelicula',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pelicula.html',
  styleUrl: './pelicula.css'
})
export class Pelicula implements OnInit {
  pelicula: PeliculaData | null = null;

  constructor(
    private route: ActivatedRoute,
    private peliculaServicio: PeliculaServicio
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pelicula = await this.peliculaServicio.getPeliculaPorId(id);
    }
  }
}