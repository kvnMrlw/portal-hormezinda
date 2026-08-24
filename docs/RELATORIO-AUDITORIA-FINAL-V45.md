# Relatorio V45 - Auditoria final absoluta local

Gerado em: `2026-08-23T19:11:47`

## Resultado executivo

- Lint backend: **OK, zero warnings**
- Lint frontend: **OK, zero warnings**
- Build backend: **OK**
- Build frontend: **OK**
- npm audit backend: **0 vulnerabilidades**
- npm audit frontend: **0 vulnerabilidades**
- Segredos rastreados de alta confianca: **0**
- Placeholders de segredo em arquivos de exemplo: **permitidos e registrados separadamente**
- Arquivos `.env` reais rastreados: **0**
- Guardas de acabamento frontend: **OK**
- JWT access/refresh com segredos separados: **OK**
- Endpoints GET testados: **19**
- Endpoints vazios validos (`EMPTY_OK`): **12**
- Endpoints com atencao: **0**
- Commit/push: **NAO executados**

## Git

- Branch: `dev`
- HEAD: `c13d29e`

```text
## dev...origin/dev [à frente 2]
 M backend/.env.example
 M backend/package-lock.json
 M backend/package.json
 M backend/src/app.ts
 M backend/src/config/env.ts
 M backend/src/modules/auth/middlewares/auth.middleware.ts
 M backend/src/modules/auth/service/auth.service.ts
 M backend/src/modules/users/controller/user.controller.ts
 M backend/src/modules/users/middlewares/profile-upload.middleware.ts
 M backend/src/modules/users/routes/user.routes.ts
 M backend/src/seeds/ensureAdmin.ts
 M backend/src/utils/imageUpload.ts
 M frontend/index.html
 M frontend/package-lock.json
 M frontend/src/components/app/Topbar.tsx
 M frontend/src/components/auth/RecaptchaCheckbox.tsx
 M frontend/src/components/profile/ProfileView.tsx
 M frontend/src/contexts/AuthContext.tsx
 M frontend/src/pages/Ideas.tsx
 M frontend/src/pages/MySubjects.tsx
 M frontend/src/pages/MyTasks.tsx
 M frontend/src/pages/Notices.tsx
 M frontend/src/pages/Notifications.tsx
 M frontend/src/pages/PublicProfile.tsx
 M frontend/src/pages/Settings.tsx
 M frontend/src/pages/TeacherDiary.tsx
 M frontend/src/pages/Users.tsx
 M frontend/src/services/academic.ts
 M frontend/src/services/api.ts
 M frontend/src/services/courses.ts
 M frontend/src/services/feed.ts
 M frontend/src/services/ideas.ts
 M frontend/src/services/meals.ts
 M frontend/src/services/users.ts
?? backend/src/routes/readiness.routes.ts
?? docs/RELATORIO-CONSOLIDACAO-V43.md
?? docs/RELATORIO-POLIMENTO-V44.md
?? docs/RELATORIO-VALIDACAO-PAGINAS-V43.md
?? frontend/.env.example
?? frontend/public/robots.txt
?? frontend/public/sitemap.xml
?? frontend/src/lib/apiError.ts
?? frontend/vercel.json
?? render.yaml
```

## Smoke test final

| Area | Endpoint | HTTP | Resultado |
|---|---|---:|---|
| Sessao / perfil | `/api/auth/me` | 200 | **OK** |
| Feed | `/api/feed?page=1&limit=10` | 200 | **EMPTY_OK** |
| Stories | `/api/feed/stories` | 200 | **EMPTY_OK** |
| Ideias | `/api/ideas?page=1&limit=10` | 200 | **EMPTY_OK** |
| Notificacoes | `/api/notifications?page=1&limit=20` | 200 | **EMPTY_OK** |
| Avisos | `/api/notices` | 200 | **EMPTY_OK** |
| Usuarios | `/api/users` | 200 | **OK** |
| Administracao de usuarios | `/api/users/admin` | 200 | **OK** |
| Pessoas | `/api/users/people?limit=10&page=1` | 200 | **OK** |
| Disciplinas | `/api/academic/subjects` | 200 | **EMPTY_OK** |
| Chamadas | `/api/academic/attendance` | 200 | **EMPTY_OK** |
| Conteudos | `/api/academic/contents` | 200 | **EMPTY_OK** |
| Tarefas | `/api/academic/tasks` | 200 | **EMPTY_OK** |
| Resumo academico | `/api/academic/profile-summary` | 200 | **EMPTY_OK** |
| Catalogos | `/api/catalogs` | 200 | **OK** |
| Cursos | `/api/courses?page=1&limit=10` | 200 | **EMPTY_OK** |
| Refeicoes | `/api/meals` | 200 | **OK** |
| Horarios | `/api/schedules` | 200 | **EMPTY_OK** |
| Aniversariantes | `/api/social/birthdays/today` | 200 | **OK** |

