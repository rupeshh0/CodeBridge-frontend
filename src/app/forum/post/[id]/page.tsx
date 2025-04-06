'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ForumPost } from '@/components/forum/post-card';
import { 
  ChevronLeft, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Tag, 
  Share2, 
  Flag, 
  CheckCircle2, 
  BookmarkPlus 
} from 'lucide-react';

// Mock post data
const POST: ForumPost = {
  id: '1',
  title: 'How to optimize recursive algorithms for better performance?',
  content: `I'm working on a recursive solution for a binary tree traversal problem, but it's running into performance issues with large inputs. 

The specific problem I'm trying to solve is finding the maximum depth of a binary tree. Here's my current implementation:

\`\`\`javascript
function maxDepth(root) {
  if (!root) return 0;
  return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
}
\`\`\`

This works fine for small trees, but when the tree gets very large (thousands of nodes), it becomes slow. 

I've heard about techniques like memoization and converting recursion to iteration, but I'm not sure how to apply them to this specific problem.

Any tips on how to optimize recursive algorithms or alternative approaches would be greatly appreciated!`,
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
};

// Mock replies
const REPLIES = [
  {
    id: '101',
    content: `For binary tree traversal specifically, you can often convert the recursive solution to an iterative one using a stack or queue. Here's how you might rewrite your maxDepth function:

\`\`\`javascript
function maxDepth(root) {
  if (!root) return 0;
  
  const stack = [{node: root, depth: 1}];
  let maxDepth = 0;
  
  while (stack.length > 0) {
    const {node, depth} = stack.pop();
    
    maxDepth = Math.max(maxDepth, depth);
    
    if (node.right) stack.push({node: node.right, depth: depth + 1});
    if (node.left) stack.push({node: node.left, depth: depth + 1});
  }
  
  return maxDepth;
}
\`\`\`

This iterative approach avoids the overhead of function calls and can be more efficient for large trees.`,
    author: {
      id: '201',
      username: 'stackOverflower',
      avatar: '',
    },
    createdAt: '2023-07-15T11:15:00Z',
    likes: 18,
    isAcceptedAnswer: true,
  },
  {
    id: '102',
    content: `Another approach is to use a breadth-first search (BFS) with a queue instead of depth-first search (DFS) with a stack. This can be more intuitive for some problems:

\`\`\`javascript
function maxDepth(root) {
  if (!root) return 0;
  
  const queue = [root];
  let depth = 0;
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    depth++;
  }
  
  return depth;
}
\`\`\`

This BFS approach processes the tree level by level, which can be more efficient for certain types of trees.`,
    author: {
      id: '202',
      username: 'queueMaster',
      avatar: '',
    },
    createdAt: '2023-07-15T12:30:00Z',
    likes: 12,
  },
  {
    id: '103',
    content: `For this specific problem, the recursive solution is actually quite efficient with a time complexity of O(n) where n is the number of nodes. The performance issues you're experiencing might be due to other factors.

If you're hitting a stack overflow with very deep trees, you can use tail recursion optimization (if your language supports it) or switch to an iterative approach as others have suggested.

Another thing to check is if you're unnecessarily recreating the same tree nodes multiple times in your test cases, which could make the tree much larger than expected.`,
    author: {
      id: '203',
      username: 'bigOanalyst',
      avatar: '',
    },
    createdAt: '2023-07-15T14:45:00Z',
    likes: 9,
  },
];

export default function PostPage() {
  return (
    <ProtectedRoute>
      <PostContent />
    </ProtectedRoute>
  );
}

function PostContent() {
  const params = useParams();
  const postId = params.id as string;
  const [replyContent, setReplyContent] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  // Handle reply submission
  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      console.log('Submitting reply:', replyContent);
      setReplyContent('');
      // Here you would typically send the reply to your API
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/forum" className="flex items-center text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Forum
        </Link>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={POST.author.avatar} alt={POST.author.username} />
              <AvatarFallback>{POST.author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{POST.author.username}</div>
              <div className="text-sm text-muted-foreground">
                Posted {formatDistanceToNow(new Date(POST.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">{POST.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {POST.tags.map((tag) => (
              <Link href={`/forum?tag=${tag}`} key={tag}>
                <Badge variant="outline" className="hover:bg-secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
          
          <div className="prose dark:prose-invert max-w-none mb-6">
            {POST.content.split('\n\n').map((paragraph, index) => {
              // Check if paragraph is a code block
              if (paragraph.startsWith('```') && paragraph.endsWith('```')) {
                const code = paragraph.slice(3, -3);
                const [language, ...codeLines] = code.split('\n');
                return (
                  <pre key={index} className="bg-muted p-4 rounded-md overflow-x-auto">
                    <code className={`language-${language}`}>
                      {codeLines.join('\n')}
                    </code>
                  </pre>
                );
              }
              return <p key={index}>{paragraph}</p>;
            })}
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button
              variant={liked ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setLiked(!liked)}
            >
              <ThumbsUp className="h-4 w-4" />
              {liked ? POST.likes + 1 : POST.likes} Likes
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {POST.replies} Replies
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {POST.views} Views
            </Button>
            
            <Button
              variant={bookmarked ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setBookmarked(!bookmarked)}
            >
              <BookmarkPlus className="h-4 w-4" />
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Flag className="h-4 w-4" />
              Report
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">{REPLIES.length} Replies</h2>
        
        {REPLIES.map((reply, index) => (
          <Card key={reply.id} className={`mb-4 ${reply.isAcceptedAnswer ? 'border-green-500 border-l-4' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.author.avatar} alt={reply.author.username} />
                  <AvatarFallback>{reply.author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{reply.author.username}</div>
                  <div className="text-sm text-muted-foreground">
                    Replied {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                  </div>
                </div>
                {reply.isAcceptedAnswer && (
                  <Badge variant="success" className="ml-auto bg-green-100 text-green-800 hover:bg-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Accepted Solution
                  </Badge>
                )}
              </div>
              
              <div className="prose dark:prose-invert max-w-none mb-4">
                {reply.content.split('\n\n').map((paragraph, pIndex) => {
                  // Check if paragraph is a code block
                  if (paragraph.startsWith('```') && paragraph.endsWith('```')) {
                    const code = paragraph.slice(3, -3);
                    const [language, ...codeLines] = code.split('\n');
                    return (
                      <pre key={pIndex} className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code className={`language-${language}`}>
                          {codeLines.join('\n')}
                        </code>
                      </pre>
                    );
                  }
                  return <p key={pIndex}>{paragraph}</p>;
                })}
              </div>
              
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {reply.likes} Likes
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Reply
                </Button>
              </div>
            </CardContent>
            
            {index < REPLIES.length - 1 && <Separator />}
          </Card>
        ))}
      </div>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Add Your Reply</h3>
          <Textarea
            placeholder="Share your thoughts or solution..."
            className="min-h-[150px] mb-4"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={handleReplySubmit} disabled={!replyContent.trim()}>
              Post Reply
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
