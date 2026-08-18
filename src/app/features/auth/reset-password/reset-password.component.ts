import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthService } from '../../../core/services/auth.service';
import { extrairMensagemErro } from '../../../core/utils/erro.util';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent, ButtonComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Redefinir senha', href: '/redefinir-senha' },
  ];

  private email = '';
  private token = '';
  novaSenha = '';
  confirmarSenha = '';
  submitting = signal(false);
  error = signal<string | null>(null);
  linkInvalido = signal(false);

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    this.email = params.get('email') ?? '';
    this.token = params.get('token') ?? '';
    if (!this.email || !this.token) {
      this.linkInvalido.set(true);
    }
  }

  onSubmit(): void {
    if (!this.novaSenha || this.novaSenha !== this.confirmarSenha) {
      this.error.set('As senhas informadas não conferem.');
      return;
    }
    this.error.set(null);
    this.submitting.set(true);

    this.authService.redefinirSenha(this.email, this.token, this.novaSenha).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/cadastre-se']);
      },
      error: (erro: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(extrairMensagemErro(erro, 'Não foi possível redefinir a senha. Solicite um novo link.'));
      },
    });
  }
}
