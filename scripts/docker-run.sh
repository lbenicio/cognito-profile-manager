#!/bin/bash

# =============================================================================
# Cognito Profile Manager - Docker Run Script
# =============================================================================
# This script helps you run the Cognito Profile Manager Docker container
# with proper environment variable handling.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env.local"
IMAGE_NAME="cognito-profile-manager"
CONTAINER_NAME="cognito-profile-manager"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Display usage information
show_usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Commands:
    build           Build the Docker image
    run             Run the container (default)
    dev             Run development container with docker-compose
    prod            Run production container with docker-compose
    stop            Stop the running container
    logs            Show container logs
    shell           Open a shell in the running container
    clean           Remove container and image
    help            Show this help message

Options:
    --env-file FILE     Use specific environment file (default: .env.local)
    --port PORT         Expose on specific port (default: 3000)
    --detach            Run container in background
    --rebuild           Force rebuild the image

Examples:
    $0 build                    # Build the image
    $0 run --port 8080         # Run on port 8080
    $0 dev                     # Start development environment
    $0 prod                    # Start production environment
    $0 run --detach            # Run in background
    $0 logs                    # View logs
    $0 stop                    # Stop container

EOF
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Check if environment file exists
check_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        print_warning "Environment file not found: $ENV_FILE"
        if [[ -f "${SCRIPT_DIR}/.env.example" ]]; then
            print_status "Creating $ENV_FILE from .env.example template..."
            cp "${SCRIPT_DIR}/.env.example" "$ENV_FILE"
            print_warning "Please edit $ENV_FILE with your configuration before running the container."
            exit 1
        else
            print_error "No environment file found. Please create $ENV_FILE with your configuration."
            exit 1
        fi
    fi
}

# Validate critical environment variables
validate_env() {
    print_status "Validating environment variables..."

    # Source the environment file
    set -a
    source "$ENV_FILE"
    set +a

    local missing_vars=()
    local critical_vars=(
        "APP_URL"
        "TOTP_SECRET_ENCRYPTION_KEY"
        "NEXT_PUBLIC_COGNITO_CLIENT_ID"
        "NEXT_PUBLIC_COGNITO_WELLKNOWN"
        "AWS_REGION"
    )

    for var in "${critical_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        printf '  - %s\n' "${missing_vars[@]}"
        print_error "Please update $ENV_FILE with the required values."
        exit 1
    fi

    print_success "Environment validation passed!"
}

# Build Docker image
build_image() {
    local rebuild_flag=""
    if [[ "$1" == "--rebuild" ]]; then
        rebuild_flag="--no-cache"
        print_status "Force rebuilding Docker image..."
    else
        print_status "Building Docker image..."
    fi

    docker build $rebuild_flag -t "$IMAGE_NAME" "$SCRIPT_DIR"
    print_success "Docker image built successfully!"
}

# Run the container
run_container() {
    local port="3000"
    local detach_flag=""
    local extra_args=()

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --port)
                port="$2"
                shift 2
                ;;
            --detach)
                detach_flag="-d"
                shift
                ;;
            --env-file)
                ENV_FILE="$2"
                shift 2
                ;;
            *)
                extra_args+=("$1")
                shift
                ;;
        esac
    done

    check_env_file
    validate_env

    # Stop existing container if running
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        print_status "Stopping existing container..."
        docker stop "$CONTAINER_NAME" > /dev/null
        docker rm "$CONTAINER_NAME" > /dev/null
    fi

    print_status "Starting container on port $port..."

    docker run $detach_flag \
        --name "$CONTAINER_NAME" \
        --env-file "$ENV_FILE" \
        -p "$port:3000" \
        "${extra_args[@]}" \
        "$IMAGE_NAME"

    if [[ -n "$detach_flag" ]]; then
        print_success "Container started in background!"
        print_status "View logs with: $0 logs"
        print_status "Access the application at: http://localhost:$port"
    fi
}

# Run with docker-compose
run_compose() {
    local profile="$1"

    check_env_file
    validate_env

    print_status "Starting with docker-compose (profile: $profile)..."

    cd "$SCRIPT_DIR"
    docker-compose --profile "$profile" up --build
}

# Show container logs
show_logs() {
    if ! docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        print_error "Container '$CONTAINER_NAME' is not running."
        exit 1
    fi

    docker logs -f "$CONTAINER_NAME"
}

# Stop the container
stop_container() {
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        print_status "Stopping container..."
        docker stop "$CONTAINER_NAME"
        docker rm "$CONTAINER_NAME"
        print_success "Container stopped and removed!"
    else
        print_warning "Container '$CONTAINER_NAME' is not running."
    fi
}

# Open shell in container
open_shell() {
    if ! docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        print_error "Container '$CONTAINER_NAME' is not running."
        exit 1
    fi

    print_status "Opening shell in container..."
    docker exec -it "$CONTAINER_NAME" /bin/sh
}

# Clean up container and image
clean_up() {
    print_status "Cleaning up..."

    # Stop and remove container
    if docker ps -a -q -f name="$CONTAINER_NAME" | grep -q .; then
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
    fi

    # Remove image
    if docker images -q "$IMAGE_NAME" | grep -q .; then
        docker rmi "$IMAGE_NAME"
    fi

    print_success "Cleanup completed!"
}

# Main script logic
main() {
    check_docker

    local command="${1:-run}"
    shift || true

    case "$command" in
        build)
            build_image "$@"
            ;;
        run)
            run_container "$@"
            ;;
        dev)
            run_compose "dev"
            ;;
        prod)
            run_compose "prod"
            ;;
        logs)
            show_logs
            ;;
        stop)
            stop_container
            ;;
        shell)
            open_shell
            ;;
        clean)
            clean_up
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
