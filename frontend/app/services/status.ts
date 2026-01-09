// Status service for managing user-defined statuses

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Hardcoded default statuses (same as backend)
export const DEFAULT_STATUSES = [
  { id: "not-started", name: "Not Started", color: "#6b7280" },
  { id: "in-progress", name: "In Progress", color: "#3b82f6" },
  { id: "completed", name: "Completed", color: "#10b981" },
];

export interface StatusDefinition {
  id: string;
  name: string;
  color: string; // hex color
}

// Fetch all statuses (defaults + custom)
export async function getAllStatuses(): Promise<StatusDefinition[]> {
  try {
    const response = await fetch(`${API_BASE}/api/account/statuses`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch statuses");
    }

    const data = await response.json();
    // Merge defaults with user-defined statuses
    return [...DEFAULT_STATUSES, ...(data.statusDefinitions || [])];
  } catch (error) {
    console.error("Error fetching statuses:", error);
    // Return at least defaults if fetch fails
    return DEFAULT_STATUSES;
  }
}

// Get custom statuses only (no defaults)
export async function getCustomStatuses(): Promise<StatusDefinition[]> {
  try {
    const response = await fetch(`${API_BASE}/api/account/statuses`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch statuses");
    }

    const data = await response.json();
    return data.statusDefinitions || [];
  } catch (error) {
    console.error("Error fetching custom statuses:", error);
    return [];
  }
}

// Create or update a status
export async function saveStatus(
  name: string,
  color: string,
  id?: string
): Promise<{ success: boolean; status?: StatusDefinition; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/account/statuses/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id, name, color }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to save status" };
    }

    return { success: true, status: data.status };
  } catch (error) {
    console.error("Error saving status:", error);
    return { success: false, error: "Network error" };
  }
}

// Delete a status
export async function deleteStatus(
  id: string
): Promise<{
  success: boolean;
  warning?: boolean;
  message?: string;
  ideasCount?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/account/statuses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to delete status" };
    }

    // Check if warning about ideas using this status
    if (data.warning) {
      return {
        success: false,
        warning: true,
        message: data.message,
        ideasCount: data.ideasCount,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting status:", error);
    return { success: false, error: "Network error" };
  }
}

// Force delete a status (marks ideas as "deleted")
export async function forceDeleteStatus(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE}/api/account/statuses/${id}/force-delete`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to delete status" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error force deleting status:", error);
    return { success: false, error: "Network error" };
  }
}

// Fix unknown statuses (batch update "deleted" status ideas)
export async function fixUnknownStatuses(
  newStatusId: string
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/account/statuses/fix-unknown`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ newStatusId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to fix unknown statuses",
      };
    }

    return { success: true, updatedCount: data.updatedCount };
  } catch (error) {
    console.error("Error fixing unknown statuses:", error);
    return { success: false, error: "Network error" };
  }
}

// Get a status by ID (from all statuses including defaults)
export function getStatusById(
  statuses: StatusDefinition[],
  id: string | undefined
): StatusDefinition | null {
  if (!id) return null;
  return statuses.find((s) => s.id === id) || null;
}

// Special handling for "deleted" status
export const UNKNOWN_STATUS: StatusDefinition = {
  id: "deleted",
  name: "Unknown",
  color: "#ef4444",
};
