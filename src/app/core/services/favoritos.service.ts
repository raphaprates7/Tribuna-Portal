import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface FavoritoItem {
  slug: string;
  title: string;
  image: string | null;
  date: string;
}

const STORAGE_KEY = 'tribuna:favoritos';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private itens = signal<FavoritoItem[]>(this.carregar());

  favoritos = computed(() => this.itens());
  quantidade = computed(() => this.itens().length);

  isFavorito(slug: string) {
    return computed(() => this.itens().some((item) => item.slug === slug));
  }

  alternar(item: FavoritoItem): void {
    const atual = this.itens();
    const existe = atual.some((f) => f.slug === item.slug);
    const proximo = existe ? atual.filter((f) => f.slug !== item.slug) : [item, ...atual];
    this.itens.set(proximo);
    this.salvar(proximo);
  }

  remover(slug: string): void {
    const proximo = this.itens().filter((f) => f.slug !== slug);
    this.itens.set(proximo);
    this.salvar(proximo);
  }

  private carregar(): FavoritoItem[] {
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

  private salvar(itens: FavoritoItem[]): void {
    if (!this.isBrowser) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
  }
}
