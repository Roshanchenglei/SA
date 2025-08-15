import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-quasars',
  standalone: false,
  templateUrl: './quasars.html',
  styleUrl: './quasars.css'
})
export class Quasars implements AfterViewInit {
  isVisible = false;

  @ViewChild('lazyImage', { static: true }) image!: ElementRef;

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          observer.disconnect();
        }
      });
    });

    if (this.image && this.image.nativeElement) {
      observer.observe(this.image.nativeElement);
    }
  }
}