## Copia interna duplicada

- Existe: **sim**
- Arquivos analisados: **298**
- Identicos ao projeto raiz: **0**
- Diferentes do projeto raiz: **0**
- Presentes somente na copia interna: **298**

### Arquivos somente na copia interna

- `portal-hormezinda/package-lock.json`
- `portal-hormezinda/package.json`
- `portal-hormezinda/.editorconfig`
- `portal-hormezinda/README.md`
- `portal-hormezinda/.gitignore`
- `portal-hormezinda/render.yaml`
- `portal-hormezinda/frontend/eslint.config.js`
- `portal-hormezinda/frontend/vite.config.ts`
- `portal-hormezinda/frontend/index.html`
- `portal-hormezinda/frontend/package-lock.json`
- `portal-hormezinda/frontend/package.json`
- `portal-hormezinda/frontend/.env.example`
- `portal-hormezinda/frontend/tsconfig.app.json`
- `portal-hormezinda/frontend/vercel.json`
- `portal-hormezinda/frontend/tsconfig.json`
- `portal-hormezinda/frontend/postcss.config.js`
- `portal-hormezinda/frontend/.prettierrc`
- `portal-hormezinda/frontend/tailwind.config.ts`
- `portal-hormezinda/frontend/tsconfig.node.json`
- `portal-hormezinda/frontend/src/App.tsx`
- `portal-hormezinda/frontend/src/main.tsx`
- `portal-hormezinda/frontend/src/vite-env.d.ts`
- `portal-hormezinda/frontend/src/utils/.gitkeep`
- `portal-hormezinda/frontend/src/components/app/Sidebar.tsx`
- `portal-hormezinda/frontend/src/components/app/ModuleHeader.tsx`
- `portal-hormezinda/frontend/src/components/app/Topbar.tsx`
- `portal-hormezinda/frontend/src/components/app/MainContainer.tsx`
- `portal-hormezinda/frontend/src/components/app/AppShell.tsx`
- `portal-hormezinda/frontend/src/components/app/ContentArea.tsx`
- `portal-hormezinda/frontend/src/components/social/BirthdayWelcome.tsx`
- `portal-hormezinda/frontend/src/components/admin/.gitkeep`
- `portal-hormezinda/frontend/src/components/schedule/.gitkeep`
- `portal-hormezinda/frontend/src/components/schedules/ScheduleLessonCard.tsx`
- `portal-hormezinda/frontend/src/components/schedules/ScheduleFilters.tsx`
- `portal-hormezinda/frontend/src/components/schedules/TeacherAgenda.tsx`
- `portal-hormezinda/frontend/src/components/schedules/ScheduleModal.tsx`
- `portal-hormezinda/frontend/src/components/schedules/ScheduleDayCards.tsx`
- `portal-hormezinda/frontend/src/components/schedules/ScheduleTable.tsx`
- `portal-hormezinda/frontend/src/components/schedules/ScheduleTopSummary.tsx`
- `portal-hormezinda/frontend/src/components/schedules/scheduleUtils.ts`
- `portal-hormezinda/frontend/src/components/home/HomeHeader.tsx`
- `portal-hormezinda/frontend/src/components/home/SchoolPanel.tsx`
- `portal-hormezinda/frontend/src/components/home/HomeFeed.tsx`
- `portal-hormezinda/frontend/src/components/home/SummaryCards.tsx`
- `portal-hormezinda/frontend/src/components/notifications/NotificationItem.tsx`
- `portal-hormezinda/frontend/src/components/feed/StoryViewer.tsx`
- `portal-hormezinda/frontend/src/components/feed/CreateContentModal.tsx`
- `portal-hormezinda/frontend/src/components/feed/PostHeader.tsx`
- `portal-hormezinda/frontend/src/components/feed/.gitkeep`
- `portal-hormezinda/frontend/src/components/feed/CreatePost.tsx`
- `portal-hormezinda/frontend/src/components/feed/LoadingFeed.tsx`
- `portal-hormezinda/frontend/src/components/feed/feedUtils.ts`
- `portal-hormezinda/frontend/src/components/feed/Feed.tsx`
- `portal-hormezinda/frontend/src/components/feed/PostCard.tsx`
- `portal-hormezinda/frontend/src/components/feed/PostFooter.tsx`
- `portal-hormezinda/frontend/src/components/feed/StoriesBar.tsx`
- `portal-hormezinda/frontend/src/components/feed/EmptyFeed.tsx`
- `portal-hormezinda/frontend/src/components/feed/DeletePostDialog.tsx`
- `portal-hormezinda/frontend/src/components/forms/.gitkeep`
- `portal-hormezinda/frontend/src/components/profile/.gitkeep`
- `portal-hormezinda/frontend/src/components/profile/ProfileView.tsx`
- `portal-hormezinda/frontend/src/components/cards/.gitkeep`
- `portal-hormezinda/frontend/src/components/meals/MealCard.tsx`
- `portal-hormezinda/frontend/src/components/stories/.gitkeep`
- `portal-hormezinda/frontend/src/components/courses/CourseCard.tsx`
- `portal-hormezinda/frontend/src/components/ui/Modal.tsx`
- `portal-hormezinda/frontend/src/components/ui/RoleBadge.tsx`
- `portal-hormezinda/frontend/src/components/ui/Skeleton.tsx`
- `portal-hormezinda/frontend/src/components/ui/DatePicker.tsx`
- `portal-hormezinda/frontend/src/components/ui/Card.tsx`
- `portal-hormezinda/frontend/src/components/ui/.gitkeep`
- `portal-hormezinda/frontend/src/components/ui/Spinner.tsx`
- `portal-hormezinda/frontend/src/components/ui/Select.tsx`
- `portal-hormezinda/frontend/src/components/ui/PasswordInput.tsx`
- `portal-hormezinda/frontend/src/components/ui/Button.tsx`
- `portal-hormezinda/frontend/src/components/ui/Textarea.tsx`
- `portal-hormezinda/frontend/src/components/ui/SearchInput.tsx`
- `portal-hormezinda/frontend/src/components/ui/EmptyState.tsx`
- `portal-hormezinda/frontend/src/components/ui/Input.tsx`
- `portal-hormezinda/frontend/src/components/ui/Badge.tsx`
- `portal-hormezinda/frontend/src/components/ui/Loading.tsx`
- `portal-hormezinda/frontend/src/components/ui/Avatar.tsx`
- `portal-hormezinda/frontend/src/components/ui/SchoolLogo.tsx`
- `portal-hormezinda/frontend/src/components/notices/NoticeModal.tsx`
- `portal-hormezinda/frontend/src/components/notices/NoticeCard.tsx`
- `portal-hormezinda/frontend/src/components/notices/noticeOptions.ts`
- `portal-hormezinda/frontend/src/components/notices/NoticeFilters.tsx`
- `portal-hormezinda/frontend/src/components/layout/.gitkeep`
- `portal-hormezinda/frontend/src/components/layout/AuthLayout.tsx`
- `portal-hormezinda/frontend/src/styles/.gitkeep`
- `portal-hormezinda/frontend/src/styles/globals.css`
- `portal-hormezinda/frontend/src/styles/theme.css`
- `portal-hormezinda/frontend/src/hooks/.gitkeep`
- `portal-hormezinda/frontend/src/contexts/AuthContext.tsx`
- `portal-hormezinda/frontend/src/contexts/useAuth.ts`
- `portal-hormezinda/frontend/src/contexts/.gitkeep`
- `portal-hormezinda/frontend/src/contexts/auth-context.ts`
- `portal-hormezinda/frontend/src/router/AppRouter.tsx`
- `portal-hormezinda/frontend/src/router/.gitkeep`
- `portal-hormezinda/frontend/src/services/meals.ts`
- ... e mais 198

## Pendencia de limpeza

A copia interna **nao foi removida automaticamente**, porque ainda contem arquivos
diferentes ou exclusivos. A remocao deve ser decidida a partir desta lista, com backup.

## Conclusao

As validacoes executadas nesta V45 nao encontraram falha estrutural nos endpoints principais,
nem vulnerabilidades npm, segredos rastreados, warnings de lint ou falhas de build.
O unico ponto que pode continuar exigindo decisao manual e a copia interna duplicada,
conforme a analise acima.
