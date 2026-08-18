import { Component, OnInit, signal, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavigationService } from '../../../core/services/navigation.service';
import { NavItem } from '../../../core/models/navigation.model';
import { IconComponent } from '../../components/icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  navItems = signal<NavItem[]>([]);
  openIndex = signal<number | null>(null);
  mobileOpen = signal(false);
  searchQuery = '';

  private authService = inject(AuthService);

  usuario = this.authService.usuario;
  isEditorial = this.authService.isEditorial;

  constructor(
    private navigationService: NavigationService,
    private elementRef: ElementRef<HTMLElement>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.navigationService.getNavigation().subscribe((items) => this.navItems.set(items));
    // Restaura a sessão via cookie de refresh (ex.: depois de um F5) sem forçar login.
    this.authService.garantirSessao().subscribe();
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openIndex.update((current) => (current === index ? null : index));
  }

  closeMenu(): void {
    this.openIndex.set(null);
  }

  toggleMobileMenu(): void {
    this.mobileOpen.update((current) => !current);
  }

  closeMobileMenu(): void {
    this.mobileOpen.set(false);
  }

  submitSearch(): void {
    const q = this.searchQuery.trim();
    this.closeMobileMenu();
    this.router.navigate(['/busca'], { queryParams: q ? { q } : {} });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeMenu();
      this.closeMobileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
    this.closeMobileMenu();
  }
}
