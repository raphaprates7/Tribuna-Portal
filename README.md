# Tribuna — Portal (Angular)

Portal editorial "Tribuna" — mídia, cultura e negócios. Standalone components, signals, SCSS por componente, dados via `HttpClient` lendo JSONs mock que simulam a API.

## Rodando localmente

```bash
npm install
npm start   # ng serve — http://localhost:4200
```

## Estrutura

```
src/app/
  core/
    models/       interfaces TS dos dados (nav, home, footer)
    services/      NavigationService, HomeService, FooterService — HttpClient lendo assets/mock/*.json
  shared/
    components/    Button, Icon (glifos simples em SVG), CategoryCard, StatCard, NewsletterForm
    layout/        Header (com mega menu) e Footer, usados no AppComponent (fora do router-outlet)
  features/
    home/          HomeComponent + subcomponentes de seção (hero, trending, dados, patrocinado)
src/assets/
  mock/            navigation.json, home.json, footer.json — formato que a API deverá retornar
  images/          fotos e logo da marca Tribuna
```

## Plugando a API real

Cada serviço em `core/services` tem um único ponto de troca — o `endpoint`:

```ts
private readonly endpoint = 'assets/mock/home.json';
// vira, por exemplo:
private readonly endpoint = `${environment.apiBaseUrl}/home`;
```

Os modelos em `core/models` já descrevem o contrato esperado; a API real só precisa devolver o mesmo formato (ou um adapter na service faz o `map()`).

## Cards sem foto

Alguns cards da Home podem ficar sem imagem — o `CategoryCardComponent` mostra um placeholder listrado com o nome do que deve entrar ali; basta preencher `image` no JSON (ou na resposta da API) quando a foto estiver disponível.
