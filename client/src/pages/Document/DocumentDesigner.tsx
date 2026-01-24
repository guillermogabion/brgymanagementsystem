import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Draggable from "react-draggable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { documentService, DocumentLayout, LayoutItem } from "../../services/documentService";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

export default function DocumentDesigner() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [templateName, setTemplateName] = useState("");
    
    // Updated Initial State with width/height
    const [layout, setLayout] = useState<DocumentLayout>({
        logoLeft: { label: "", x: 50, y: 20, fontSize: 80, isBold: false, width: 100, height: 100, lineHeight: 0, letterSpacing: 0, fontFamily: 'unset' },
        logoRight: { label: "", x: 650, y: 20, fontSize: 80, isBold: false, width: 100, height: 100, lineHeight: 0, letterSpacing: 0, fontFamily: 'unset' },
        country: { label: "Republic of the Philippines", x: 285, y: 5, fontSize: 12, isBold: false, width: 250, height: 20, lineHeight: 1.2, letterSpacing: 0, fontFamily: 'serif' },
        province: { label: "Province of Northern Samar", x: 310, y: 22, fontSize: 14, isBold: false, width: 250, height: 25, lineHeight: 1.2, letterSpacing: 0, fontFamily: 'serif' },
        municipality: { label: "Municipality of San Isidro", x: 300, y: 42, fontSize: 14, isBold: false, width: 250, height: 25, lineHeight: 1.2, letterSpacing: 0, fontFamily: 'serif' },
        brgy: { label: "BARANGAY POBLACION NORTE", x: 275, y: 65, fontSize: 16, isBold: true, width: 300, height: 30, lineHeight: 1.2, letterSpacing: 0, fontFamily: 'serif' },
        title: { label: "OFFICE OF THE BARANGAY CHAIRMAN", x: 230, y: 100, fontSize: 18, isBold: true, width: 350, height: 40, lineHeight: 1.2, letterSpacing: 0, fontFamily: 'serif' },
        documentTitle: { label: "BARANGAY CLEARANCE", x: 250, y: 180, fontSize: 28, isBold: true, width: 400, height: 60, lineHeight: 1.2, letterSpacing: 0, fontFamily: 'serif' },
        content: { label: "This is to certify that {{fullName}}...", x: 50, y: 250, fontSize: 12, isBold: false, width: 700, height: 200, lineHeight: 1.5, letterSpacing: 0, fontFamily: 'serif' },
        captain: { label: "HON. JUAN DELA CRUZ", x: 450, y: 500, fontSize: 14, isBold: true, width: 250, height: 30, lineHeight: 1.2, letterSpacing: 0, fontFamily: 'serif' },
        position: { label: "Barangay Captain", x: 470, y: 520, fontSize: 12, isBold: false, width: 250, height: 20, lineHeight: 1.2, letterSpacing: 0, fontFamily: 'serif' },
    });

    const RESIDENT_VARIABLES = [
      { label: "Name", value: "{{fullName}}" },
      { label: "Purok", value: "{{purok}}" },
      { label: "Age", value: "{{age}}" },
      // { label: "Status", value: "{{civilStatus}}" },
    ];


    const [newFieldName, setNewFieldName] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeDrag, setActiveDrag] = useState<{ x: number, y: number } | null>(null);
    const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
    const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null); // NEW: Track active field

    const sidebarRefs = useRef<{ [key: string]: HTMLDivElement | null }>({}); // NEW: Refs for scrolling
    // Update Field Logic
    const updateField = (key: string, field: keyof LayoutItem, value: any) => { 
        setLayout((prev) => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }));
    };

    const scrollToSidebarItem = (key: string) => {
        setActiveFieldKey(key);
        const element = sidebarRefs.current[key];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    const handleImageUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                updateField(key, "label", event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { name: templateName, layoutSettings: layout };
            if (isEditMode && id) {
                await documentService.update(Number(id), payload);
            } else {
                await documentService.create(payload);
            }
            navigate("/documents");
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || "Error saving template.");
        } finally {
            setLoading(false);
        }
    };

    const addNewField = () => {
        if (!newFieldName.trim()) return;

        // Create a safe key (e.g., "Birth Place" -> "birthPlace")
        const key = newFieldName
            .toLowerCase()
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()
            )
            .replace(/\s+/g, "");

        if (layout[key]) {
            setErrorMessage("Field already exists!");
            return;
        }

        setLayout((prev) => ({
            ...prev,
            [key]: { 
            label: newFieldName, 
            x: 50, 
            y: 300, 
            fontSize: 12, 
            isBold: false, 
            width: 200,      // Your new width
            height: 50,      // Your new height
            lineHeight: 1.2, // Default line spacing
            letterSpacing: 0,// Default letter spacing
            fontFamily: 'serif' // Default font style
            },
        }));

        setNewFieldName(""); // Reset the input
        };

    const injectVariable = (key: string, variable: string) => {
        const textarea = textareaRefs.current[key];
        const currentLabel = layout[key].label;

        if (textarea) {
            // Get cursor positions
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            // Slice the text and insert the variable
            const newText = 
                currentLabel.substring(0, start) + 
                variable + 
                currentLabel.substring(end);

            updateField(key, "label", newText);

            // Optional: Put focus back and move cursor after the inserted variable
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + variable.length, start + variable.length);
            }, 0);
        } else {
            // Fallback if textarea isn't captured
            updateField(key, "label", currentLabel + " " + variable);
        }
    };

    useEffect(() => {
        const fetchTemplate = async () => {
            if (isEditMode && id) {
                setLoading(true);
                try {
                    // response is likely already the DocumentTemplate object
                    const response = await documentService.getById(Number(id));
                    
                    // If your service returns the object directly, use 'response'
                    // If it's wrapped in axios, use 'response.data'
                    const template = (response as any).data || response;

                    if (template) {
                        setTemplateName(template.name);
                        // Match the key name from your backend (layoutSettings)
                        if (template.layoutSettings) {
                            setLayout(template.layoutSettings);
                        }
                    }
                } catch (err: any) {
                    setErrorMessage("Failed to fetch template details.");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchTemplate();
    }, [id, isEditMode]);

    if (loading && isEditMode) {
        return <div className="p-10 text-center">Loading Template...</div>;
    }



    return (
        <>
            <PageBreadcrumb pageTitle={isEditMode ? "Edit Template" : "Create Template"} parentTitle="Templates" parentRoute="/documents" />

            <style>
                {`
                .react-resizable-handle {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background-color: #3b82f6;
                    bottom: -5px;
                    right: -5px;
                    cursor: se-resize;
                    border-radius: 50%;
                    z-index: 100;
                    border: 2px solid white;
                    box-shadow: 0 0 5px rgba(0,0,0,0.2);
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .draggable-container:hover .react-resizable-handle {
                    opacity: 1;
                }
                    .guide-center-v {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 50%;
                    width: 1px;
                    border-left: 1px solid rgba(220, 38, 38, 0.2); /* Soft red */
                    pointer-events: none;
                    z-index: 10;
                }
                .guide-center-h {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 50%;
                    height: 1px;
                    border-top: 1px solid rgba(220, 38, 38, 0.2); /* Soft red */
                    pointer-events: none;
                    z-index: 10;
                }

                .guide-line-x { position: absolute; left: 0; right: 0; height: 1px; border-top: 1px dashed #3b82f6; pointer-events: none; z-index: 50; }
                .guide-line-y { position: absolute; top: 0; bottom: 0; width: 1px; border-left: 1px dashed #3b82f6; pointer-events: none; z-index: 50; }
                .guide-is-centered { border-color: #ef4444 !important; border-style: solid !important; border-width: 2px !important; }
                

                .custom-scrollbar {
                    scroll-behavior: smooth;
                }
                /* Ensure the active item stands out */
                .active-control-highlight {
                    animation: pulse-blue 2s infinite;
                }
                @keyframes pulse-blue {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
                
                `}
            </style>

            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* SIDEBAR CONTROLS */}
                <div className="w-full lg:w-96">
                    <ComponentCard title="Designer Controls">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input 
                                placeholder="Template Name" 
                                value={templateName} 
                                onChange={(e) => setTemplateName(e.target.value)} 
                            />

                            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {Object.entries(layout).map(([key, item]) => (
                                    <div key={key}
                                     className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                     ref={(el) => { if (el) sidebarRefs.current[key] = el; }}
                                     >
                                        <div className="flex justify-between items-center mb-2">
                                        <p className={`text-[10px] font-bold uppercase ${activeFieldKey === key ? 'text-blue-600' : 'text-primary'}`}>{key}</p>
                                        {!key.includes("logo") && (
                                            <select 
                                            className="text-[10px] bg-transparent border-none outline-none font-medium text-gray-500"
                                            value={item.fontFamily || 'serif'}
                                            onChange={(e) => updateField(key, "fontFamily", e.target.value)}
                                            >
                                            <option value="serif">Serif</option>
                                            <option value="sans-serif">Sans-Serif</option>
                                            <option value="monospace">Monospace</option>
                                            <option value="'Times New Roman'">Times New Roman</option>
                                            <option value="Arial">Arial</option>
                                            </select>
                                        )}
                                        </div>

                                        {key.includes("logo") ? (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                            <input type="file" id={`file-${key}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(key, e)} />
                                            <Button type="button" variant="outline" size="sm" className="flex-1 text-[10px]" onClick={() => document.getElementById(`file-${key}`)?.click()}>Upload</Button>
                                            <Button type="button" variant="outline" size="sm" className="text-[10px] text-red-500" onClick={() => updateField(key, "label", "")}>Clear</Button>
                                            </div>
                                        </div>
                                        ) : (
                                        <div className="space-y-2">
                                            <textarea
                                            ref={(el) => { if (el) textareaRefs.current[key] = el; }}
                                            className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 resize-y min-h-[60px]"
                                            rows={2}
                                            value={item.label}
                                            onChange={(e) => updateField(key, "label", e.target.value)}
                                            onFocus={() => setActiveFieldKey(key)}
                                            />
                                            
                                            <div className="flex flex-wrap gap-1 mt-1">
                                            {RESIDENT_VARIABLES.map((v) => (
                                                <button
                                                key={v.value}
                                                type="button"
                                                onClick={() => injectVariable(key, v.value)}
                                                className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                                                >
                                                + {v.label}
                                                </button>
                                            ))}
                                            </div>
                                        </div>
                                        )}

                                        {/* SPACING CONTROLS */}
                                        <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-800">
                                        <div className="space-y-1">
                                            <label className="text-[9px] text-gray-400 block uppercase">Size</label>
                                            <input 
                                            type="number" 
                                            className="w-full p-1 text-xs border rounded dark:bg-gray-800"
                                            value={item.fontSize} 
                                            onChange={(e) => updateField(key, "fontSize", parseInt(e.target.value) || 0)} 
                                            />
                                        </div>
                                        {!key.includes("logo") && (
                                            <>
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-gray-400 block uppercase">Line</label>
                                                <input 
                                                type="number" 
                                                step="0.1"
                                                className="w-full p-1 text-xs border rounded dark:bg-gray-800"
                                                value={item.lineHeight || 1.2} 
                                                onChange={(e) => updateField(key, "lineHeight", parseFloat(e.target.value) || 1.2)} 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-gray-400 block uppercase">Letter</label>
                                                <input 
                                                type="number" 
                                                step="0.5"
                                                className="w-full p-1 text-xs border rounded dark:bg-gray-800"
                                                value={item.letterSpacing || 0} 
                                                onChange={(e) => updateField(key, "letterSpacing", parseFloat(e.target.value) || 0)} 
                                                />
                                            </div>
                                            </>
                                        )}
                                        </div>
                                        
                                        {!key.includes("logo") && (
                                        <Button 
                                            type="button" 
                                            variant={item.isBold ? "primary" : "outline"} 
                                            className="w-full mt-2 h-7 text-[10px]"
                                            onClick={() => updateField(key, "isBold", !item.isBold)}
                                        >
                                            BOLD
                                        </Button>
                                        )}
                                    </div>
                                    ))}
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold mb-2">Add Custom Field</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Field Name..." 
                                        className="flex-1 p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                                        value={newFieldName}
                                        onChange={(e) => setNewFieldName(e.target.value)}
                                    />
                                    <Button type="button" variant="outline" onClick={addNewField} className="whitespace-nowrap">+ Add</Button>
                                </div>
                            </div>

                            <Button variant="primary" className="w-full" disabled={loading}>
                                {loading ? "Saving..." : "Save Template"}
                            </Button>
                            {errorMessage && <p className="text-red-500 text-xs mt-2">{errorMessage}</p>}
                        </form>
                    </ComponentCard>
                </div>

                {/* CANVAS */}

                
                <div className="flex-1 bg-gray-200 dark:bg-gray-800 p-8 rounded-xl flex justify-center overflow-auto">
                    <div className="bg-white shadow-2xl relative" style={{ width: "8.5in", height: "11in", minWidth: "8.5in" }}>
                        <div className="absolute -top-6 left-0 right-0 h-6 canvas-ruler-top flex items-end text-[8px] text-gray-400 pb-1">
                            {[...Array(9)].map((_, i) => (
                                <span key={i} style={{ position: 'absolute', left: `${i}in` }}>{i}"</span>
                            ))}
                        </div>

                        {/* Left Ruler (Inches) */}
                        <div className="absolute top-0 -left-6 bottom-0 w-6 canvas-ruler-left flex flex-col items-end text-[8px] text-gray-400 pr-1">
                            {[...Array(12)].map((_, i) => (
                                <span key={i} style={{ position: 'absolute', top: `${i}in` }}>{i}"</span>
                            ))}
                        </div>

                        {/* Center Guides */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-100 pointer-events-none" />
                        <div className="absolute left-0 right-0 top-1/2 h-px bg-red-100 pointer-events-none" />

                        {/* Drag Guides */}
                        {activeDrag && (
                            <>
                                <div className={`guide-line-x ${Math.abs(activeDrag.y - 528) < 5 ? 'guide-is-centered' : ''}`} style={{ top: activeDrag.y }} />
                                <div className={`guide-line-y ${Math.abs(activeDrag.x - 408) < 5 ? 'guide-is-centered' : ''}`} style={{ left: activeDrag.x }} />
                            </>
                        )}

                        {Object.entries(layout).map(([key, item]) => (
                            <Draggable
                                key={key}
                                bounds="parent"
                                position={{ x: item.x, y: item.y }}
                                cancel=".react-resizable-handle"
                                onStart={(e, data) => {
                                    setActiveDrag({ x: data.x, y: data.y });
                                    scrollToSidebarItem(key); // Highlight sidebar on start
                                }}
                                onStop={(e, data) => {
                                    updateField(key, "x", data.x);
                                    updateField(key, "y", data.y);
                                    setActiveDrag(null);
                                }}
                            >
                                <div className={`absolute draggable-container ${activeFieldKey === key ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                 style={{ width: item.width, height: item.height }}>
                                    <ResizableBox
                                        width={item.width || 200}
                                        height={item.height || 50}
                                        minConstraints={[50, 20]}
                                        maxConstraints={[800, 1000]}
                                        onResizeStop={(e, { size }) => {
                                            updateField(key, "width", size.width);
                                            updateField(key, "height", size.height);
                                        }}
                                    >
                                        <div 
                                            className="hover:outline hover:outline-1 hover:outline-primary p-1 w-full h-full overflow-hidden"
                                            style={{ cursor: "move" }}
                                        >
                                            {key.includes("logo") ? (
                                                <img src={item.label || "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3e%3crect width='150' height='150' fill='%23cccccc'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23333333'%3eLOGO%3c/text%3e%3c/svg%3e"} style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                                    alt="logo"/>
                                            ) : (
                                                <div style={{ 
                                                    fontSize: `${item.fontSize}px`, 
                                                    fontWeight: item.isBold ? "bold" : "normal",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                    lineHeight: item.lineHeight, 
                                                    letterSpacing: `${item.letterSpacing}px`,
                                                    fontFamily: item.fontFamily
                                                }}>
                                                    {item.label}
                                                </div>
                                            )}
                                        </div>
                                    </ResizableBox>
                                </div>
                            </Draggable>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}