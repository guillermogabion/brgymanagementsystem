import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import Badge from "../../components/ui/badge/Badge";
import DeleteConfirmationModal from "../../components/modal/DeleteConfirmationModal"; // New Import

import { residentService, Resident } from "../../services/residentService";
import { DocumentTemplate, documentService } from "../../services/documentService";
import Modal from "../../components/modal/Modal";


export default function ResidentsPage() {
    const navigate = useNavigate();
    const [residents, setResidents] = useState<Resident[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [residentToDelete, setResidentToDelete] = useState<number | null>(null);
    const [deleteStatus, setDeleteStatus] = useState<"idle" | "error" | "success">("idle");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [isGenModalOpen, setIsGenModalOpen] = useState(false);

    const [deleteAlert, setDeleteAlert] = useState<{
        show: boolean;
        variant: "success" | "error";
        message: string;
    }>({ show: false, variant: "success", message: "" });

    useEffect(() => {
        const fetchTemplates = async () => {
        const res = await documentService.getAll(1, 100, "");
        setTemplates(res.data);
        };
        fetchTemplates();
    }, []);

    const handleGenerateClick = (resident: Resident) => {
        setSelectedResident(resident);
        setIsGenModalOpen(true);
    };

    const handleProcessCertificate = (templateId: string) => {
        // Navigate to a new Print view with Resident ID and Template ID
        navigate(`/TailAdmin/documents/print/${templateId}/${selectedResident?.id}`);
    };
    
    

    const loadUsers = async () => {
        try {
            const response = await residentService.getAll(page, limit, search);
            // Ensure you are accessing response.data because your controller 
            // wraps the array inside a 'data' property.
            setResidents(response.data || []); 
            setTotalPages(response.pages || 1);
        } catch (err) {
            console.error("Frontend Load Error:", err);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
        loadUsers();
    }, 300); // 300ms debounce to prevent spamming the backend while typing

    return () => clearTimeout(delayDebounceFn);
    }, [page, search]);

    const openDeleteModal = (id: number) => {
        setResidentToDelete(id);
        setDeleteStatus("idle");
        setIsDeleteModalOpen(true);
    };
    
      // 2. Actually performs the API call
      const confirmDelete = async () => {
        if (residentToDelete === null) return;
        
        setIsDeleting(true);
        setDeleteAlert({ ...deleteAlert, show: false });
        try {
          await residentService.delete(residentToDelete);
          setResidents(residents.filter((resident) => resident.id !== residentToDelete));
          setDeleteAlert({
            show: true,
            variant: "success",
            message: "User has been successfully removed from the system.",
          });
    
          setIsDeleteModalOpen(false);
        } catch (err) {
          setDeleteAlert({
            show: true,
            variant: "error",
            message: "Failed to delete user. The database might be busy or the user no longer exists.",
          });
          setIsDeleteModalOpen(false);
        } finally {
          setIsDeleting(false);
          setResidentToDelete(null);
          
          if (deleteAlert.variant === "success") {
            setTimeout(() => setDeleteAlert(prev => ({ ...prev, show: false })), 5000);
          }
          
        }
      };
    const handleEdit = (resident: Resident) => {
        // This will navigate to your route like: /TailAdmin/residents/edit/5
        navigate(`edit/${resident.id}`);
    };

    return(
        <>
            <div className="flex items-center justify-between mb-6">
                <PageBreadcrumb pageTitle="Resident List" />
                <div className="flex flex-1 max-w-md mx-4">
                    <input 
                        type="text"
                        placeholder="Search name or Address..."
                        className="w-full rounded-md border border-stroke px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // Reset to page 1 on new search
                        }}
                    />
                </div>
                <Button 
                    onClick={() => navigate("add")}
                    className="rounded-md bg-primary px-5 py-2.5 text-white hover:bg-opacity-90"
                    variant="primary"
                    >
                    + Add Resident
                </Button>

                
            </div>
            <ComponentCard title="Residents">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b border-stroke dark:border-strokedark text-left">
                        <th className="py-4 px-4 font-medium text-black dark:text-white">Last Name</th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white">First Name</th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white text-right">Address</th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white text-right">Birth Date</th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white text-right">Phone Number</th>
                    </tr>
                    </thead>
                    <tbody>
                    {residents.map((resident) => (
                        <tr key={resident.id} className="border-b border-stroke dark:border-strokedark">
                            <td className="py-4 px-4 text-sm text-black dark:text-white">{resident.lastName}</td>
                            <td className="py-4 px-4 text-sm text-black dark:text-white">{resident.firstName}</td>
                            <td className="py-4 px-4 text-sm text-black dark:text-white">{resident.purok}</td>
                            <td className="py-4 px-4 text-sm text-black dark:text-white">{resident.birthDate}</td>
                            <td className="py-4 px-4 text-sm text-black dark:text-white">{resident.phoneNumber}</td>
                          
                            <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-3">
                                <button onClick={() => handleGenerateClick(resident)} className="text-success">
                                    <Badge color="success">Generate</Badge>
                                </button>
                                <button 
                                    onClick={() => handleEdit(resident)} 
                                    className="text-primary hover:underline text-sm font-medium"
                                >
                                    <Badge variant="light" color="primary" size="sm">
                                        Edit
                                    </Badge>
                                </button>
                                <button 
                                onClick={() => openDeleteModal(resident.id)} 
                                className="text-danger hover:underline text-sm font-medium"
                                >
                                <Badge variant="light" color="error" size="sm">
                                    Delete
                                </Badge>
                                </button>

                            </div>
                                
                            </td>
                        </tr>
                    ))}
                    {residents.length === 0 && !loading && (
                        <tr><td colSpan={3} className="text-center py-10 text-gray-500">No users found.</td></tr>
                    )}
                    </tbody>
                </table>
                <div className="flex items-center justify-between mt-4 px-4 pb-4">
                <p className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                    <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className="rounded border border-stroke px-3 py-1 disabled:opacity-50 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4"
                    >
                    Previous
                    </button>
                    <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                    className="rounded border border-stroke px-3 py-1 disabled:opacity-50 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4"
                    >
                    Next
                    </button>
                </div>
                </div>
            </ComponentCard>

            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                loading={isDeleting}
                status={deleteStatus} // Pass the status here
            />

            <Modal isOpen={isGenModalOpen} onClose={() => setIsGenModalOpen(false)} title="Generate Certificate">
                <div className="p-4">
                    <p className="mb-4">Select a template for <strong>{selectedResident?.firstName}</strong>:</p>
                    <select 
                    className="w-full p-2 border rounded mb-4 dark:bg-boxdark"
                    onChange={(e) => handleProcessCertificate(e.target.value)}
                    defaultValue=""
                    >
                    <option value="" disabled>Choose Template...</option>
                    {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    </select>
                    <Button variant="outline" onClick={() => setIsGenModalOpen(false)}>Cancel</Button>
                </div>
            </Modal>
        </>
    )
}