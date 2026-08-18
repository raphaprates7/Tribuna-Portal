import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent, ButtonComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Esqueci minha senha', href: '/esqueci-senha' },
  ];

  email = '';
  submitting = signal(false);
  error = signal<string | null>(null);
  enviado = signal(false);

  onSubmit(): void {
    if (!this.email) {
      this.error.set('Informe o seu e-mail para continuar.');
      return;
    }
    this.error.set(null);
    this.submitting.set(true);

    this.authService.esqueciSenha(this.email).subscribe({
      next: () => {
        this.submitting.set(false);
        this.enviado.set(true);
      },
      error: (erro: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(erro.error?.mensagem ?? 'Não foi possível processar o pedido. Tente novamente.');
      },
    });
  }
}
