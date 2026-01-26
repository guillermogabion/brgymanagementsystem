import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon, UserIcon } from "../../icons"; // Added UserIcon as placeholder
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
  pic?: string; // Add pic to interface
}

interface SignUpFormProps {
  userToEdit?: User | null;
  onSuccess?: () => void;
}

export default function SignUpForm({ userToEdit = null, onSuccess = () => {} }: SignUpFormProps) {
  const navigate = useNavigate();
  
  const isEditMode = !!userToEdit;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(isEditMode);
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "staff",
    designation: "PEACE_AND_ORDER",
    pic: "", // Initialize pic state
  });

  useEffect(() => {
    if (isEditMode && userToEdit) {
      setFormData({
        username: userToEdit.username || "",
        email: userToEdit.email || "",
        password: "",
        role: userToEdit.role || "staff",
        designation: userToEdit.designation || "PEACE_AND_ORDER",
        pic: userToEdit.pic || "", // Load existing pic if available
      });
    }
  }, [isEditMode, userToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // NEW: Handle Image to Base64 Conversion
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit Check
        setSubmissionStatus("error");
        setErrorMessage("Image is too large. Please select a file under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, pic: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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

        // return console.log(formData)
        await userService.create(formData);
        setSubmissionStatus("success");

        // NEW: Redirect to Sign In after 2 seconds so they see the success message
        setTimeout(() => {
          navigate("/signin"); // Ensure this matches your route path
        }, 2000);
      }
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
        <div className="mb-5 sm:mb-8 text-center sm:text-left">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            {isEditMode ? "Update User" : "Sign Up"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEditMode ? "Modify user credentials and roles." : "Enter your details to create an account."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            
            {/* NEW: Profile Picture Upload UI */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative overflow-hidden bg-gray-100 rounded-full size-24 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                {formData.pic ? (
                  <img src={formData.pic} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    <UserIcon className="size-10" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-brand-500 hover:text-brand-600"
              >
                {formData.pic ? "Change Photo" : "Upload Photo"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>

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
              </select>
            </div>

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