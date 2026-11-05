# Espaço Daphine Santana

Site de [Daphine Santana](https://www.daphinesantana.com.br), psicomotricista em Mogi das Cruzes e Alto Tietê.

Site estático: HTML, CSS e um JavaScript sem dependências. Os arquivos que você edita são os que rodam localmente; no deploy a Vercel roda um build curto (veja abaixo).

- `index.html`: página principal
- `links/`: página de links da bio do Instagram
- `assets/site.css`: estilos e tokens
- `assets/fonts/`: Bricolage Grotesque e Atkinson Hyperlegible Next hospedadas no próprio site (subconjunto latino, licença SIL OFL na pasta)
- `assets/trace.js`: "O Traço do Movimento", a linha desenhada pela rolagem, a galeria travada do Espaço, o FAQ animado e o menu
- `img/`: imagens (cada recorte e fundo gerado tem um `.json` com a procedência)
- `DESIGN.md` e `PRODUCT.md`: sistema visual e fatos do produto

## Rodar localmente

```bash
python3 -m http.server 4321
```

Depois abra http://localhost:4321.

## Build e deploy

A cada push no `main` a Vercel roda `npm run build` (`scripts/build.mjs`, configurado em `vercel.json`) e publica a pasta `dist/`:

- o `assets/site.css` é minificado e embutido em cada página, então nenhuma folha de estilo bloqueia a primeira pintura;
- o `assets/trace.js` é minificado no mesmo caminho;
- os comentários HTML saem.

Para conferir o resultado localmente: `npm install`, `npm run build` e `python3 -m http.server 4322 -d dist`.

Ao mudar `site.css` ou `trace.js`, troque o `?v=` nas páginas (`index.html`, `links/index.html`, `404.html`) para o navegador não usar a versão antiga. Ao trocar uma fonte, gere o subconjunto com o mesmo recorte (veja `DESIGN.md`) e mantenha os `<link rel="preload">` das páginas apontando para os mesmos arquivos do `@font-face`.

---

Desenvolvido por [Chibo Dev](https://chibodev.com).
