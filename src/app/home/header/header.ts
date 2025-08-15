import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  searchQuery: string = '';

  searchGoogle() {
    const query = encodeURIComponent(this.searchQuery.trim());
    if (query) {
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
  }

}
