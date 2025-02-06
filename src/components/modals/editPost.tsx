// src/components/EditPostModal.tsx
import { FaTimes } from 'react-icons/fa';

interface EditPostModalProps {
  isOpen: boolean;
  closeModal: () => void;
  editFormData: { id: number | null; title: string; body: string };
  setEditFormData: React.Dispatch<React.SetStateAction<{ id: number | null; title: string; body: string }>>;
  handleUpdatePost: () => void;
  isLoading: boolean;
}

const EditPostModal = ({
  isOpen,
  closeModal,
  editFormData,
  setEditFormData,
  handleUpdatePost,
  isLoading,
}: EditPostModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Post</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded-md mb-3"
          value={editFormData.title}
          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
        />
        <textarea
          placeholder="Body"
          className="w-full p-2 border rounded-md mb-3"
          rows={3}
          value={editFormData.body}
          onChange={(e) => setEditFormData({ ...editFormData, body: e.target.value })}
        />
        <button
          onClick={handleUpdatePost}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
};

export default EditPostModal;
