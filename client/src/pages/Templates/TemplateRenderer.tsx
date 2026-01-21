import React, { useState } from "react";


interface TemplateElement {
  id: number;
  type: "text" | "variable";
  content?: string;
  name?: string; // for variables
  x: number | "center";
  y: number;
  fontSize?: number;
  fontWeight?: "bold" | "normal";
  underline?: boolean;
  width?: number;
  textAlign?: "left" | "center" | "right" | "justify";
}

interface DocumentTemplate {
  templateName: string;
  canvasSize: { width: string; height: string };
  elements: TemplateElement[];
}
const residentsList = [
  { id: 1, firstName: "Ian", lastName: "Doe", purok: "Purok 1", birthDate: "1996-12-29" },
  { id: 2, firstName: "Maria", lastName: "Santos", purok: "Purok 3", birthDate: "1999-12-29" }
];

// Address and Document Settings
const addressData = [
  { 
    id: 1, 
    country: "Republic of the Philippines", 
    province: "Northern Samar", 
    municipality: "San Isidro", 
    brgy: "Poblacion Norte", 
    docType: "Barangay Certification" 
  },
];

const template: DocumentTemplate = {
  templateName: "Resident Certification",
  canvasSize: { width: "8.5in", height: "11in" },
  elements: [
    { id: 1, type: "text", content: "[country]", x: "center", y: 40, fontSize: 14 },
    { id: 2, type: "text", content: "[province]", x: "center", y: 60, fontSize: 14 },
    { id: 3, type: "text", content: "[municipality]", x: "center", y: 80, fontSize: 14 },
    { id: 4, type: "text", content: "[brgy]", x: "center", y: 100, fontSize: 14 },
    { id: 5, type: "text", content: "[docType]", x: "center", y: 120, fontSize: 24 },
    // ... other elements
    { 
      id: 7, 
      type: "text", 
      content: "This is to certify that [fullName], of legal age, Filipino, and a bona fide resident of [brgy], [municipality], has been known to the undersigned for having a good moral character and being a law-abiding citizen. Based on our records, the aforementioned individual has no derogatory records or pending cases filed against them in this office. This certification is being issued upon the request of the interested party for whatever legal purpose it may serve.", 
      x: 100, 
      y: 380, 
      width: 620, 
      fontSize: 14, 
      textAlign: "justify" 
    },
    // Now TypeScript won't complain about 'underline' here:
    { id: 10, type: "text", content: "Sample Underlined Text", x: 100, y: 850, underline: true }
  ]
};

  export default function DynamicTemplate() {
    const [selectedResident, setSelectedResident] = useState(residentsList[0]);
    
    // Get current address config
    const currentAddress = addressData[0];

    const renderDynamicContent = (text: string | undefined, resident: any, addr: any) => {
    if (!text) return "";

    // 1. Define your replacements. 
    // Notice [fullName] is now a JSX Element.
    const replacements: Record<string, React.ReactNode> = {
      "[fullName]": <span style={{ fontWeight: "bold", textDecoration: "underline" }}>{`${resident.firstName} ${resident.lastName}`}</span>,
      "[age]": calculateAge(resident.birthDate),
      "[purok]": resident.purok || "__________",
      "[country]": addr.country,
      "[province]": addr.province,
      "[municipality]": addr.municipality,
      "[brgy]": addr.brgy.toUpperCase(),
      "[docType]": addr.docType.toUpperCase(),
    };

    // 2. Escape keys for Regex and join them with "|" (OR)
    const regex = new RegExp(
      Object.keys(replacements)
        .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|"),
      "g"
    );

    // 3. Split the text but keep the matches (the placeholders)
    // This creates an array like ["This is to certify ", "[fullName]", ", of legal age..."]
    const parts = text.split(regex);
    const matches = text.match(regex);

    // 4. Reconstruct the content by replacing placeholders with their values/JSX
    const result: React.ReactNode[] = [];
    
    parts.forEach((part, i) => {
      result.push(part); // Add the plain text part
      if (matches && matches[i]) {
        result.push(replacements[matches[i]]); // Add the replacement (String or JSX)
      }
    });

    return result;
  };

  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return "___";
    
    const today = new Date();
    const birthDate = new Date(birthDateString);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust if the birthday hasn't happened yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="bg-gray-200 min-h-screen p-10 flex flex-col items-center gap-6">
      
      {/* Selector UI */}
      <div className="bg-white p-4 rounded shadow-md w-full max-w-[8.5in] flex gap-4 print:hidden">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Select Resident</label>
          <select 
            className="border p-2 rounded w-full mt-1"
            value={selectedResident.id}
            onChange={(e) => setSelectedResident(residentsList.find(r => r.id === Number(e.target.value))!)}
          >
            {residentsList.map(r => (
              <option key={r.id} value={r.id}>{r.lastName}, {r.firstName}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 self-end text-white px-6 py-2 rounded hover:bg-blue-700 transition-all shadow-lg"
        >
          Print Document
        </button>
      </div>

      {/* DYNAMIC CANVAS */}
      <div 
        className="bg-white shadow-2xl relative font-serif text-black print:shadow-none overflow-hidden"
        style={{ width: template.canvasSize.width, height: template.canvasSize.height }}
      >
        {template.elements.map((el: TemplateElement) => (
          <div
            key={el.id}
            style={{
              position: "absolute",
              top: `${el.y}px`,
              left: el.x === "center" ? "50%" : `${el.x}px`,
              transform: el.x === "center" ? "translateX(-50%)" : "none",
              width: el.width ? `${el.width}px` : "auto",
              whiteSpace: el.width ? "normal" : "nowrap",
              textAlign: el.textAlign || "left",
              fontSize: `${el.fontSize || 16}px`,
              fontWeight: el.fontWeight || "normal",
              textDecoration: el.underline ? "underline" : "none", // Error Fixed!
              lineHeight: "3.8",
            }}
          >
            {renderDynamicContent(el.content, selectedResident, currentAddress)}
          </div>
        ))}
      </div>
    </div>
  );
}