SHELL := /bin/bash

COMPOSE ?= docker compose
BACKEND_DIR := back-painel
FRONTEND_DIR := front-painel
PRETTIER := $(abspath $(BACKEND_DIR)/node_modules/.bin/prettier)
FORMAT_DIRS := $(BACKEND_DIR) $(FRONTEND_DIR)

.PHONY: run-dev down-dev format format-check lint build setup-hooks test

run-dev:
	@$(COMPOSE) up --build --remove-orphans

down-dev:
	@$(COMPOSE) down

format:
	@set -e; \
	if [ ! -x "$(PRETTIER)" ]; then \
		echo "prettier not found at $(PRETTIER). Run npm install in $(BACKEND_DIR) first." >&2; \
		exit 1; \
	fi; \
	for dir in $(FORMAT_DIRS); do \
		( cd $$dir && "$(PRETTIER)" --write . ); \
	done

format-check:
	@set -e; \
	if [ ! -x "$(PRETTIER)" ]; then \
		echo "prettier not found at $(PRETTIER). Run npm install in $(BACKEND_DIR) first." >&2; \
		exit 1; \
	fi; \
	for dir in $(FORMAT_DIRS); do \
		( cd $$dir && "$(PRETTIER)" --check . ); \
	done

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
	( cd $(BACKEND_DIR) && npm run test:run )
