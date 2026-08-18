import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent, ButtonComponent],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
})
export class CreateAccountComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Cadastre-se', href: '/cadastre-se' },
  ];

  email = '';
  password = '';
  showPassword = false;
  rememberMe = false;
  submitting = signal(false);
  error = signal<string | null>(null);

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error.set('Preencha e-mail e senha para continuar.');
      return;
    }
    this.error.set(null);
    this.submitting.set(true);

    this.authService.login({ email: this.email, senha: this.password }).subscribe({
      next: () => {
        this.submitting.set(false);
        // Login é só para equipe editorial (Admin/Editor) — vai direto pro painel.
        // Se o guard mandou pra cá a partir de uma rota /admin específica, volta pra ela.
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirect ?? '/admin');
      },
      error: (erro: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(erro.error?.mensagem ?? 'Não foi possível entrar. Tente novamente.');
      },
    });
  }
}
