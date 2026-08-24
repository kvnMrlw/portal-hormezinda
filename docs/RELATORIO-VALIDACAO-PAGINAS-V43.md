# Relatorio V43 - Validacao de paginas e endpoints

Gerado em: `2026-08-23T18:43:13`

## Objetivo

Esta validacao nao corrige nem mascara estados de erro. Ela verifica se as rotas de leitura
respondem corretamente e diferencia uma colecao vazia de um erro real do backend.

### Classificacoes

- `OK`: endpoint respondeu 2xx.
- `EMPTY_OK`: endpoint respondeu 2xx e as colecoes retornadas estao vazias. Isso e valido.
- `PARAM_REQUIRED`: endpoint respondeu 400/422; pode exigir filtros/contexto especifico.
- `AUTH_RBAC_ATTENTION`: 401/403 com token administrativo temporario.
- `ROUTE_ATTENTION`: rota 404.
- `BACKEND_ERROR`: erro 5xx.
- `NETWORK_ERROR`: falha de conexao.

## Estados visuais encontrados no frontend

| Arquivo | Linha | Mensagem | Servicos importados |
|---|---:|---|---|
| `frontend/src/pages/MySubjects.tsx` | 34 | Nao foi possivel carregar as disciplinas. | `academic` |
| `frontend/src/pages/MyTasks.tsx` | 36 | Nao foi possivel carregar as tarefas. | `academic` |
| `frontend/src/pages/Notices.tsx` | 44 | Nao foi possivel carregar os avisos. | `notices` |
| `frontend/src/pages/Notifications.tsx` | 25 | Nao foi possivel carregar as notificacoes. | `notifications` |
| `frontend/src/pages/People.tsx` | 136 | Nao foi possivel carregar as pessoas. | `users` |
| `frontend/src/pages/PublicProfile.tsx` | 64 | Nao foi possivel carregar este perfil. | `ideas, users` |
| `frontend/src/pages/TeacherDiary.tsx` | 119 | Nao foi possivel carregar o diario. | `academic, users` |
| `frontend/src/pages/Users.tsx` | 534 | Nao foi possivel carregar os usuarios. | `users` |
| `frontend/src/components/auth/RecaptchaCheckbox.tsx` | 91 | Nao foi possivel carregar o Google reCAPTCHA. | `-` |
| `frontend/src/components/auth/RecaptchaCheckbox.tsx` | 175 | Nao foi possivel carregar o reCAPTCHA. | `-` |
| `frontend/src/components/feed/Feed.tsx` | 50 | Não foi possível carregar as publicações. | `feed` |

## Smoke test de endpoints GET

| Area | Endpoint | HTTP | Resultado | Colecoes | Mensagem |
|---|---|---:|---|---|---|
| Sessao / perfil autenticado | `/api/auth/me` | 200 | **OK** | - | Usuario autenticado |
| Feed | `/api/feed?page=1&limit=10` | 200 | **EMPTY_OK** | data.publicacoes=0 | Request completed successfully |
| Stories | `/api/feed/stories` | 200 | **EMPTY_OK** | data.stories=0 | Request completed successfully |
| Ideias | `/api/ideas?page=1&limit=10` | 200 | **EMPTY_OK** | data.ideias=0 | Request completed successfully |
| Notificacoes | `/api/notifications?page=1&limit=20` | 200 | **EMPTY_OK** | data.notificacoes=0 | Request completed successfully |
| Avisos | `/api/notices` | 200 | **OK** | data.avisos=1 | Request completed successfully |
| Usuarios | `/api/users` | 200 | **OK** | data.usuarios=1 | Request completed successfully |
| Administracao de usuarios | `/api/users/admin` | 200 | **OK** | data.usuarios=1 | Request completed successfully |
| Pessoas | `/api/users/people?limit=10&page=1` | 200 | **OK** | data.usuarios=1 | Request completed successfully |
| Disciplinas | `/api/academic/subjects` | 200 | **EMPTY_OK** | data.disciplinas=0 | Request completed successfully |
| Chamadas | `/api/academic/attendance` | 200 | **EMPTY_OK** | data.chamadas=0 | Request completed successfully |
| Conteudos academicos | `/api/academic/contents` | 200 | **EMPTY_OK** | data.conteudos=0 | Request completed successfully |
| Tarefas | `/api/academic/tasks` | 200 | **EMPTY_OK** | data.tarefas=0 | Request completed successfully |
| Resumo academico | `/api/academic/profile-summary` | 200 | **EMPTY_OK** | data.resumo.disciplinas=0, data.resumo.ultimasAtividades=0, data.resumo.ultimosConteudos=0 | Request completed successfully |
| Catalogos | `/api/catalogs` | 200 | **OK** | data.disciplinas=1, data.salas=2, data.turmas=2 | Request completed successfully |
| Cursos | `/api/courses?page=1&limit=10` | 200 | **EMPTY_OK** | data.cursos=0 | Request completed successfully |
| Refeicoes | `/api/meals` | 200 | **OK** | data.refeicoes=1 | Request completed successfully |
| Horarios | `/api/schedules` | 200 | **EMPTY_OK** | data.horarios=0 | Request completed successfully |
| Aniversariantes | `/api/social/birthdays/today` | 200 | **OK** | data.aniversariantes=0, data.mensagensDisponiveis=5 | Request completed successfully |

## Conclusao automatica

Os endpoints principais de leitura responderam sem erro estrutural. **11 endpoint(s)** retornaram colecoes vazias com HTTP 2xx; isso significa que estar vazio, por si so, nao e falha do backend.
