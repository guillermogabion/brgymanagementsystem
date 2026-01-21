import api from '../lib/axios';
import { Resident } from './residentService';
// 1. Define the Types
export interface LayoutItem {
  label: string;
  x: number;
  y: number;
  fontSize: number;
  isBold: boolean;
}

export interface DocumentLayout {
  [key: string]: LayoutItem;
}

export interface DocumentTemplate {
  id: number;
  name: string;
  layoutSettings: DocumentLayout; 
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedTemplates {
  data: DocumentTemplate[];
  total: number;
  pages: number;
}

// 2. Document Service Implementation
export const documentService = {
  // GET all templates (with optional pagination/search)
 getAll: async (page: number, limit: number, search: string) => {
        const res = await api.get(`/documents`, { params: { page, limit, search } });
        return res.data; // This is the object with { data, total, pages }
    },

  // GET one template
  getById: async (id: number): Promise<DocumentTemplate> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // CREATE template
  create: async (data: Omit<DocumentTemplate, 'id'>): Promise<DocumentTemplate> => {
    console.log(data, 'chcek')
    
    const response = await api.post('/documents', data);
    return response.data;
  },

  // UPDATE template
  update: async (id: number, data: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  // DELETE template
  delete: async (id: number) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};


// Bottom of src/services/documentService.ts

/**
 * Helper function to parse the template with real data
 */
export const fillTemplate = (layout: DocumentLayout, resident: Resident): DocumentLayout => {
  // We use a deep clone to ensure we don't accidentally mutate the original layout state
  const newLayout: DocumentLayout = JSON.parse(JSON.stringify(layout));

  const age = resident.birthDate 
    ? new Date().getFullYear() - new Date(resident.birthDate).getFullYear() 
    : "N/A";

  const dataMap: Record<string, string> = {
    "{{firstName}}": resident.firstName || "",
    "{{lastName}}": resident.lastName || "",
    "{{fullName}}": `${resident.firstName || ""} ${resident.lastName || ""}`,
    "{{purok}}": resident.purok || "",
    "{{birthDate}}": resident.birthDate || "",
    "{{age}}": age.toString(),
  };

  Object.keys(newLayout).forEach((key) => {
    const item = newLayout[key as keyof DocumentLayout];
    if (item && item.label) {
      let text = item.label;
      Object.keys(dataMap).forEach((placeholder) => {
        // Use a global regex to replace all instances of the placeholder
        text = text.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), dataMap[placeholder]);
      });
      item.label = text;
    }
  });

  return newLayout;
};