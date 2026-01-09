import { useState } from "react";
import { Download, Trash2, X } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { deleteAccount, downloadAccountData } from "../services/account";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Account Management">
      <div className="space-y-6">
        {/* Account Info */}
        <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
            Signed in as
          </p>
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">
            {username}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

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
      </div>
    </Modal>
  );
}
