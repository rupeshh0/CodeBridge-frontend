'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PostCard, ForumPost } from '@/components/forum/post-card';
import { CreatePostDialog } from '@/components/forum/create-post-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Tag, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for forum posts
const FORUM_POSTS: ForumPost[] = [
  {
    id: '1',
    title: 'How to optimize recursive algorithms for better performance?',
    content: 'I\'m working on a recursive solution for a binary tree traversal problem, but it\'s running into performance issues with large inputs. Any tips on how to optimize recursive algorithms or alternative approaches?',
    author: {
      id: '101',
      username: 'algorithmAce',
      avatar: '',
    },
    createdAt: '2023-07-15T10:30:00Z',
    tags: ['algorithms', 'recursion', 'optimization', 'performance'],
    likes: 24,
    views: 156,
    replies: 8,
    isPinned: true,
  },
  {
    id: '2',
    title: 'Best practices for handling authentication in React applications',
    content: 'I\'m building a React application and need to implement user authentication. What are the current best practices for handling auth tokens, protected routes, and session management?',
    author: {
      id: '102',
      username: 'reactDeveloper',
      avatar: '',
    },
    createdAt: '2023-07-14T15:45:00Z',
    tags: ['react', 'authentication', 'security', 'frontend'],
    likes: 18,
    views: 132,
    replies: 12,
    isSolved: true,
  },
  {
    id: '3',
    title: 'Understanding async/await in JavaScript',
    content: 'I\'m having trouble understanding how async/await works in JavaScript. Can someone explain the concept with examples and how it differs from Promises?',
    author: {
      id: '103',
      username: 'jsNewbie',
      avatar: '',
    },
    createdAt: '2023-07-13T09:15:00Z',
    tags: ['javascript', 'async', 'promises'],
    likes: 32,
    views: 210,
    replies: 15,
  },
  {
    id: '4',
    title: 'Database design for a social media application',
    content: 'I\'m designing a database for a social media application with features like posts, comments, likes, and user relationships. What would be an efficient schema design for this?',
    author: {
      id: '104',
      username: 'dbDesigner',
      avatar: '',
    },
    createdAt: '2023-07-12T14:20:00Z',
    tags: ['database', 'sql', 'schema-design', 'social-media'],
    likes: 15,
    views: 98,
    replies: 7,
  },
  {
    id: '5',
    title: 'Tips for preparing for technical interviews',
    content: 'I have a technical interview coming up for a software engineering position. What are some effective strategies for preparation, especially for coding challenges and system design questions?',
    author: {
      id: '105',
      username: 'interviewPrep',
      avatar: '',
    },
    createdAt: '2023-07-11T11:10:00Z',
    tags: ['interviews', 'career', 'coding-challenges'],
    likes: 45,
    views: 320,
    replies: 22,
    isPinned: true,
  },
  {
    id: '6',
    title: 'How to implement a custom hook in React for form validation?',
    content: 'I want to create a reusable form validation hook in React. What\'s the best approach to handle different validation rules and error messages?',
    author: {
      id: '106',
      username: 'reactHooker',
      avatar: '',
    },
    createdAt: '2023-07-10T16:55:00Z',
    tags: ['react', 'hooks', 'forms', 'validation'],
    likes: 28,
    views: 175,
    replies: 9,
    isSolved: true,
  },
  {
    id: '7',
    title: 'Understanding Big O notation and time complexity',
    content: 'I\'m struggling to understand Big O notation and how to analyze the time complexity of algorithms. Could someone explain the concept with practical examples?',
    author: {
      id: '107',
      username: 'algorithmLearner',
      avatar: '',
    },
    createdAt: '2023-07-09T13:40:00Z',
    tags: ['algorithms', 'big-o', 'time-complexity'],
    likes: 36,
    views: 245,
    replies: 14,
  },
  {
    id: '8',
    title: 'Microservices vs Monolithic architecture: When to use which?',
    content: 'I\'m designing a new application and trying to decide between microservices and monolithic architecture. What are the pros and cons of each, and when should one be preferred over the other?',
    author: {
      id: '108',
      username: 'architectureGuru',
      avatar: '',
    },
    createdAt: '2023-07-08T10:25:00Z',
    tags: ['architecture', 'microservices', 'monolith', 'system-design'],
    likes: 29,
    views: 188,
    replies: 11,
  },
];

// Popular tags
const POPULAR_TAGS = [
  'javascript',
  'react',
  'algorithms',
  'python',
  'database',
  'frontend',
  'backend',
  'system-design',
  'career',
  'security',
];

export default function ForumPage() {
  return (
    <ProtectedRoute>
      <ForumContent />
    </ProtectedRoute>
  );
}

function ForumContent() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTags, setSelectedTags] = useState<string[]>(tagParam ? [tagParam] : []);
  
  // Filter posts based on active tab, search query, and selected tags
  const filteredPosts = FORUM_POSTS.filter(post => {
    // Filter by tab
    if (activeTab === 'solved' && !post.isSolved) return false;
    if (activeTab === 'unanswered' && post.replies > 0) return false;
    
    // Filter by search query
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Filter by selected tags
    if (selectedTags.length > 0 && !selectedTags.some(tag => post.tags.includes(tag))) return false;
    
    return true;
  });
  
  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'popular') {
      return b.views - a.views;
    } else if (sortBy === 'most-liked') {
      return b.likes - a.likes;
    } else if (sortBy === 'most-replies') {
      return b.replies - a.replies;
    }
    
    return 0;
  });
  
  // Add a tag to filter
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Remove a tag from filter
  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
          <p className="text-gray-600">Ask questions, share knowledge, and connect with other developers</p>
        </div>
        <CreatePostDialog onPostCreated={() => console.log('Post created')} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search discussions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Viewed</SelectItem>
                <SelectItem value="most-liked">Most Liked</SelectItem>
                <SelectItem value="most-replies">Most Replies</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Filtered by:</span>
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag} filter</span>
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedTags([])}
              >
                Clear All
              </Button>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="solved">Solved</TabsTrigger>
              <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {sortedPosts.length > 0 ? (
            <div>
              {sortedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters, or be the first to start a discussion!
              </p>
              <CreatePostDialog />
            </div>
          )}
        </div>
        
        <div>
          <div className="bg-card rounded-lg border p-4 mb-6">
            <h3 className="font-medium mb-3 flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => selectedTags.includes(tag) ? removeTag(tag) : addTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-medium mb-3">Forum Guidelines</h3>
            <ul className="space-y-2 text-sm">
              <li>Be respectful and kind to other members</li>
              <li>Stay on topic and avoid unnecessary tangents</li>
              <li>Use appropriate tags to categorize your posts</li>
              <li>Search before posting to avoid duplicates</li>
              <li>Format code snippets for better readability</li>
              <li>Provide context and details in your questions</li>
              <li>Mark solutions when your question is answered</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
