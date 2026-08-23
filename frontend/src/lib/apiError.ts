import axios from 'axios';

type ErrorPayload = {
  message?: string;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ErrorPayload>(error)) {
    return fallback;
  }

  const serverMessage = error.response?.data?.message?.trim();

  if (serverMessage) {
    return serverMessage;
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'O servidor demorou para responder. Aguarde alguns segundos e tente novamente.';
  }

  if (!error.response) {
    return 'Nao foi possivel conectar ao servidor. Se ele estiver iniciando, aguarde alguns segundos e tente novamente.';
  }

  return fallback;
}
