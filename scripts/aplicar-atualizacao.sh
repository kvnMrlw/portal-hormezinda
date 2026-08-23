#!/usr/bin/env bash
set -euo pipefail

# Portal Hormezinda
# Aplica automaticamente um pacote ZIP de atualização gerado para o projeto.
#
# Uso:
#   bash scripts/aplicar-atualizacao.sh ~/Downloads/arquivo.zip
#
# Execute de qualquer pasta dentro do repositório Git.

if [ "$#" -ne 1 ]; then
  echo "Uso: bash scripts/aplicar-atualizacao.sh /caminho/para/atualizacao.zip"
  exit 1
fi

ZIP_PATH="$(realpath "$1")"

if [ ! -f "$ZIP_PATH" ]; then
  echo "Erro: arquivo não encontrado: $ZIP_PATH"
  exit 1
fi

for cmd in git unzip rsync npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Erro: comando obrigatório não encontrado: $cmd"
    exit 1
  fi
done

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"

if [ -z "$PROJECT_ROOT" ]; then
  echo "Erro: execute este script dentro do repositório do Portal Hormezinda."
  exit 1
fi

FRONTEND_DIR="$PROJECT_ROOT/frontend"

if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Erro: pasta frontend não encontrada em:"
  echo "  $FRONTEND_DIR"
  exit 1
fi

echo
echo "Portal Hormezinda - Aplicador de atualização"
echo "Projeto: $PROJECT_ROOT"
echo "Pacote:  $ZIP_PATH"
echo

# Evita misturar uma nova atualização com alterações locais não salvas.
if [ -n "$(git -C "$PROJECT_ROOT" status --porcelain)" ]; then
  echo "Existem alterações locais ainda não commitadas."
  echo
  git -C "$PROJECT_ROOT" status --short
  echo
  echo "Por segurança, faça commit ou stash antes de aplicar uma nova atualização."
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "[1/5] Extraindo pacote..."
unzip -q "$ZIP_PATH" -d "$TMP_DIR"

# Aceita ZIP contendo frontend/ diretamente ou dentro de uma pasta superior.
SOURCE_FRONTEND=""

if [ -d "$TMP_DIR/frontend" ]; then
  SOURCE_FRONTEND="$TMP_DIR/frontend"
else
  SOURCE_FRONTEND="$(find "$TMP_DIR" -type d -name frontend -print -quit)"
fi

if [ -z "$SOURCE_FRONTEND" ] || [ ! -d "$SOURCE_FRONTEND" ]; then
  echo "Erro: o ZIP não contém uma pasta frontend válida."
  exit 1
fi

echo "[2/5] Aplicando arquivos..."

# IMPORTANTE:
# - Não apaga arquivos existentes automaticamente.
# - Não substitui .env.
# - Não copia node_modules, dist ou .git.
rsync -a \
  --exclude='.git/' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.production' \
  --exclude='node_modules/' \
  --exclude='dist/' \
  --exclude='.DS_Store' \
  "$SOURCE_FRONTEND/" "$FRONTEND_DIR/"

echo "[3/5] Verificando alterações..."

CHANGED_FILES="$(git -C "$PROJECT_ROOT" diff --name-only)"

if [ -z "$CHANGED_FILES" ]; then
  echo "Nenhuma alteração foi detectada."
  exit 0
fi

echo
git -C "$PROJECT_ROOT" diff --stat
echo

if echo "$CHANGED_FILES" | grep -Eq '^frontend/(package\.json|package-lock\.json)$'; then
  echo "[4/5] Dependências foram alteradas. Executando npm install..."
  (
    cd "$FRONTEND_DIR"
    npm install
  )
else
  echo "[4/5] Dependências não mudaram. npm install ignorado."
fi

echo "[5/5] Validando build do frontend..."
(
  cd "$FRONTEND_DIR"
  npm run build
)

echo
echo "Atualização aplicada com sucesso."
echo
echo "Arquivos alterados:"
git -C "$PROJECT_ROOT" status --short
echo
echo "Agora você pode testar com:"
echo "  cd \"$FRONTEND_DIR\""
echo "  npm run dev"
echo
echo "Depois de aprovar:"
echo "  cd \"$PROJECT_ROOT\""
echo "  git add ."
echo '  git commit -m "feat: milestone XX - descricao"'
echo
