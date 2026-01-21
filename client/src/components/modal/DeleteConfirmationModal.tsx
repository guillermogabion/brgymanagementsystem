import React from "react";
import Modal from "./Modal";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert"; // Assuming it's in components/ui/Alert

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  status: "idle" | "error" | "success";
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  status,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <div className="space-y-6">
        {/* Using your Alert component for the warning/status */}
        {status === "idle" && (
          <Alert
            variant="warning"
            title="Careful!"
            message="Are you sure you want to delete this user? This action will permanently remove their data from the system."
          />
        )}

        {status === "error" && (
          <Alert
            variant="error"
            title="Deletion Failed"
            message="We couldn't delete the user at this time. Please check your connection and try again."
          />
        )}

        {status === "success" && (
          <Alert
            variant="success"
            title="Deleted"
            message="The user has been successfully removed."
          />
        )}

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full justify-center rounded-md border border-stroke py-3 px-6 text-black hover:bg-gray-100 dark:border-strokedark dark:text-white"
          >
            Cancel
          </Button>
          {status !== "success" && (
            <Button
              variant="primary"
              onClick={onConfirm}
              className="w-full justify-center rounded-md bg-error-500 py-3 px-6 text-white hover:bg-opacity-90"
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Delete"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;