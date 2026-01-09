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

echo "Setup completed successfully."

# Start the application
echo "Starting Thoughtful..."
cd backend
pnpm start
