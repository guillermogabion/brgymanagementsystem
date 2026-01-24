import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { residentService } from "../../services/residentService";

// Define the Resident type based on your Prisma schema
interface Resident {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber: string;
  purok: string;
  houseNumber: string;
  isIndigent: boolean;
  isSeniorCitizens: boolean; // Matches Prisma 'isSeniorCitizens'
}

interface ResidentFormProps {
  residentToEdit?: Resident | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ResidentsForm({ residentToEdit, onSuccess, onCancel }: ResidentFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mode detection: If we have an ID in the URL OR a resident prop, we are editing.
  const isEditMode = Boolean(residentToEdit || id);

  // 1. Setup Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    phoneNumber: "",
    purok: "",
    houseNumber: "",
    isIndigent: false,
    isSeniorCitizen: false,
  });

  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 2. Load data: Combined useEffect for both URL ID and Props
  useEffect(() => {
    const loadInitialData = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await residentService.getById(Number(id));
          mapDataToForm(data);
        } catch (err) {
          setErrorMessage("Failed to load resident data.");
        } finally {
          setLoading(false);
        }
      } else if (residentToEdit) {
        mapDataToForm(residentToEdit);
      }
    };

    const mapDataToForm = (data: any) => {
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        // Formats ISO date to YYYY-MM-DD
        birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
        phoneNumber: data.phoneNumber || "",
        purok: data.purok || "",
        houseNumber: data.houseNumber || "",
        // Boolean conversion: Handles both actual booleans and truthy values
        isIndigent: Boolean(data.isIndigent),
        isSeniorCitizen: Boolean(data.isSeniorCitizens || data.isSeniorCitizen),
      });
    };

    loadInitialData();
  }, [id, residentToEdit]);

  // 3. Handle Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 4. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmissionStatus("idle");

    try {
      const targetId = id ? Number(id) : residentToEdit?.id;

      if (isEditMode && targetId) {
        await residentService.update(targetId, formData as any);
      } else {
        await residentService.create(formData as any);
      }

      setSubmissionStatus("success");
      setSuccessMessage(`Successfully ${isEditMode ? "updated" : "created"} resident.`);

      // Optional: Clear form on success if adding new
      if (!isEditMode) {
        setFormData({
          firstName: "",
          lastName: "",
          birthDate: "",
          phoneNumber: "",
          purok: "",
          houseNumber: "",
          isIndigent: false,
          isSeniorCitizen: false,
        });
      }

      setTimeout(() => {
        if (typeof onSuccess === "function") {
          onSuccess();
        } else {
          navigate("/residents");
        }
      }, 2000);
    } catch (err: any) {
      setSubmissionStatus("error");
      setErrorMessage(err.response?.data?.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel ? onCancel() : navigate("/residents");
  };

  return (
    <>
      <PageBreadcrumb
        pageTitle={isEditMode ? "Edit Resident" : "Add New Resident"}
        parentTitle="Residents List"
        parentRoute="/residents"
      />

      <ComponentCard title={isEditMode ? "Edit Personal Information" : "Personal Information"}>
        <form onSubmit={handleSubmit}>
          {submissionStatus === "error" && (
            <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg text-center">
              {errorMessage}
            </div>
          )}
          {submissionStatus === "success" && (
            <div className="mb-4 text-sm text-green-500 bg-green-50 p-3 rounded-lg text-center">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">First Name</label>
              <Input name="firstName" placeholder="Enter first name" value={formData.firstName} onChange={handleChange} />
            </div>

            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Last Name</label>
              <Input name="lastName" placeholder="Enter last name" value={formData.lastName} onChange={handleChange} />
            </div>

            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Birth Date</label>
              <Input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
            </div>

            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Phone Number</label>
              <Input name="phoneNumber" placeholder="09123456789" value={formData.phoneNumber} onChange={handleChange} />
            </div>

            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Purok / Area</label>
              <Input name="purok" placeholder="e.g. Purok 1" value={formData.purok} onChange={handleChange} />
            </div>

            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">House Number</label>
              <Input name="houseNumber" placeholder="e.g. 123" value={formData.houseNumber} onChange={handleChange} />
            </div>

            {/* Checkbox Section */}
            <div className="md:col-span-2 flex gap-8 mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isIndigent"
                  checked={formData.isIndigent}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="font-medium text-black dark:text-white text-sm">Indigent Resident</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isSeniorCitizen"
                  checked={formData.isSeniorCitizen}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="font-medium text-black dark:text-white text-sm">Senior Citizen</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4.5 mt-8 border-t border-stroke pt-6 dark:border-strokedark">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button variant="primary" disabled={loading} >
              {loading ? "Saving..." : isEditMode ? "Update Resident" : "Save Resident"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}