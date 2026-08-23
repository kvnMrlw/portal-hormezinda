import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type {
  AcademicFilters,
  AcademicSubject,
  AcademicSummary,
  AcademicTask,
  Attendance,
  AttendancePayload,
  ContentPayload,
  DiaryEntry,
  LessonContent,
  TaskPayload,
  TaskSubmission
} from '../types/academic';
import { SubmissionStatus } from '../types/academic';

function cleanFilters(filters: AcademicFilters = {}): Record<string, string> {
  return Object.entries(filters).reduce<Record<string, string>>((params, [key, value]) => {
    if (value) params[key] = String(value);

    return params;
  }, {});
}

function contentToFormData(payload: ContentPayload): FormData {
  const formData = new FormData();
  formData.append('descricao', payload.descricao);
  formData.append('disciplinaId', payload.disciplinaId);
  formData.append('titulo', payload.titulo);
  formData.append('turmaId', payload.turmaId);
  if (payload.data) formData.append('data', payload.data);
  if (payload.professorId) formData.append('professorId', payload.professorId);
  payload.arquivos?.forEach((file) => formData.append('arquivos', file));

  return formData;
}

function taskToFormData(payload: TaskPayload): FormData {
  const formData = new FormData();
  formData.append('dataEntrega', payload.dataEntrega);
  formData.append('descricao', payload.descricao);
  formData.append('disciplinaId', payload.disciplinaId);
  formData.append('tipo', payload.tipo);
  formData.append('titulo', payload.titulo);
  formData.append('turmaId', payload.turmaId);
  if (payload.professorId) formData.append('professorId', payload.professorId);
  if (payload.arquivo) formData.append('arquivo', payload.arquivo);

  return formData;
}

export async function listAcademicSubjects(): Promise<AcademicSubject[]> {
  const response = await api.get<ApiResponse<{ disciplinas: AcademicSubject[] }>>('/academic/subjects');

  return response.data.data.disciplinas;
}

export async function getAcademicSubject(id: string): Promise<AcademicSubject & { conteudos: LessonContent[]; diarios: DiaryEntry[]; tarefas: AcademicTask[] }> {
  const response = await api.get<ApiResponse<{ disciplina: AcademicSubject & { conteudos: LessonContent[]; diarios: DiaryEntry[]; tarefas: AcademicTask[] } }>>(`/academic/subjects/${id}`);

  return response.data.data.disciplina;
}

export async function listAttendance(filters: AcademicFilters = {}): Promise<Attendance[]> {
  const response = await api.get<ApiResponse<{ chamadas: Attendance[] }>>('/academic/attendance', { params: cleanFilters(filters) });

  return response.data.data.chamadas;
}

export async function saveAttendance(payload: AttendancePayload): Promise<Attendance> {
  const response = await api.put<ApiResponse<{ chamada: Attendance }>>('/academic/attendance', payload);

  return response.data.data.chamada;
}

export async function listContents(filters: AcademicFilters = {}): Promise<LessonContent[]> {
  const response = await api.get<ApiResponse<{ conteudos: LessonContent[] }>>('/academic/contents', { params: cleanFilters(filters) });

  return response.data.data.conteudos;
}

export async function createContent(payload: ContentPayload): Promise<LessonContent> {
  const response = await api.post<ApiResponse<{ conteudo: LessonContent }>>(
    '/academic/contents',
    contentToFormData(payload),
  );

  return response.data.data.conteudo;
}

export async function listTasks(filters: AcademicFilters = {}): Promise<AcademicTask[]> {
  const response = await api.get<ApiResponse<{ tarefas: AcademicTask[] }>>('/academic/tasks', { params: cleanFilters(filters) });

  return response.data.data.tarefas;
}

export async function createTask(payload: TaskPayload): Promise<AcademicTask> {
  const response = await api.post<ApiResponse<{ tarefa: AcademicTask }>>(
    '/academic/tasks',
    taskToFormData(payload),
  );

  return response.data.data.tarefa;
}

export async function updateTask(id: string, payload: TaskPayload): Promise<AcademicTask> {
  const response = await api.patch<ApiResponse<{ tarefa: AcademicTask }>>(
    `/academic/tasks/${id}`,
    taskToFormData(payload),
  );

  return response.data.data.tarefa;
}

export async function submitTask(taskId: string, arquivo: File): Promise<TaskSubmission> {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  const response = await api.post<ApiResponse<{ entrega: TaskSubmission }>>(
    `/academic/tasks/${taskId}/submissions`,
    formData,
  );

  return response.data.data.entrega;
}

export async function listSubmissions(taskId: string): Promise<TaskSubmission[]> {
  const response = await api.get<ApiResponse<{ entregas: TaskSubmission[] }>>(`/academic/tasks/${taskId}/submissions`);

  return response.data.data.entregas;
}

export async function reviewSubmission(id: string, payload: { observacaoProfessor?: string; status?: SubmissionStatus }): Promise<TaskSubmission> {
  const response = await api.patch<ApiResponse<{ entrega: TaskSubmission }>>(`/academic/submissions/${id}`, {
    observacaoProfessor: payload.observacaoProfessor ?? '',
    status: payload.status ?? SubmissionStatus.CONFIRMED
  });

  return response.data.data.entrega;
}

export async function createDiary(payload: { data?: string; disciplinaId: string; observacoes?: string; professorId?: string; turmaId: string }): Promise<DiaryEntry> {
  const response = await api.post<ApiResponse<{ diario: DiaryEntry }>>('/academic/diaries', payload);

  return response.data.data.diario;
}

export async function getAcademicProfileSummary(): Promise<AcademicSummary> {
  const response = await api.get<ApiResponse<{ resumo: AcademicSummary }>>('/academic/profile-summary');

  return response.data.data.resumo;
}
