import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class About implements AfterViewInit {
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
