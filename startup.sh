# Initial setup script for the application
#!/bin/bash

# Pull from the git repository
echo "Pulling latest changes from git repository..."
git pull

# Install dependencies for Frontend
echo "Installing dependencies for Frontend..."
cd frontend
pnpm i
cd ..

# Install dependencies for Backend
echo "Installing dependencies for Backend..."
cd backend
pnpm i
cd ..

# Build Frontend
echo "Building Frontend..."
cd frontend
pnpm build
cd ..

# Build Backend
echo "Building Backend..."
cd backend
pnpm build
cd ..

## Copy environment variables file
echo "Setting up environment variables..."
if [ -f ".env" ]; then
    cp .env backend/.env
    cp .env frontend/.env
else
    echo ".env file not found! Please create one before proceeding."
    exit 1
fi

echo "Setup completed successfully."

# Start the application
echo "Starting Thoughtful..."
cd backend
pnpm start
