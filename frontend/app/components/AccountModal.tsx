import { useState, useEffect } from "react";
import { Download, Trash2, X, Plus, Edit2, Palette } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { deleteAccount, downloadAccountData } from "../services/account";
import {
  getAllStatuses,
  getCustomStatuses,
  saveStatus,
  deleteStatus,
  forceDeleteStatus,
  fixUnknownStatuses,
  DEFAULT_STATUSES,
  type StatusDefinition,
} from "../services/status";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onAccountDeleted: () => void;
}

export default function AccountModal({
  isOpen,
  onClose,
  username,
  onAccountDeleted,
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "statuses">("general");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Status management state
  const [customStatuses, setCustomStatuses] = useState<StatusDefinition[]>([]);
  const [editingStatus, setEditingStatus] = useState<StatusDefinition | null>(null);
  const [statusName, setStatusName] = useState("");
  const [statusColor, setStatusColor] = useState("#3b82f6");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<{
    statusId: string;
    count: number;
  } | null>(null);

  // Load custom statuses
  useEffect(() => {
    if (isOpen && activeTab === "statuses") {
      loadCustomStatuses();
    }
  }, [isOpen, activeTab]);

  const loadCustomStatuses = async () => {
    const statuses = await getCustomStatuses();
    setCustomStatuses(statuses);
  };

  const handleDownloadData = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      await downloadAccountData();
    } catch (err) {
      console.error("Failed to download data:", err);
      setError(err instanceof Error ? err.message : "Failed to download data");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError("Please enter your password");
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      const response = await deleteAccount(deletePassword);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      // Account deleted successfully
      onAccountDeleted();
      onClose();
    } catch (err) {
      console.error("Failed to delete account:", err);
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setDeletePassword("");
    setError(null);
    setActiveTab("general");
    setEditingStatus(null);
    setStatusName("");
    setStatusColor("#3b82f6");
    setDeleteWarning(null);
    onClose();
  };

  const handleSaveStatus = async () => {
    if (!statusName.trim()) {
      setError("Status name is required");
      return;
    }

    try {
      setIsSavingStatus(true);
      setError(null);
      const result = await saveStatus(
        statusName,
        statusColor,
        editingStatus?.id
      );

      if (!result.success) {
        setError(result.error || "Failed to save status");
        return;
      }

      // Reset form and reload
      setEditingStatus(null);
      setStatusName("");
      setStatusColor("#3b82f6");
      await loadCustomStatuses();
    } catch (err) {
      setError("Failed to save status");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    try {
      setError(null);
      const result = await deleteStatus(statusId);

      if (result.warning) {
        setDeleteWarning({
          statusId,
          count: result.ideasCount || 0,
        });
        return;
      }

      if (!result.success) {
        setError(result.error || "Failed to delete status");
        return;
      }

      await loadCustomStatuses();
    } catch (err) {
      setError("Failed to delete status");
    }
  };

  const handleForceDeleteStatus = async () => {
    if (!deleteWarning) return;

    try {
      setError(null);
      const result = await forceDeleteStatus(deleteWarning.statusId);

      if (!result.success) {
        setError(result.error || "Failed to delete status");
        return;
      }

      setDeleteWarning(null);
      await loadCustomStatuses();
    } catch (err) {
      setError("Failed to delete status");
    }
  };

  const handleFixUnknown = async (newStatusId: string) => {
    try {
      setError(null);
      const result = await fixUnknownStatuses(newStatusId);

      if (!result.success) {
        setError(result.error || "Failed to fix unknown statuses");
        return;
      }

      setError(`Updated ${result.updatedCount} idea(s) successfully`);
    } catch (err) {
      setError("Failed to fix unknown statuses");
    }
  };

  const startEditStatus = (status: StatusDefinition) => {
    setEditingStatus(status);
    setStatusName(status.name);
    setStatusColor(status.color);
  };

  const cancelEditStatus = () => {
    setEditingStatus(null);
    setStatusName("");
    setStatusColor("#3b82f6");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Account Management">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("statuses")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "statuses"
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Status Definitions
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* General Tab */}
        {activeTab === "general" && (
          <>
            {/* Account Info */}
            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                Signed in as
              </p>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {username}
              </p>
            </div>

            {!showDeleteConfirm ? (
              <>
                {/* Download Data */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Download Your Data
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Download all your ideas and account information as a JSON file.
                  </p>
                  <Button
                    onClick={handleDownloadData}
                    disabled={isDownloading}
                    className="w-full"
                    variant="secondary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? "Downloading..." : "Download Data"}
                  </Button>
                </div>

                {/* Divider */}
                <div className="border-t border-[var(--color-border)]" />

                {/* Delete Account */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-red-500">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="ghost"
                    className="w-full text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Delete Confirmation */}
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-500 mb-2">
                      Are you absolutely sure?
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      This action will permanently delete your account, all your ideas, and any other associated data.
                      This cannot be undone.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="delete-password"
                      className="block text-sm font-medium text-[var(--color-text-primary)]"
                    >
                      Enter your password to confirm
                    </label>
                    <input
                      id="delete-password"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled={isDeleting}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword("");
                        setError(null);
                      }}
                      variant="secondary"
                      className="flex-1"
                      disabled={isDeleting}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      disabled={isDeleting || !deletePassword}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? "Deleting..." : "Delete Forever"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Statuses Tab */}
        {activeTab === "statuses" && (
          <>
            {/* Delete Warning Modal */}
            {deleteWarning && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-3">
                <h3 className="text-lg font-semibold text-yellow-500">
                  Warning: Status In Use
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {deleteWarning.count} idea(s) use this status. If you continue, these ideas will be marked as "Unknown" and you'll need to reassign them.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setDeleteWarning(null)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleForceDeleteStatus}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Continue Anyway
                  </Button>
                </div>
              </div>
            )}

            {/* Default Statuses (read-only) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Default Statuses
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                These are built-in statuses that cannot be modified or deleted.
              </p>
              <div className="space-y-2">
                {DEFAULT_STATUSES.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center gap-3 p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm font-medium text-[var(--color-text-primary)] flex-1">
                      {status.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-border)]" />

            {/* Custom Statuses */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Custom Statuses
              </h3>
              
              {/* Add/Edit Form */}
              <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg space-y-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                    Status Name
                  </label>
                  <input
                    type="text"
                    value={statusName}
                    onChange={(e) => setStatusName(e.target.value)}
                    placeholder="e.g., On Hold, Archived"
                    maxLength={50}
                    className="w-full px-4 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={statusColor}
                      onChange={(e) => setStatusColor(e.target.value)}
                      className="w-16 h-10 rounded border border-[var(--color-border)] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={statusColor}
                      onChange={(e) => setStatusColor(e.target.value)}
                      placeholder="#3b82f6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      className="flex-1 px-4 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {editingStatus && (
                    <Button
                      onClick={cancelEditStatus}
                      variant="secondary"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveStatus}
                    disabled={isSavingStatus || !statusName.trim()}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingStatus ? "Update Status" : "Add Status"}
                  </Button>
                </div>
              </div>

              {/* Custom Status List */}
              {customStatuses.length > 0 ? (
                <div className="space-y-2">
                  {customStatuses.map((status) => (
                    <div
                      key={status.id}
                      className="flex items-center gap-3 p-3 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm font-medium text-[var(--color-text-primary)] flex-1">
                        {status.name}
                      </span>
                      <Button
                        onClick={() => startEditStatus(status)}
                        variant="ghost"
                        className="p-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteStatus(status.id)}
                        variant="ghost"
                        className="p-2 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">
                  No custom statuses yet. Add one above!
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
