import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Draggable from "react-draggable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { documentService, DocumentLayout, LayoutItem } from "../../services/documentService";

export default function DocumentDesigner() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

  // 1. Setup State
    const [templateName, setTemplateName] = useState("");
    const [layout, setLayout] = useState<DocumentLayout>({
        province: { label: "Province of Cebu", x: 280, y: 20, fontSize: 14, isBold: false },
        municipality: { label: "Municipality of Argao", x: 270, y: 40, fontSize: 14, isBold: false },
        brgy: { label: "BARANGAY POBLACION", x: 275, y: 60, fontSize: 16, isBold: true },
        title: { label: "OFFICE OF THE BARANGAY CHAIRMAN", x: 230, y: 100, fontSize: 18, isBold: true },
        documentTitle: { label: "BARANGAY CLEARANCE", x: 250, y: 180, fontSize: 28, isBold: true },
        content: { label: "This is to certify that the person named below...", x: 50, y: 250, fontSize: 12, isBold: false },
        captain: { label: "HON. JUAN DELA CRUZ", x: 450, y: 500, fontSize: 14, isBold: true },
        position: { label: "Barangay Captain", x: 470, y: 520, fontSize: 12, isBold: false },
    });

    const [loading, setLoading] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const RESIDENT_VARIABLES = [
        { label: "Full Name", value: "{{fullName}}" },
        { label: "First Name", value: "{{firstName}}" },
        { label: "Last Name", value: "{{lastName}}" },
        { label: "Address/Purok", value: "{{purok}}" },
        { label: "Birth Date", value: "{{birthDate}}" },
        { label: "Age", value: "{{age}}" },
        { label: "Civil Status", value: "{{civilStatus}}" },
    ];

  // 2. Load data if in Edit Mode
  useEffect(() => {
    if (id) {
      const loadTemplate = async () => {
        setLoading(true);
        try {
          const data = await documentService.getById(Number(id));
          setTemplateName(data.name);
          setLayout(data.layoutSettings);
        } catch (err) {
          setErrorMessage("Failed to load template data.");
        } finally {
          setLoading(false);
        }
      };
      loadTemplate();
    }
  }, [id]);

  // 3. Handle Changes
  const updateField = (key: string, field: keyof LayoutItem, value: any) => {
    setLayout((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmissionStatus("idle");

    console.log(templateName, layout)

    try {
      const payload = {
        name: templateName,
        layoutSettings: layout,
      };

      if (isEditMode && id) {
        await documentService.update(Number(id), payload);
      } else {
        await documentService.create(payload);
      }

      setSubmissionStatus("success");
      setSuccessMessage(`Successfully ${isEditMode ? "updated" : "created"} template.`);

      setTimeout(() => {
        navigate("/TailAdmin/documents"); // Adjust this route to your actual templates list route
      }, 2000);
    } catch (err: any) {
      setSubmissionStatus("error");
      setErrorMessage(err.response?.data?.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to append variable to a specific field's label
  const injectVariable = (key: string, variable: string) => {
    const currentLabel = layout[key].label;
    updateField(key, "label", currentLabel + " " + variable);
  };

  return (
    <>
      <PageBreadcrumb
        pageTitle={isEditMode ? "Edit Template" : "Create New Template"}
        parentTitle="Templates List"
        parentRoute="/TailAdmin/templates"
      />

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* SIDEBAR: Controls */}
        <div className="w-full lg:w-80">
          <ComponentCard title="Designer Controls">
            {/* NEW: VARIABLE TOOLBOX */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Variables (Click to copy)
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                {RESIDENT_VARIABLES.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(v.value);
                      // Optional: Show a toast "Copied!"
                    }}
                    className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-blue-300 rounded hover:bg-blue-100 transition shadow-sm"
                    title="Click to copy placeholder"
                  >
                    {v.label}: <span className="font-mono text-primary">{v.value}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-1 italic">
                * Paste these into any label to show real resident data.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {submissionStatus === "error" && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{errorMessage}</div>
              )}
              {submissionStatus === "success" && (
                <div className="text-sm text-green-500 bg-green-50 p-3 rounded-lg">{successMessage}</div>
              )}

              <Input
                placeholder="Template Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />

              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
                {Object.entries(layout).map(([key, item]) => (
                  <div key={key} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold text-primary uppercase">{key}</p>
                      
                      {/* QUICK INJECT BUTTON */}
                      <select 
                        className="text-[10px] border-none bg-transparent text-gray-500"
                        onChange={(e) => injectVariable(key, e.target.value)}
                        value=""
                      >
                        <option value="" disabled>+ Add Variable</option>
                        {RESIDENT_VARIABLES.map(v => (
                          <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      className="mb-2"
                      value={item.label}
                      onChange={(e) => updateField(key, "label", e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.fontSize}
                        onChange={(e) => updateField(key, "fontSize", parseInt(e.target.value))}
                      />
                      <Button
                        variant={item.isBold ? "primary" : "outline"}
                        size="sm"
                        onClick={() => updateField(key, "isBold", !item.isBold)}
                      >
                        B
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button variant="primary" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : isEditMode ? "Update Template" : "Save Template"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/TailAdmin/templates")}>
                  Cancel
                </Button>
              </div>
            </form>
          </ComponentCard>
        </div>

        {/* CANVAS: Visual Editor */}
        <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 p-8 rounded-xl border border-gray-300 dark:border-gray-700 flex justify-center">
          <div
            className="bg-white shadow-2xl relative"
            style={{
              width: "8.5in",
              height: "11in",
              minWidth: "8.5in",
              backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {Object.entries(layout).map(([key, item]) => (
              <Draggable
                key={key}
                bounds="parent"
                position={{ x: item.x, y: item.y }}
                onStop={(e, data) => {
                  updateField(key, "x", data.x);
                  updateField(key, "y", data.y);
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    fontSize: `${item.fontSize}px`,
                    fontWeight: item.isBold ? "bold" : "normal",
                    cursor: "move",
                    padding: "4px",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                  className="hover:outline hover:outline-1 hover:outline-primary rounded"
                >
                  {item.label}
                </div>
              </Draggable>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}