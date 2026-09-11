import { Component, Input, input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-hijo',
  styleUrl: './hijo.css',
  templateUrl: './hijo.html',
})
export class Hijo implements OnChanges{
  dataSignal = input();
  
  @Input() data: any;
  ngOnChanges(changes: SimpleChanges): void {
    
  }
}
