import React, { useEffect, useState } from "react";
import { userService, User } from "../../services/userService";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Modal from "../../components/modal/Modal"; 
import DeleteConfirmationModal from "../../components/modal/DeleteConfirmationModal"; // New Import
import UserForm from "./UsersForm"; 
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert"; // Your custom Alert component
import Badge from "../../components/ui/badge/Badge";
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // States for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "error" | "success">("idle");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Items per page



  const [deleteAlert, setDeleteAlert] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers();
    }, 300); // 300ms debounce to prevent spamming the backend while typing

    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  const loadUsers = async () => {
    try {
        const response = await userService.getAll(page, limit, search);
        // Ensure you are accessing response.data because your controller 
        // wraps the array inside a 'data' property.
        setUsers(response.data || []); 
        setTotalPages(response.pages || 1);
    } catch (err) {
        console.error("Frontend Load Error:", err);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // 1. Triggers the Delete Modal
  const openDeleteModal = (id: number) => {
    setUserToDelete(id);
    setDeleteStatus("idle");
    setIsDeleteModalOpen(true);
  };

  // 2. Actually performs the API call
  const confirmDelete = async () => {
    if (userToDelete === null) return;
    
    setIsDeleting(true);
    setDeleteAlert({ ...deleteAlert, show: false });
    try {
      await userService.delete(userToDelete);
      setUsers(users.filter((user) => user.id !== userToDelete));
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
      setUserToDelete(null);
      
      if (deleteAlert.variant === "success") {
        setTimeout(() => setDeleteAlert(prev => ({ ...prev, show: false })), 5000);
      }
      
    }
  };
  

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="User Management" />

        <div className="flex flex-1 max-w-md mx-4">
          <input
            type="text"
            placeholder="Search username or role..."
            className="w-full rounded-md border border-stroke px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to page 1 on new search
            }}
          />
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-primary px-5 py-2.5 text-white hover:bg-opacity-90"
          variant="primary"
        >
          + Add User
        </Button>
      </div>

      {deleteAlert.show && (
        <div className="mb-6">
          <Alert 
            variant={deleteAlert.variant}
            title={deleteAlert.variant === "success" ? "Action Successful" : "Action Failed"}
            message={deleteAlert.message}
          />
        </div>
      )}

      <ComponentCard title="System Users">
        <table className="min-w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark text-left">
                <th className="py-4 px-4 font-medium text-black dark:text-white">Username</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Role</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                  <tr key={user.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="py-4 px-4 text-sm text-black dark:text-white">{user.username}</td>
                    <td className="py-4 px-4 text-sm text-black dark:text-white">
                        <span className="inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium bg-success text-success">
                            {user.role}
                        </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => openEditModal(user)} 
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          <Badge variant="light" color="primary" size="sm">
                            Edit
                          </Badge>
                        </button>
                        <button 
                          onClick={() => openDeleteModal(user.id)} 
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
              {users.length === 0 && !loading && (
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

      {/* MODAL: ADD USER */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={selectedUser ? "Edit" : "Create"}
      >
        <UserForm 
          userToEdit={selectedUser} // Pass the user here!
          onSuccess={() => { handleCloseModal(); loadUsers(); }} 
          onCancel={handleCloseModal} 
        />
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={isDeleting}
        status={deleteStatus} // Pass the status here
      />
    </>
  );
}