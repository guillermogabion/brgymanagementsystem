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


// ... (imports remain the same)

export default function DocumentsPage() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<DocumentTemplate[]>([]);
    const [loading, setLoading] = useState(true); // Initialized true
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [documentsToDelete, setDocumentsToDelete] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [deleteAlert, setDeleteAlert] = useState<{
        show: boolean;
        variant: "success" | "error";
        message: string;
    }>({ show: false, variant: "success", message: "" });

    const loadTemplates = async () => {
        setLoading(true); // Start loading
        try {
            const response = await documentService.getAll(page, limit, search);
            setDocuments(response.data || []); 
            setTotalPages(response.pages || 1);
        } catch (err) {
            console.error("Frontend Load Error:", err);
        } finally {
            setLoading(false); // End loading
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadTemplates();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [page, search]);

    const confirmDelete = async () => {
        if (documentsToDelete === null) return;
        
        setIsDeleting(true);
        try {
            // FIX: Use documentService instead of residentService
            await documentService.delete(documentsToDelete);
            
            setDocuments(documents.filter((doc) => doc.id !== documentsToDelete));
            setDeleteAlert({
                show: true,
                variant: "success",
                message: "Template deleted successfully.",
            });
            setIsDeleteModalOpen(false);
        } catch (err) {
            setDeleteAlert({
                show: true,
                variant: "error",
                message: "Failed to delete template.",
            });
        } finally {
            setIsDeleting(false);
            setDocumentsToDelete(null);
            setTimeout(() => setDeleteAlert(prev => ({ ...prev, show: false })), 5000);
        }
    };

    return (
        <>
            {/* Show Alert if active */}
            {/* {deleteAlert.show && (
                <div className="mb-4">
                    <Alert variant={deleteAlert.variant} title={deleteAlert.message} />
                </div>
            )} */}

            <div className="flex items-center justify-between mb-6">
                <PageBreadcrumb pageTitle="Document Management" />
                <div className="flex flex-1 max-w-md mx-4">
                    <input 
                        type="text"
                        placeholder="Search template name..."
                        className="w-full rounded-md border border-stroke px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <Button 
                    onClick={() => navigate("add")}
                    variant="primary"
                >
                    + Create Template
                </Button>
            </div>

            <ComponentCard title="Available Templates">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-stroke dark:border-strokedark text-left">
                            <th className="py-4 px-4 font-medium text-black dark:text-white">Template Name</th>
                            <th className="py-4 px-4 font-medium text-black dark:text-white">Date Created</th>
                            <th className="py-4 px-4 font-medium text-black dark:text-white text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id} className="border-b border-stroke dark:border-strokedark">
                                <td className="py-4 px-4 text-sm text-black dark:text-white font-medium">
                                    {doc.name}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-500">
                                   {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A"}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => navigate(`edit/${doc.id}`)}>
                                            <Badge variant="light" color="primary">Edit</Badge>
                                        </button>
                                        <button onClick={() => {
                                            setDocumentsToDelete(doc.id);
                                            setIsDeleteModalOpen(true);
                                        }}>
                                            <Badge variant="light" color="error">Delete</Badge>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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
                
                {/* Empty State */}
                {!loading && documents.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No templates found.</div>
                )}
                
                {/* Pagination Controls ... (Same as your code) */}
            </ComponentCard>

            {/* <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                loading={isDeleting}
            /> */}
        </>
    );
}