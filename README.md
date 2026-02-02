# CineSuper Transcoder App

App desktop (Windows) com interface e auto‑update via GitHub Releases.

## Estrutura

- `main.js`: inicia o servidor local e abre o UI.
- `renderer/`: telas de loading/erro.
- `extraResources`: inclui o server do transcoder dentro do instalador.

## Como rodar em dev

```powershell
cd C:\Projetos\Transcoder_v2\transcoder-app
npm install
npm run dev
```

## Como gerar instalador

```powershell
cd C:\Projetos\Transcoder_v2\transcoder-app
npm install
npm run dist
```

## Publicar atualização (auto‑update)

1. Crie o release no GitHub em `joaofernandeslp/transcoder-cinesuper`.
2. Rode:

```powershell
$env:GH_TOKEN="SEU_TOKEN_GITHUB"
npm run release
```

O `electron-builder` publica o instalador e os arquivos de update automaticamente no Release.

### Versão

Por padrão sobe `patch`. Para mudar:

```powershell
npm run release -- minor
npm run release -- major
```

## Auto‑release no commit (opcional)

Este projeto está com hook de `post-commit` configurado. Se `GH_TOKEN` estiver definido,
um release é publicado automaticamente após cada commit.

Para ativar:

```powershell
$env:GH_TOKEN="SEU_TOKEN_GITHUB"
```

## Observações

- O FFmpeg deve existir em `C:\ffmpeg\bin\ffmpeg.exe` (ou ajuste no server).
- Se o server estiver sem `node_modules`, rode `npm install` dentro de `cinesuper-upr2/server` antes de buildar.
