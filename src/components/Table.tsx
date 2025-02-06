import React, { useState, useRef, useEffect } from "react";
import { Posts, CreatePost, EditPost, deletePost } from "../apis/posts"
import { FaPlus, FaPrint, FaSpinner, FaTrash } from "react-icons/fa6";
import { FaEdit, FaTimes, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import EditPostModal from "./modals/editPost";
import DeleteModal from "./modals/deletePost";
import { useReactToPrint, UseReactToPrintOptions } from "react-to-print";
import axios from "axios";
import { IoClose } from "react-icons/io5";

export default function Table() {
    const { data: posts, isLoading, isError, refetch } = Posts();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({ title: "", body: "", userId: 0 });
    const createPost = CreatePost()
    const editPost = EditPost()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: '', body: '', id: 0 });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState(null);
    const [postIdToPrint, setPostIdToPrint] = useState(null);
    const printRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1); // Current page
    const postsPerPage = 10;
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({
        key: null,
        direction: null,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState(posts);

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = posts?.filter(
          (post) =>
            post.id.toString().includes(lowercasedQuery) ||
            post.userId.toString().includes(lowercasedQuery) ||
            post.title.toLowerCase().includes(lowercasedQuery) ||
            post.body.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredData(filtered);
      }, [searchQuery, posts]);
    

    const openPrintModal = (postId: number) => {
        console.log("Print post ID:", postId);
        setPostIdToPrint(postId);
    };

    const closePrintModal = () => {
        setPostIdToPrint(null);
    };

    const handlePrint = useReactToPrint({
        content: () => printRef.current,

        // documentTitle: `${posts.title}`,
    } as UseReactToPrintOptions);

    const selectedPost = posts?.find((post) => post.id === postIdToPrint);


    const openDeleteModal = (postId: number) => {
        console.log(postId)
        // const postToDelete = posts.find((post) => post.id === postId);
        setPostIdToDelete(postId);
        setIsDeleteModalOpen(true);
    };

    const handleDeletePost = async () => {
        if (postIdToDelete === null) return;
        try {
            const result = await deletePost(postIdToDelete);
            console.log(result)
            setIsDeleteModalOpen(false)
        } catch (error) {
            // Handle error (optional)
            console.error('Failed to delete post:', error);
        }
    };


    if (isLoading) return <p className="flex items-center justify-center"><span>Loading </span><FaSpinner size={35} /></p>;
    if (isError) return <p>Error fetching data</p>;

    const getBgColor = (userId: number) => {
        const colors = [
            "bg-red-200", "bg-green-200", "bg-blue-200", "bg-yellow-200", "bg-purple-200",
            "bg-pink-200", "bg-indigo-200", "bg-teal-200", "bg-gray-200", "bg-orange-200"
        ];
        return colors[(userId - 1) % colors.length]; // Cycles through colors for user IDs 1-10
    };
    const handleCreatePost = () => {
        createPost.mutate(createFormData, {
            onSuccess: () => {
                setCreateFormData({ title: "", body: "", userId: 0 }); // Clear form
                setIsCreateModalOpen(false); // Close modal
            },
        });
    };
    const handleEdit = (postId: number) => {
        const postToEdit = posts.find((post: any) => post.id === postId);
        setEditFormData({ id: postToEdit.id, title: postToEdit.title, body: postToEdit.body });
        setIsEditModalOpen(true);
    };

    const handleUpdatePost = () => {
        editPost.mutate(
            { id: editFormData.id, updatedPost: { title: editFormData.title, body: editFormData.body, userId: editFormData.userId } },
            {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setEditFormData({ id: null, title: '', body: '' });
                },
            }
        );
    };

    const getTodayDate = (): string => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Formats date as YYYY-MM-DD
    };

    const handleSort = (key: keyof TableData) => {
        const newSortConfig = {
          key,
          direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
        };
    
        setSortConfig(newSortConfig);
    
        const sortedPosts = [...filteredData].sort((a, b) => {
          if (!newSortConfig.key) return 0; // No sorting applied
    
          let valueA = a[newSortConfig.key];
          let valueB = b[newSortConfig.key];
    
          if (typeof valueA === "string") valueA = valueA.toLowerCase();
          if (typeof valueB === "string") valueB = valueB.toLowerCase();
    
          if (valueA < valueB) return newSortConfig.direction === "asc" ? -1 : 1;
          if (valueA > valueB) return newSortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
    
        setFilteredData(sortedPosts); // Set the sorted posts to filteredData
      };
    

    // Get Sorting Icon
    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return <FaSort />;
        return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
    };


    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    // const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

    const totalPages = Math.ceil(filteredData?.length / postsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    console.log(postIdToPrint, selectedPost)
    return (
        <div className="py-6">
            <input
        type="text"
        placeholder="Search..."
        className="mb-4 p-2 border rounded w-[30vw]"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
                >
                    <FaPlus /> Create
                </button>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Create Post</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <FaTimes />
                            </button>
                        </div>
                        <input
                            type="number"
                            placeholder="User Id"
                            className="w-full p-2 border rounded-md mb-3"
                            value={createFormData.userId}
                            onChange={(e) => setCreateFormData({ ...createFormData, userId: Number(e.target.value) })}
                        />
                        <input
                            type="text"
                            placeholder="Title"
                            className="w-full p-2 border rounded-md mb-3"
                            value={createFormData.title}
                            onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                        />
                        <textarea
                            placeholder="Body"
                            className="w-full p-2 border rounded-md mb-3"
                            rows={3}
                            value={createFormData.body}
                            onChange={(e) => setCreateFormData({ ...createFormData, body: e.target.value })}
                        />
                        <button
                            onClick={handleCreatePost}
                            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 cursor-pointer"
                            disabled={createPost.isLoading}
                        >
                            {createPost.isLoading ? "Creating..." : "Submit"}
                        </button>
                    </div>
                </div>
            )}

            <table border={1} className="border ">

                <thead className="bg-gray-300">
                    <tr>
                        <th className="border px-4 py-2 cursor-pointer text-left">
                            <div className="flex items-center gap-2" onClick={() => handleSort("id")}>
                                ID <span>{getSortIcon("id")}</span>
                            </div>
                        </th>
                        <th className="border px-4 py-2 cursor-pointer text-left">
                            <div className="flex items-center gap-2" onClick={() => handleSort("userId")}>
                                User ID <span>{getSortIcon("userId")}</span>
                            </div>
                        </th>
                        <th className="border px-4 py-2 cursor-pointer text-left">
                            <div className="flex items-center gap-2" onClick={() => handleSort("title")}>
                                Title <span>{getSortIcon("title")}</span>
                            </div>
                        </th>
                        <th className="border px-4 py-2 cursor-pointer text-left">
                            <div className="flex items-center gap-2" onClick={() => handleSort("body")}>
                                Body <span>{getSortIcon("body")}</span>
                            </div>
                        </th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>

                <tbody >
                    {filteredData.map((post: { id: number; userId: number; title: string; body: string }) => (
                        <tr key={post.id} className="border capitalize">
                            <td className="border px-4">{post.id}</td>
                            <td className={`border px-4 `}>
                                <div className={`w-8 h-8 flex items-center justify-center rounded-md ${getBgColor(post.userId)}`}>

                                    {post.userId}
                                </div>
                            </td>
                            <td className="border px-4">{post.title}</td>
                            <td className="border max-w-[60vw] px-4">{post.body}</td>
                            <td className="border px-4 py-2">
                                <div className="flex gap-3">
                                    {/* Edit Button */}
                                    <button onClick={() => handleEdit(post.id)} className="text-yellow-600 hover:text-yellow-700 bg-yellow-700/10 p-2 rounded-md">
                                        <FaEdit size={25} />
                                    </button>

                                    {/* Delete Button */}
                                    <button onClick={() => openDeleteModal(post.id)} className="text-red-600 hover:text-red-700 bg-red-700/10 p-2 rounded-md">
                                        <FaTrash />
                                    </button>


                                    {/* Print Button */}
                                    <button onClick={() => openPrintModal(post.id)} className="text-green-600 hover:text-green-700 bg-green-700/10 p-2 rounded-md">
                                        <FaPrint />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))

                    }
                </tbody>

            </table>

            <div className="flex justify-between mt-4">
                <button onClick={handlePrev} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 ">
                    Previous
                </button>
                <button onClick={handleNext} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">
                    Next
                </button>
            </div>

            <EditPostModal
                isOpen={isEditModalOpen}
                closeModal={() => setIsEditModalOpen(false)}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                handleUpdatePost={handleUpdatePost}
                isLoading={editPost.isLoading}
            />

            {isDeleteModalOpen &&
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDelete={handleDeletePost}
                />
            }

            {postIdToPrint !== null && selectedPost && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/75">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                        {/* Close Button */}
                        <button
                            onClick={closePrintModal}
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
                        >
                            <IoClose size={25} />
                        </button>

                        {/* Printable Content */}
                        <div ref={printRef} className="text-center">
                            <h2 className="text-xl font-bold">{selectedPost.title}</h2>
                            <p className="text-gray-600">{selectedPost.body}</p>
                            <p className="text-gray-500 text-sm mt-2">Date: {getTodayDate()}</p>
                        </div>

                        {/* Print Button */}
                        <button
                            onClick={handlePrint}
                            className="mt-4 w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
                        >
                            Print
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}