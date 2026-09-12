import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('tp-cine');

  constructor(private router: Router){
  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }
}
