import { Injectable, computed, signal } from '@angular/core';

/**
 * Contador de requisições HTTP em voo, alimentado pelo loadingInterceptor.
 * Um único indicador global (barra de carregamento no topo) em vez de cada
 * página precisar do próprio estado de "carregando" — a tela ficava em
 * branco sem nenhum sinal visual até os dados chegarem.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private requisicoesEmVoo = signal(0);

  emAndamento = computed(() => this.requisicoesEmVoo() > 0);

  iniciar(): void {
    this.requisicoesEmVoo.update((n) => n + 1);
  }

  finalizar(): void {
    this.requisicoesEmVoo.update((n) => Math.max(0, n - 1));
  }
}
