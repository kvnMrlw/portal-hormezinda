import type { ClassGroup } from '../types/catalogs';

const yearLabels: Record<string, string> = {
  '1': '1º Ano',
  '1o': '1º Ano',
  '1º': '1º Ano',
  primeiro: '1º Ano',
  '2': '2º Ano',
  '2o': '2º Ano',
  '2º': '2º Ano',
  segundo: '2º Ano',
  '3': '3º Ano',
  '3o': '3º Ano',
  '3º': '3º Ano',
  terceiro: '3º Ano'
};

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

export function formatClassName(classGroup?: Pick<ClassGroup, 'ano' | 'nome'> | null): string {
  if (!classGroup) return 'Turma';

  const rawName = classGroup.nome.trim();

  if (/ano/i.test(rawName)) {
    return rawName;
  }

  const compactMatch = rawName.match(/^([123])\s*([A-Z])$/i);

  if (compactMatch) {
    return `${compactMatch[1]}º Ano ${compactMatch[2].toUpperCase()}`;
  }

  const year = yearLabels[normalize(classGroup.ano)] ?? classGroup.ano.trim();

  if (/^[A-Z]$/i.test(rawName)) {
    return `${year} ${rawName.toUpperCase()}`;
  }

  return rawName;
}

export function formatStudentClassName(value?: string | null): string {
  if (!value) return '';

  const compactMatch = value.trim().match(/^([123])\s*([A-Z])$/i);

  if (compactMatch) {
    return `${compactMatch[1]}º Ano ${compactMatch[2].toUpperCase()}`;
  }

  return value;
}

export function getClassSortValue(classGroup: Pick<ClassGroup, 'ano' | 'nome'>): string {
  const formatted = formatClassName(classGroup);
  const match = formatted.match(/^([123])º Ano\s+([A-Z])/i);

  if (!match) {
    return `9-${formatted}`;
  }

  return `${match[1]}-${match[2].toUpperCase()}`;
}
