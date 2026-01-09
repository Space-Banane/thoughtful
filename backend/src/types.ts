interface Session {
  token: string;
  userId: string;
  expiresAt: Date;
}

interface StatusDefinition {
  id: string;
  name: string;
  color: string; // hex color format
}

interface User {
  id: string;
  username: string;
  passwordHash: string;
  statusDefinitions?: StatusDefinition[];
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
  statusId?: string; // References StatusDefinition.id or hardcoded defaults
  todos: TodoList[];
  resources: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export { Session, User, StatusDefinition, Idea, TodoList, TodoItem, Resource };

// Hardcoded default statuses (not stored in DB)
export const DEFAULT_STATUSES = [
  { id: "not-started", name: "Not Started", color: "#6b7280" },
  { id: "in-progress", name: "In Progress", color: "#3b82f6" },
  { id: "completed", name: "Completed", color: "#10b981" },
];