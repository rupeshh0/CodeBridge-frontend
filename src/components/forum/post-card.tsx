'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Eye, Tag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  likes: number;
  views: number;
  replies: number;
  isPinned?: boolean;
  isSolved?: boolean;
}

interface PostCardProps {
  post: ForumPost;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className={`mb-4 ${post.isPinned ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar} alt={post.author.username} />
            <AvatarFallback>{post.author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {post.isPinned && (
                <Badge variant="secondary" className="text-xs">Pinned</Badge>
              )}
              {post.isSolved && (
                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">Solved</Badge>
              )}
            </div>
            
            <Link href={`/forum/post/${post.id}`} className="hover:underline">
              <h3 className="text-lg font-semibold line-clamp-1">{post.title}</h3>
            </Link>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-2">
              {post.content}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <Link href={`/forum?tag=${tag}`} key={tag}>
                  <Badge variant="outline" className="hover:bg-secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{post.author.username}</span>
              <span className="mx-2">•</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t flex justify-between bg-muted/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm">
            <ThumbsUp className="h-4 w-4" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <MessageSquare className="h-4 w-4" />
            <span>{post.replies}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Eye className="h-4 w-4" />
            <span>{post.views}</span>
          </div>
        </div>
        
        <Link href={`/forum/post/${post.id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Read More
        </Link>
      </CardFooter>
    </Card>
  );
}
