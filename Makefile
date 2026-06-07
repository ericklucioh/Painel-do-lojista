SHELL := /bin/bash

COMPOSE ?= docker compose
BACKEND_DIR := back-painel
FRONTEND_DIR := front-painel
BACKEND_CI_DATABASE_URL := mysql://ci:ci@127.0.0.1:3306/painel_lojista
BACKEND_CI_SHADOW_DATABASE_URL := mysql://ci:ci@127.0.0.1:3306/prisma_migrate_shadow_db

.PHONY: run-dev down-dev format format-check lint build setup-hooks test ci ci-backend ci-frontend

run-dev:
	@$(COMPOSE) up --build --remove-orphans

down-dev:
	@$(COMPOSE) down

format:
	@set -e; \
	( cd $(BACKEND_DIR) && npm run format ); \
	( cd $(FRONTEND_DIR) && npm run format )

format-check:
	@set -e; \
	( cd $(BACKEND_DIR) && npm run format:check ); \
	( cd $(FRONTEND_DIR) && npm run format:check )

lint:
	@set -e; \
	( cd $(BACKEND_DIR) && npm run lint ); \
	( cd $(FRONTEND_DIR) && npm run lint )

build:
	@set -e; \
	( cd $(BACKEND_DIR) && npm run build ); \
	( cd $(FRONTEND_DIR) && npm run build )

setup-hooks:
	@git config --local core.hooksPath .githooks
	@chmod +x .githooks/pre-commit

test:
	@set -e; \
	$(COMPOSE) up -d mysql; \
	$(COMPOSE) run --rm back-painel npm run test:run

ci: ci-backend ci-frontend

ci-backend:
	@set -e; \
	( cd $(BACKEND_DIR) && npm run format:check ); \
	( cd $(BACKEND_DIR) && npm run lint ); \
	( cd $(BACKEND_DIR) && \
		DATABASE_URL="$(BACKEND_CI_DATABASE_URL)" \
		SHADOW_DATABASE_URL="$(BACKEND_CI_SHADOW_DATABASE_URL)" \
		npm run typecheck )

ci-frontend:
	@set -e; \
	( cd $(FRONTEND_DIR) && npm run format:check ); \
	( cd $(FRONTEND_DIR) && npm run lint ); \
	( cd $(FRONTEND_DIR) && npm run typecheck )
