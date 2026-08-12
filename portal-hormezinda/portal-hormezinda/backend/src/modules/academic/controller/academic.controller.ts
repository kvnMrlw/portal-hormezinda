import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import { saveUploadedFile } from '../../../utils/imageUpload';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { AcademicService, toAcademicFile } from '../service/academic.service';
import {
  academicFiltersSchema,
  academicIdParamSchema,
  academicTaskPayloadSchema,
  attendancePayloadSchema,
  diaryEntryPayloadSchema,
  lessonContentPayloadSchema,
  observationPayloadSchema,
  submissionReviewPayloadSchema,
  taskIdParamSchema
} from '../validation/academic.validation';

const academicService = new AcademicService();

function getViewer(request: AuthenticatedRequest) {
  if (!request.user) {
    throw new AppError('Usuario nao autenticado', 401);
  }

  return request.user;
}

async function filesToAcademicFiles(files: Express.Multer.File[] = []) {
  return Promise.all(
    files.map(async (file) => {
      const saved = await saveUploadedFile(file, { folderName: 'academic', imageVariant: 'notice' });

      return toAcademicFile(file, saved);
    })
  );
}

export async function listAcademicSubjects(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const disciplinas = await academicService.listSubjects(getViewer(request));

    return response.status(200).json(apiResponse({ disciplinas }));
  } catch (error) {
    return next(error);
  }
}

export async function getAcademicSubject(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = academicIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Disciplina nao encontrada', 404);
    }

    const disciplina = await academicService.getSubjectDetails(parsedParams.data.id, getViewer(request));

    if (!disciplina) {
      throw new AppError('Disciplina nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ disciplina }));
  } catch (error) {
    return next(error);
  }
}

export async function listAttendance(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedQuery = academicFiltersSchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar chamadas', 400);
    }

    const chamadas = await academicService.listAttendance(getViewer(request), parsedQuery.data);

    return response.status(200).json(apiResponse({ chamadas }));
  } catch (error) {
    return next(error);
  }
}

export async function saveAttendance(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedBody = attendancePayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel salvar a chamada', 400);
    }

    const chamada = await academicService.saveAttendance(getViewer(request), parsedBody.data);

    return response.status(200).json(apiResponse({ chamada }, { message: 'Chamada salva com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function listContents(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedQuery = academicFiltersSchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar conteudos', 400);
    }

    const conteudos = await academicService.listContents(getViewer(request), parsedQuery.data);

    return response.status(200).json(apiResponse({ conteudos }));
  } catch (error) {
    return next(error);
  }
}

export async function createContent(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedBody = lessonContentPayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar o conteudo', 400);
    }

    const arquivos = await filesToAcademicFiles((request.files as Express.Multer.File[]) ?? []);
    const conteudo = await academicService.createContent(getViewer(request), parsedBody.data, arquivos);

    return response.status(201).json(apiResponse({ conteudo }, { message: 'Conteudo criado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function listTasks(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedQuery = academicFiltersSchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar tarefas', 400);
    }

    const tarefas = await academicService.listTasks(getViewer(request), parsedQuery.data);

    return response.status(200).json(apiResponse({ tarefas }));
  } catch (error) {
    return next(error);
  }
}

export async function createTask(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedBody = academicTaskPayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar a tarefa', 400);
    }

    const [arquivo] = await filesToAcademicFiles(request.file ? [request.file] : []);
    const tarefa = await academicService.createTask(getViewer(request), parsedBody.data, arquivo);

    return response.status(201).json(apiResponse({ tarefa }, { message: 'Tarefa criada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function updateTask(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = academicIdParamSchema.safeParse(request.params);
    const parsedBody = academicTaskPayloadSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar a tarefa', 400);
    }

    const [arquivo] = await filesToAcademicFiles(request.file ? [request.file] : []);
    const tarefa = await academicService.updateTask(getViewer(request), parsedParams.data.id, parsedBody.data, arquivo);

    if (!tarefa) {
      throw new AppError('Tarefa nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ tarefa }, { message: 'Tarefa atualizada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function submitTask(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = taskIdParamSchema.safeParse(request.params);

    if (!parsedParams.success || !request.file) {
      throw new AppError('Nao foi possivel entregar a atividade', 400);
    }

    const [arquivo] = await filesToAcademicFiles([request.file]);
    const entrega = await academicService.submitTask(getViewer(request), parsedParams.data.taskId, arquivo);

    return response.status(201).json(apiResponse({ entrega }, { message: 'Atividade entregue com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function listSubmissions(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = taskIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Tarefa nao encontrada', 404);
    }

    const entregas = await academicService.listSubmissions(getViewer(request), parsedParams.data.taskId);

    return response.status(200).json(apiResponse({ entregas }));
  } catch (error) {
    return next(error);
  }
}

export async function reviewSubmission(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = academicIdParamSchema.safeParse(request.params);
    const parsedBody = submissionReviewPayloadSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel revisar a entrega', 400);
    }

    const entrega = await academicService.reviewSubmission(getViewer(request), parsedParams.data.id, parsedBody.data);

    if (!entrega) {
      throw new AppError('Entrega nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ entrega }, { message: 'Entrega revisada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function listDiaries(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedQuery = academicFiltersSchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar diarios', 400);
    }

    const diarios = await academicService.listDiaries(getViewer(request), parsedQuery.data);

    return response.status(200).json(apiResponse({ diarios }));
  } catch (error) {
    return next(error);
  }
}

export async function createDiary(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedBody = diaryEntryPayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar o diario', 400);
    }

    const diario = await academicService.createDiary(getViewer(request), parsedBody.data);

    return response.status(201).json(apiResponse({ diario }, { message: 'Diario criado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function createObservation(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedBody = observationPayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar a observacao', 400);
    }

    const observacao = await academicService.createObservation(getViewer(request), parsedBody.data);

    return response.status(201).json(apiResponse({ observacao }, { message: 'Observacao criada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function getAcademicProfileSummary(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const resumo = await academicService.getProfileSummary(getViewer(request));

    return response.status(200).json(apiResponse({ resumo }));
  } catch (error) {
    return next(error);
  }
}
