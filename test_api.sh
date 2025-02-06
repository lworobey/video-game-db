#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo "Testing $name..."
    status=$(curl -s -o /dev/null -w "%{http_code}" $url)
    
    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}$name OK${NC}"
    else
        echo -e "${RED}$name Failed: Expected $expected_status, got $status${NC}"
        exit 1
    fi
}

# Test Frontend
test_endpoint "Frontend" "http://localhost:5173" 200

# Test Auth Service health
test_endpoint "Auth Service" "http://localhost:3000/health" 200

# Test Game Service
test_endpoint "Game Service" "http://localhost:3001/api/new-releases" 200 