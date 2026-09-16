.PHONY: api worker migrate seed test eval

api:
	cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

worker:
	cd backend && python -m arq app.worker.WorkerSettings

migrate:
	cd backend && alembic upgrade head

migrate-down:
	cd backend && alembic downgrade -1

seed:
	cd backend && python -m scripts.seeds.run_seeds

test:
	cd backend && python -m pytest tests/ -v --tb=short

test-cov:
	cd backend && python -m pytest tests/ -v --cov=app --cov-report=term-missing

eval:
	cd backend && python -m app.eval.run_eval

lint:
	cd backend && python -m ruff check app/ tests/

format:
	cd backend && python -m ruff format app/ tests/

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

fresh: docker-up migrate seed
	@echo "Database ready with seed data"
