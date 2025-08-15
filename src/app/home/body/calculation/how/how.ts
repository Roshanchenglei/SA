import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-how',
  standalone: false,
  templateUrl: './how.html',
  styleUrl: './how.css'
})
export class How {
  @Input() videoId: string = '';
  isIframeLoaded: boolean = false;

  get thumbnailUrl(): string {
    return `https://img.youtube.com/vi/${this.videoId}/hqdefault.jpg`;
  }

  loadVideo() {
    this.isIframeLoaded = true;
  }
}
