import type { LucideIcon } from "lucide-react";
import { getIconFromName, getIconName } from "~/utils/iconMap";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoList {
  id: string;
  title: string;
  items: TodoItem[];
}

export interface Resource {
  name: string;
  link: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: LucideIcon;
  statusId?: string;
  todos: TodoList[];
  resources: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteDto {
  title: string;
  description: string;
  tags: string[];
  icon: string;
  statusId?: string;
  todos: TodoList[];
  resources: Resource[];
}

interface IdeaResponse {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  statusId?: string;
  todos: TodoList[];
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteResponse {
  success: boolean;
  idea: IdeaResponse;
}

export interface ListNotesResponse {
  success: boolean;
  ideas: IdeaResponse[];
}

export interface UpdateNoteResponse {
  success: boolean;
  idea: IdeaResponse;
}

export interface DeleteNoteResponse {
  success: boolean;
  message: string;
}

export interface SearchNotesResponse {
  success: boolean;
  ideas: IdeaResponse[];
  query: string;
}

const API_BASE = import.meta.env.VITE_API_URL;

function parseIdea(idea: IdeaResponse): Note {
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    tags: idea.tags,
    icon: getIconFromName(idea.icon),
    statusId: idea.statusId,
    todos: idea.todos || [],
    resources: idea.resources || [],
    createdAt: new Date(idea.createdAt),
    updatedAt: new Date(idea.updatedAt),
  };
}

export const notebookService = {
  async createNote(data: CreateNoteDto): Promise<Note> {
    const response = await fetch(`${API_BASE}/api/ideas/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create note");
    }

    const result: CreateNoteResponse = await response.json();
    return parseIdea(result.idea);
  },

  async listNotes(params?: {
    statusId?: string;
    sortBy?: "createdAt" | "updatedAt" | "title" | "statusId";
    sortOrder?: "asc" | "desc";
  }): Promise<Note[]> {
    const queryParams = new URLSearchParams();
    if (params?.statusId) queryParams.append("statusId", params.statusId);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${API_BASE}/api/ideas/list${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to list notes");
    }

    const result: ListNotesResponse = await response.json();
    return result.ideas.map(parseIdea);
  },

  async updateNote(id: string, data: Partial<CreateNoteDto>): Promise<Note> {
    const response = await fetch(`${API_BASE}/api/ideas/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update note");
    }

    const result: UpdateNoteResponse = await response.json();
    return parseIdea(result.idea);
  },

  async deleteNote(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/ideas/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete note");
    }
  },

  async searchNotes(query: string): Promise<Note[]> {
    const response = await fetch(`${API_BASE}/api/ideas/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to search notes");
    }

    const result: SearchNotesResponse = await response.json();
    return result.ideas.map(parseIdea);
  },
};
