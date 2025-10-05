# Makefile for Docker operations

.PHONY: help build dev prod test clean stop logs shell install

# Default target
help:
	@echo "🐳 WOM Auth Client - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development server (http://localhost:4200)"
	@echo "  make dev-backend  - Start dev server with backend mock"
	@echo "  make logs         - View development logs"
	@echo "  make shell        - Open shell in dev container"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Build and start production server (http://localhost:8080)"
	@echo ""
	@echo "Testing:"
	@echo "  make test         - Run unit tests in container"
	@echo ""
	@echo "Maintenance:"
	@echo "  make build        - Build Docker images"
	@echo "  make stop         - Stop all containers"
	@echo "  make clean        - Remove containers, images and volumes"
	@echo "  make install      - Install dependencies in container"
	@echo ""

# Build all images
build:
	@echo "📦 Building Docker images..."
	docker-compose build

# Start development environment
dev:
	@echo "🚀 Starting development server..."
	docker-compose up dev

# Start development with backend
dev-backend:
	@echo "🚀 Starting development server with backend..."
	docker-compose --profile with-backend -f docker-compose.yml -f docker-compose.dev.yml up

# Start production environment
prod:
	@echo "🚀 Building and starting production server..."
	docker-compose --profile production up --build prod

# Run tests
test:
	@echo "🧪 Running tests..."
	docker-compose --profile test run --rm test

# View logs
logs:
	@echo "📋 Viewing development logs..."
	docker-compose logs -f dev

# Open shell in development container
shell:
	@echo "🐚 Opening shell in development container..."
	docker-compose exec dev sh

# Install/update dependencies
install:
	@echo "📥 Installing dependencies..."
	docker-compose run --rm dev pnpm install

# Stop all containers
stop:
	@echo "⏹️  Stopping all containers..."
	docker-compose --profile production --profile test --profile with-backend down

# Clean everything
clean:
	@echo "🧹 Cleaning Docker resources..."
	docker-compose --profile production --profile test --profile with-backend down -v --rmi all
	@echo "✨ Cleanup complete!"

# Rebuild and restart development
restart:
	@echo "🔄 Restarting development environment..."
	docker-compose down
	docker-compose up --build dev
