import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-teach',
  standalone: false,
  templateUrl: './teach.html',
  styleUrl: './teach.css'
})
export class Teach {
  @Input() title: string = 'Help';
  @Input() content: string = 'This is the default help content.';

  @Output() closeHelp = new EventEmitter<void>();

  close() {
    this.closeHelp.emit();
  }
}
