# Portal Hormezinda

Sistema escolar moderno para conectar alunos, professores e comunidade escolar.

Esta entrega corresponde a **Fase 0**: arquitetura inicial, configuracoes, estrutura de pastas, scripts e uma tela inicial simples.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript, MongoDB/Mongoose
- Monorepo com scripts compartilhados na raiz

## Estrutura

```txt
portal-hormezinda/
├── frontend/
├── backend/
├── docs/
└── .github/
```

## Como rodar

```bash
npm run install:all
cp backend/.env.example backend/.env
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Scripts

- `npm run install:all`: instala dependencias da raiz, backend e frontend
- `npm run dev`: roda backend e frontend ao mesmo tempo
- `npm run build`: gera builds do backend e frontend
- `npm run lint`: executa lint nos dois projetos
- `npm run format`: formata arquivos com Prettier

## Fase 0

Inclui apenas a base do projeto. Login real, feed, stories, painel admin, horarios e usuarios serao implementados em fases futuras.
