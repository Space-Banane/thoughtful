interface Session {
  token: string;
  userId: string;
  expiresAt: Date;
}

interface User {
  id: string;
  username: string;
  passwordHash: string;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoList {
  id: string;
  title: string;
  items: TodoItem[];
}

interface Resource {
  name: string;
  link: string;
}

interface Idea {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  todos: TodoList[];
  resources: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export { Session, User, Idea, TodoList, TodoItem, Resource };
