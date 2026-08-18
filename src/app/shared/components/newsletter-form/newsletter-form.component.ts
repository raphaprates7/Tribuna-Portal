import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonComponent } from '../button/button.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-newsletter-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './newsletter-form.component.html',
  styleUrl: './newsletter-form.component.scss',
})
export class NewsletterFormComponent {
  private http = inject(HttpClient);

  @Input() placeholder = 'Seu e-mail';
  @Input() ctaLabel = 'Inscrever';

  email = '';
  submitted = signal(false);
  enviando = signal(false);

  onSubmit(): void {
    if (!this.email.includes('@') || this.enviando()) {
      return;
    }

    this.enviando.set(true);
    this.http.post(`${environment.apiBaseUrl}/newsletter`, { email: this.email }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.enviando.set(false);
      },
    });
  }
}
