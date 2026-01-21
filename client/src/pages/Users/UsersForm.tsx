import React, { useState, useEffect } from "react";
import { userService, User } from "../../services/userService";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";

interface UserFormProps {
  userToEdit?: User | null; // Receive the user data if in edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({ userToEdit, onSuccess, onCancel }: UserFormProps) {
  // 1. Initialize state based on whether we are editing or creating
  const [formData, setFormData] = useState({ 
    username: userToEdit?.username || "", 
    password: "", // Usually keep password empty during edit for security
    role: userToEdit?.role || "staff" 
  });
  
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isEditMode = !!userToEdit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmissionStatus("idle");

    try {
      if (isEditMode && userToEdit) {
        // CALL UPDATE
        await userService.update(userToEdit.id, formData);
      } else {
        // CALL CREATE
        await userService.create(formData);
      }

      setSubmissionStatus("success");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setSubmissionStatus("error");
      setErrorMessage(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* --- ALERT SECTION --- */}
      {submissionStatus === "success" && (
        <Alert 
          variant="success" 
          title={isEditMode ? "User Updated" : "User Created"} 
          message={isEditMode ? "Changes saved successfully." : "The new account has been added."} 
        />
      )}

      {submissionStatus === "error" && (
        <Alert variant="error" title="Action Failed" message={errorMessage} />
      )}

      {/* --- FORM FIELDS --- */}
      <div>
        <label className="mb-2.5 block text-black dark:text-white font-medium">Username</label>
        <input
          type="text"
          value={formData.username} // Bind value
          required
          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-strokedark"
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-2.5 block text-black dark:text-white font-medium">
          Password {isEditMode && <span className="text-xs text-gray-400 font-normal">(Leave blank to keep current)</span>}
        </label>
        <input
          type="password"
          required={!isEditMode} // Password required only for new users
          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-strokedark"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-2.5 block font-medium text-black dark:text-white">Role</label>
        <select
          value={formData.role} // Bind value
          className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none dark:border-strokedark dark:bg-boxdark"
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex gap-4 pt-4">
        <Button 
          disabled={loading || submissionStatus === "success"}
          className="w-full justify-center"
        >
          {loading ? "Saving..." : isEditMode ? "Update Changes" : "Create User"}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="w-full justify-center"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}