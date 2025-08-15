import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(private router: Router) {}
  ngOnInit():void {
    // Automatically navigate to 'galaxy' when HomeComponent loads
    this.router.navigate(['home/about']);
  }
 footerVisible = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    this.footerVisible = (scrollTop + clientHeight) >= (scrollHeight - 5);
  }
}
