# 🤔 Thoughtful...
This could use a thought...

## 💭 What does Thoughtful do?
Thoughtful is a small web app that lets you create ideas and list them in a clean and simple interface. It is designed to help you capture your thoughts and organize them effectively.

## 🤖 How to Setup

### 1. Docker (Recommended)
```bash
git clone https://github.com/Space-Banane/thoughtful.git
cd thoughtful
cp .env.sample .env
# Edit .env with your MongoDB connection string and cookie domain
docker-compose up -d
```

### 2. Manual Setup
#### Prerequisites
- Node.js (v22)
- pnpm
- MongoDB

#### Steps
```bash
git clone https://github.com/Space-Banane/thoughtful.git
cd thoughtful

# Configure environment variables
cp .env.sample .env
# Edit .env with your MongoDB connection string and cookie domain

cd frontend
pnpm install
pnpm build
cd ..

cd backend
pnpm install
pnpm start
```

## 🚀 Usage
Once the application is running, open your web browser and navigate to `http://localhost:8708` to start using Thoughtful.

Create an account, log in, and start adding your ideas!

## Tech Stack
- Frontend: React [Router], Tailwind CSS
- Backend: TypeScript, RJ-WEB
- Database: MongoDB

## Resources Used
[Thought-Icon](https://www.flaticon.com/free-icons/thought-bubble) by Freepik - Flaticon

## Thanks
Leave feedback and complain in the Issues page. Star if you like.