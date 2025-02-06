// DeleteModal.tsx
import React from 'react';
import { Posts } from '../../apis/posts';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onDelete }) => {
    const { data: posts } = Posts();
    console.log(posts)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-lg shadow-lg w-96">
    <h2 className="text-xl font-semibold text-center mb-4">Are you sure you want to delete this post? {posts.title}</h2>
    <div className="flex justify-end gap-4">
      <button 
        onClick={onDelete} 
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50">
        Yes, Delete
      </button>
      <button 
        onClick={onClose} 
        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50">
        Cancel
      </button>
    </div>
  </div>
</div>

  );
};

export default DeleteModal;
