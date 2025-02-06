import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";

const api_url = "https://jsonplaceholder.typicode.com/posts"

const fetchPosts = async () => {
    const response = await fetch(api_url);
    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }
    console.log(response.json)
    return response.json();
  };

  export const CreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newPost: { title: string; body: string, userId: any }) => {
            const { data } = await axios.post(api_url, newPost);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
};

export const EditPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updatedPost }: { id: number; updatedPost: { title: string; body: string; userId: any } }) => {
            const { data } = await axios.patch(`${api_url}/${id}`, updatedPost);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
};

export const deletePost = async (postId) => {
    try {
      const response = await axios.delete(`${api_url}/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  };


  export function Posts() {
    return useQuery({
      queryKey: ["posts"],
      queryFn: fetchPosts,
    });
  }