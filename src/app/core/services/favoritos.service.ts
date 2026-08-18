import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { formatarDataBr } from '../utils/date.util';

export interface FavoritoItem {
  slug: string;
  title: string;
  image: string | null;
  date: string;
}

interface FavoritoApi {
  slug: string;
  titulo: string;
  imagemCapaUrl: string | null;
  publicadoEm: string | null;
}

const STORAGE_KEY = 'tribuna:favoritos';

/**
 * Sem login: favoritos ficam só no localStorage (como antes). Ao logar, os
 * favoritos salvos localmente são enviados pro servidor uma vez e, daí em
 * diante, a conta vira a fonte da verdade — o que permite ver os mesmos
 * favoritos em outro aparelho.
 */
@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly baseUrl = environment.apiBaseUrl;

  private itens = signal<FavoritoItem[]>(this.carregarLocal());
  private sincronizado = false;

  favoritos = computed(() => this.itens());
  quantidade = computed(() => this.itens().length);

  constructor() {
    effect(() => {
      const logado = !!this.authService.usuario();
      if (logado && !this.sincronizado) {
        this.sincronizado = true;
        this.sincronizarComServidor();
      } else if (!logado && this.sincronizado) {
        this.sincronizado = false;
        this.itens.set(this.carregarLocal());
      }
    });
  }

  isFavorito(slug: string) {
    return computed(() => this.itens().some((item) => item.slug === slug));
  }

  alternar(item: FavoritoItem): void {
    if (this.itens().some((f) => f.slug === item.slug)) {
      this.remover(item.slug);
      return;
    }

    this.itens.set([item, ...this.itens()]);

    if (this.authService.usuario()) {
      this.http.post(`${this.baseUrl}/favoritos/${item.slug}`, {}).subscribe();
    } else {
      this.salvarLocal(this.itens());
    }
  }

  remover(slug: string): void {
    const proximo = this.itens().filter((f) => f.slug !== slug);
    this.itens.set(proximo);

    if (this.authService.usuario()) {
      this.http.delete(`${this.baseUrl}/favoritos/${slug}`).subscribe();
    } else {
      this.salvarLocal(proximo);
    }
  }

  private sincronizarComServidor(): void {
    const locais = this.carregarLocal();
    if (!locais.length) {
      this.recarregarDoServidor();
      return;
    }

    const envios = locais.map((item) => this.http.post(`${this.baseUrl}/favoritos/${item.slug}`, {}));
    forkJoin(envios).subscribe({
      next: () => this.recarregarDoServidor(),
      error: () => this.recarregarDoServidor(),
    });
  }

  private recarregarDoServidor(): void {
    this.http.get<FavoritoApi[]>(`${this.baseUrl}/favoritos`).subscribe((favoritos) => {
      this.itens.set(
        favoritos.map((f) => ({
          slug: f.slug,
          title: f.titulo,
          image: f.imagemCapaUrl,
          date: formatarDataBr(f.publicadoEm),
        }))
      );
      if (this.isBrowser) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    });
  }

  private carregarLocal(): FavoritoItem[] {
    if (!this.isBrowser) {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as FavoritoItem[]) : [];
    } catch {
      return [];
    }
  }

  private salvarLocal(itens: FavoritoItem[]): void {
    if (!this.isBrowser) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
  }
}
