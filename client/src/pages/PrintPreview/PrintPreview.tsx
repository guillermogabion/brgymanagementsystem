import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentService, fillTemplate, DocumentLayout } from "../../services/documentService";
import { residentService } from "../../services/residentService";
import Button from "../../components/ui/button/Button";

export default function PrintPreview() {
  const { templateId, residentId } = useParams();
  const navigate = useNavigate();
  
  const [finalLayout, setFinalLayout] = useState<DocumentLayout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const template = await documentService.getById(Number(templateId));
        const resident = await residentService.getById(Number(residentId));
        const merged = fillTemplate(template.layoutSettings, resident);
        setFinalLayout(merged);
      } catch (err) {
        console.error("Print Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [templateId, residentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-10">Loading Certificate...</div>;

  return (
    <div className="flex flex-col items-center gap-4 py-10 bg-gray-100 min-h-screen dark:bg-boxdark print:bg-white print:p-0 print:m-0">
      
      {/* 1. DEEP CLEAN CSS */}
      <style>
        {`
          @media print {

            .your-image-class {
              content: url("data:image/jpeg;base64,/9j/4AAQSkZ...[your string]");
            }
            /* Hide the browser's default headers (URL/Date) */
            @page {
              margin: 0;
              size: auto;
            }

            /* HIDE EVERYTHING EXCEPT THE PRINTABLE AREA */
            body * {
              visibility: hidden;
            }

            #printable-area, #printable-area * {
              visibility: visible;
            }

            /* Position the certificate at the top-left of the page */
            #printable-area {
              position: absolute;
              left: 0;
              top: 0;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              visibility: visible !important;
            }

            /* Force hide TailAdmin specific structural elements */
            aside, header, footer, .sidebar, .app-header {
              display: none !important;
              height: 0 !important;
              width: 0 !important;
            }
          }
        `}
      </style>

      {/* Action Bar (Hidden during print) */}
      <div className="flex gap-4 print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        <Button variant="primary" onClick={handlePrint}>Print Now</Button>
      </div>

      {/* The Actual Document */}
      <div 
        id="printable-area"
        className="bg-white shadow-xl relative print:m-0"
        style={{ 
          width: "8.5in", 
          height: "11in",
          position: "relative" 
        }}
      >
        {finalLayout && Object.entries(finalLayout).map(([key, item]) => (
          <div
            key={key}
            style={{
              position: "absolute",
              left: `${item.x}px`,
              top: `${item.y}px`,
              fontSize: `${item.fontSize}px`,
              fontWeight: item.isBold ? "bold" : "normal",
              whiteSpace: key.includes("content") ? "normal" : "nowrap", // Allow content to wrap if needed
              maxWidth: key.includes("content") ? "7.5in" : "none",
            }}
          >
            {/* CHECK IF IT IS A LOGO OR TEXT */}
            {key.includes("logo") ? (
              item.label ? (
                <img 
                  src={item.label} 
                  style={{ width: `${item.fontSize}px`, height: 'auto' }} 
                  alt="logo" 
                />
              ) : null
            ) : (
              item.label
            )}
          </div>
        ))}
      </div>
    </div>
  );
}