import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Ensure correct import for your router version
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { userService } from "../../services/userService";


interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  designation: string;
}

// 2. Define the Props for your component
interface SignUpFormProps {
  userToEdit?: User | null; // Can be a User object OR null
  onSuccess?: () => void;
}

export default function SignUpForm({ userToEdit = null, onSuccess = () => {} } : SignUpFormProps) {
  const isEditMode = !!userToEdit;
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(isEditMode); // Auto-check if editing
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "staff",
    designation: "PEACE_AND_ORDER",
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isEditMode && userToEdit) {
      setFormData({
        username: userToEdit.username || "",
        email: userToEdit.email || "",
        password: "", // Keep password empty in edit mode for security
        role: userToEdit.role || "staff",
        designation: userToEdit.designation || "PEACE_AND_ORDER",
      });
    }
  }, [isEditMode, userToEdit]);

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isChecked && !isEditMode) {
      setSubmissionStatus("error");
      setErrorMessage("Please agree to the terms and conditions.");
      return;
    }

    setLoading(true);
    setSubmissionStatus("idle");

    try {
      if (isEditMode && userToEdit) {
        await userService.update(userToEdit.id, formData);
      } else {
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
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            {isEditMode ? "Update User" : "Sign Up"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEditMode ? "Modify user credentials and roles." : "Enter your details to create an account."}
          </p>
        </div>

        {/* Status Messages */}
        {submissionStatus === "error" && (
          <div className="p-3 mb-4 text-xs text-red-500 bg-red-50 rounded border border-red-100">{errorMessage}</div>
        )}
        {submissionStatus === "success" && (
          <div className="p-3 mb-4 text-xs text-green-600 bg-green-50 rounded border border-green-100">
            User {isEditMode ? 'updated' : 'created'} successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Username */}
            <div>
              <Label>Username<span className="text-error-500">*</span></Label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label>Email<span className="text-error-500">*</span></Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label>
                Password{isEditMode ? " (Leave blank to keep current)" : <span className="text-error-500">*</span>}
              </Label>
              <div className="relative">
                <Input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  type={showPassword ? "text" : "password"}
                  required={!isEditMode}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? <EyeIcon className="size-5" /> : <EyeCloseIcon className="size-5" />}
                </span>
              </div>
            </div>

            {/* Designation Select */}
            <div>
              <Label>Designation</Label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full h-11 px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
              >
                <option value="PEACE_AND_ORDER">Peace and Order</option>
                <option value="HEALTH_AND_SANITATION">Health and Sanitation</option>
                <option value="EDUCATION_CULTURE_ARTS">Education, Culture and Arts</option>
                {/* ... add others as per your Prisma Enum ... */}
              </select>
            </div>

            {/* Checkbox (Only show for Sign Up) */}
            {!isEditMode && (
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <p className="text-xs text-gray-500">Agree to Terms & Privacy Policy</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg ${
                submissionStatus === "success" ? "bg-green-500" : "bg-brand-500 hover:bg-brand-600"
              } disabled:opacity-50`}
            >
              {loading ? "Processing..." : isEditMode ? "Save Changes" : "Sign Up"}
            </button>
          </div>
        </form>

        {!isEditMode && (
          <div className="mt-5 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Already have an account? <Link to="/signin" className="text-brand-500 font-medium">Sign In</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}