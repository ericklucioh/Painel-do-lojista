SHELL := /bin/bash

COMPOSE ?= docker compose
BACKEND_DIR := back-painel
FRONTEND_DIR := front-painel

.PHONY: run-dev down-dev format format-check test

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

test:
	@set -e; \
	( cd $(BACKEND_DIR) && npm run test:run )
