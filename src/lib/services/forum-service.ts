import { supabase } from '@/lib/supabase';

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  post_count: number;
  created_at: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id: string;
  tags: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  is_pinned: boolean;
  is_solved: boolean;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    avatar_url?: string;
  };
}

export interface ForumComment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  parent_id?: string;
  like_count: number;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    avatar_url?: string;
  };
}

export const forumService = {
  getCategories: async (): Promise<ForumCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get forum categories error:', error);
      throw error;
    }
  },

  getPosts: async (
    categoryId?: string,
    limit: number = 10,
    offset: number = 0,
    searchQuery?: string,
    tags?: string[]
  ): Promise<ForumPost[]> => {
    try {
      let query = supabase
        .from('forum_posts')
        .select('*, user:user_id(username, avatar_url)')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      if (tags && tags.length > 0) {
        // This is a simplification - actual implementation would depend on how tags are stored
        query = query.contains('tags', tags);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get forum posts error:', error);
      throw error;
    }
  },

  getPostById: async (id: string): Promise<ForumPost | null> => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*, user:user_id(username, avatar_url)')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Increment view count
      await supabase
        .from('forum_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id);

      return data;
    } catch (error) {
      console.error(`Get forum post ${id} error:`, error);
      throw error;
    }
  },

  createPost: async (post: Omit<ForumPost, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count' | 'user'>): Promise<ForumPost> => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([{
          ...post,
          view_count: 0,
          like_count: 0,
          comment_count: 0,
        }])
        .select('*, user:user_id(username, avatar_url)')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Create forum post error:', error);
      throw error;
    }
  },

  getComments: async (postId: string): Promise<ForumComment[]> => {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*, user:user_id(username, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Get comments for post ${postId} error:`, error);
      throw error;
    }
  },

  createComment: async (comment: Omit<ForumComment, 'id' | 'created_at' | 'updated_at' | 'like_count' | 'user'>): Promise<ForumComment> => {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .insert([{
          ...comment,
          like_count: 0,
        }])
        .select('*, user:user_id(username, avatar_url)')
        .single();

      if (error) {
        throw error;
      }

      // Increment comment count on the post
      await supabase
        .from('forum_posts')
        .update({ comment_count: supabase.rpc('increment', { x: 1 }) })
        .eq('id', comment.post_id);

      return data;
    } catch (error) {
      console.error('Create comment error:', error);
      throw error;
    }
  },

  likePost: async (postId: string, userId: string): Promise<void> => {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('forum_post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('forum_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        // Decrement like count
        await supabase
          .from('forum_posts')
          .update({ like_count: supabase.rpc('decrement', { x: 1 }) })
          .eq('id', postId);
      } else {
        // Like
        await supabase
          .from('forum_post_likes')
          .insert([{ post_id: postId, user_id: userId }]);

        // Increment like count
        await supabase
          .from('forum_posts')
          .update({ like_count: supabase.rpc('increment', { x: 1 }) })
          .eq('id', postId);
      }
    } catch (error) {
      console.error(`Like/unlike post ${postId} error:`, error);
      throw error;
    }
  },

  likeComment: async (commentId: string, userId: string): Promise<void> => {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('forum_comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('forum_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);

        // Decrement like count
        await supabase
          .from('forum_comments')
          .update({ like_count: supabase.rpc('decrement', { x: 1 }) })
          .eq('id', commentId);
      } else {
        // Like
        await supabase
          .from('forum_comment_likes')
          .insert([{ comment_id: commentId, user_id: userId }]);

        // Increment like count
        await supabase
          .from('forum_comments')
          .update({ like_count: supabase.rpc('increment', { x: 1 }) })
          .eq('id', commentId);
      }
    } catch (error) {
      console.error(`Like/unlike comment ${commentId} error:`, error);
      throw error;
    }
  },

  markAsSolution: async (commentId: string, postId: string): Promise<void> => {
    try {
      // Update the comment
      await supabase
        .from('forum_comments')
        .update({ is_solution: true })
        .eq('id', commentId);

      // Update the post
      await supabase
        .from('forum_posts')
        .update({ is_solved: true })
        .eq('id', postId);
    } catch (error) {
      console.error(`Mark comment ${commentId} as solution error:`, error);
      throw error;
    }
  },
};
