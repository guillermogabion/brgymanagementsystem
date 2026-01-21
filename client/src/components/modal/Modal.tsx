import React, { ReactNode } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 px-4 py-5">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-3 border-stroke dark:border-strokedark">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            {title}
          </h3>
          <button onClick={onClose} className="text-2xl hover:text-danger">
            &times;
          </button>
        </div>

        {/* Body Content */}
        <div className="mt-2">{children}</div>
      </div>
    </div>,
    document.body // This renders the modal at the very bottom of <body>
  );
};

export default Modal;