'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Code, 
  Database, 
  Server, 
  Globe, 
  Layers, 
  Lock, 
  CheckCircle, 
  Clock, 
  BarChart, 
  Award
} from 'lucide-react';

// Define curriculum tracks
const TRACKS = [
  {
    id: 'fundamentals',
    name: 'Programming Fundamentals',
    description: 'Master the core concepts of programming and computer science',
    icon: <Code className="h-5 w-5" />,
    color: 'bg-blue-500',
    modules: [
      {
        id: 'intro-programming',
        name: 'Introduction to Programming',
        description: 'Learn the basics of programming concepts and syntax',
        level: 'Beginner',
        estimatedHours: 4,
        completionRate: 0,
        challenges: 5,
        isLocked: false,
        isCompleted: false,
      },
      {
        id: 'variables-data-types',
        name: 'Variables and Data Types',
        description: 'Understand how to store and manipulate different types of data',
        level: 'Beginner',
        estimatedHours: 3,
        completionRate: 0,
        challenges: 4,
        isLocked: false,
        isCompleted: false,
      },
      {
        id: 'control-flow',
        name: 'Control Flow',
        description: 'Master conditional statements and loops',
        level: 'Beginner',
        estimatedHours: 5,
        completionRate: 0,
        challenges: 6,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'functions',
        name: 'Functions and Methods',
        description: 'Learn to organize code into reusable blocks',
        level: 'Intermediate',
        estimatedHours: 6,
        completionRate: 0,
        challenges: 7,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'data-structures',
        name: 'Basic Data Structures',
        description: 'Explore arrays, lists, and dictionaries',
        level: 'Intermediate',
        estimatedHours: 8,
        completionRate: 0,
        challenges: 8,
        isLocked: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'algorithms',
    name: 'Algorithms and Problem Solving',
    description: 'Develop your algorithmic thinking and problem-solving skills',
    icon: <Layers className="h-5 w-5" />,
    color: 'bg-green-500',
    modules: [
      {
        id: 'intro-algorithms',
        name: 'Introduction to Algorithms',
        description: 'Understand what algorithms are and why they matter',
        level: 'Beginner',
        estimatedHours: 3,
        completionRate: 0,
        challenges: 4,
        isLocked: false,
        isCompleted: false,
      },
      {
        id: 'searching',
        name: 'Searching Algorithms',
        description: 'Learn linear and binary search techniques',
        level: 'Beginner',
        estimatedHours: 4,
        completionRate: 0,
        challenges: 5,
        isLocked: false,
        isCompleted: false,
      },
      {
        id: 'sorting',
        name: 'Sorting Algorithms',
        description: 'Master various sorting techniques and their efficiency',
        level: 'Intermediate',
        estimatedHours: 6,
        completionRate: 0,
        challenges: 7,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'recursion',
        name: 'Recursion',
        description: 'Understand and apply recursive problem-solving',
        level: 'Intermediate',
        estimatedHours: 7,
        completionRate: 0,
        challenges: 6,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'dynamic-programming',
        name: 'Dynamic Programming',
        description: 'Solve complex problems by breaking them down into simpler subproblems',
        level: 'Advanced',
        estimatedHours: 10,
        completionRate: 0,
        challenges: 8,
        isLocked: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'web-development',
    name: 'Web Development',
    description: 'Build modern web applications with industry-standard technologies',
    icon: <Globe className="h-5 w-5" />,
    color: 'bg-purple-500',
    modules: [
      {
        id: 'html-css',
        name: 'HTML and CSS Fundamentals',
        description: 'Learn the building blocks of web pages',
        level: 'Beginner',
        estimatedHours: 5,
        completionRate: 0,
        challenges: 6,
        isLocked: false,
        isCompleted: false,
      },
      {
        id: 'javascript-basics',
        name: 'JavaScript Basics',
        description: 'Add interactivity to your web pages',
        level: 'Beginner',
        estimatedHours: 6,
        completionRate: 0,
        challenges: 7,
        isLocked: false,
        isCompleted: false,
      },
      {
        id: 'dom-manipulation',
        name: 'DOM Manipulation',
        description: 'Dynamically update web page content',
        level: 'Intermediate',
        estimatedHours: 5,
        completionRate: 0,
        challenges: 6,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'responsive-design',
        name: 'Responsive Design',
        description: 'Create websites that work on any device',
        level: 'Intermediate',
        estimatedHours: 4,
        completionRate: 0,
        challenges: 5,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'frontend-frameworks',
        name: 'Frontend Frameworks',
        description: 'Build complex UIs with React, Vue, or Angular',
        level: 'Advanced',
        estimatedHours: 12,
        completionRate: 0,
        challenges: 10,
        isLocked: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'databases',
    name: 'Databases',
    description: 'Store, retrieve, and manage data efficiently',
    icon: <Database className="h-5 w-5" />,
    color: 'bg-yellow-500',
    modules: [
      {
        id: 'intro-databases',
        name: 'Introduction to Databases',
        description: 'Understand database concepts and types',
        level: 'Beginner',
        estimatedHours: 3,
        completionRate: 0,
        challenges: 4,
        isLocked: false,
        isCompleted: false,
      },
      {
        id: 'sql-basics',
        name: 'SQL Basics',
        description: 'Learn to query and manipulate relational databases',
        level: 'Beginner',
        estimatedHours: 5,
        completionRate: 0,
        challenges: 6,
        isLocked: false,
        isCompleted: false,
      },
      {
        id: 'database-design',
        name: 'Database Design',
        description: 'Create efficient and normalized database schemas',
        level: 'Intermediate',
        estimatedHours: 7,
        completionRate: 0,
        challenges: 7,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'nosql',
        name: 'NoSQL Databases',
        description: 'Explore document, key-value, and graph databases',
        level: 'Intermediate',
        estimatedHours: 6,
        completionRate: 0,
        challenges: 6,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'database-optimization',
        name: 'Database Optimization',
        description: 'Improve performance with indexing and query optimization',
        level: 'Advanced',
        estimatedHours: 8,
        completionRate: 0,
        challenges: 7,
        isLocked: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'backend',
    name: 'Backend Development',
    description: 'Build robust server-side applications and APIs',
    icon: <Server className="h-5 w-5" />,
    color: 'bg-red-500',
    modules: [
      {
        id: 'intro-backend',
        name: 'Introduction to Backend Development',
        description: 'Understand server-side programming concepts',
        level: 'Beginner',
        estimatedHours: 4,
        completionRate: 0,
        challenges: 5,
        isLocked: false,
        isCompleted: false,
      },
      {
        id: 'rest-apis',
        name: 'RESTful APIs',
        description: 'Design and implement REST APIs',
        level: 'Intermediate',
        estimatedHours: 6,
        completionRate: 0,
        challenges: 7,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'authentication',
        name: 'Authentication and Authorization',
        description: 'Implement secure user authentication systems',
        level: 'Intermediate',
        estimatedHours: 7,
        completionRate: 0,
        challenges: 6,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'middleware',
        name: 'Middleware and Request Processing',
        description: 'Handle requests, validation, and error management',
        level: 'Intermediate',
        estimatedHours: 5,
        completionRate: 0,
        challenges: 6,
        isLocked: true,
        isCompleted: false,
      },
      {
        id: 'scaling',
        name: 'Scaling and Performance',
        description: 'Optimize backend applications for high traffic',
        level: 'Advanced',
        estimatedHours: 9,
        completionRate: 0,
        challenges: 8,
        isLocked: true,
        isCompleted: false,
      },
    ],
  },
];

export default function CurriculumPage() {
  return (
    <ProtectedRoute>
      <CurriculumContent />
    </ProtectedRoute>
  );
}

function CurriculumContent() {
  const [activeTrack, setActiveTrack] = useState(TRACKS[0].id);
  
  // Get the active track
  const currentTrack = TRACKS.find(track => track.id === activeTrack) || TRACKS[0];
  
  // Calculate overall progress for the track
  const calculateTrackProgress = (track: typeof TRACKS[0]) => {
    const totalModules = track.modules.length;
    const completedModules = track.modules.filter(module => module.isCompleted).length;
    return totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Curriculum</h1>
        <p className="text-gray-600">Follow a structured path to master programming skills</p>
      </div>
      
      <Tabs value={activeTrack} onValueChange={setActiveTrack} className="space-y-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {TRACKS.map(track => (
            <TabsTrigger key={track.id} value={track.id} className="flex items-center gap-2">
              <div className={`p-1 rounded-md ${track.color} text-white`}>
                {track.icon}
              </div>
              <span className="hidden md:inline">{track.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {TRACKS.map(track => (
          <TabsContent key={track.id} value={track.id} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <div className={`p-1 rounded-md ${track.color} text-white`}>
                    {track.icon}
                  </div>
                  {track.name}
                </h2>
                <p className="text-gray-600 mb-4">{track.description}</p>
              </div>
              
              <div className="bg-card rounded-lg border p-4 w-full md:w-64 flex flex-col">
                <h3 className="font-medium mb-2">Track Progress</h3>
                <Progress value={calculateTrackProgress(track)} className="mb-2" />
                <div className="text-sm text-muted-foreground mb-4">
                  {track.modules.filter(m => m.isCompleted).length} of {track.modules.length} modules completed
                </div>
                <div className="mt-auto">
                  <Button className="w-full">Continue Learning</Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {track.modules.map((module, index) => (
                <Card key={module.id} className={`${module.isLocked ? 'opacity-70' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant={
                        module.level === 'Beginner' ? 'default' : 
                        module.level === 'Intermediate' ? 'secondary' : 
                        'destructive'
                      }>
                        {module.level}
                      </Badge>
                      {module.isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : module.isLocked ? (
                        <Lock className="h-5 w-5 text-gray-400" />
                      ) : null}
                    </div>
                    <CardTitle className="text-lg mt-2">{module.name}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {module.challenges} Challenges
                        </span>
                        <span className="text-muted-foreground flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {module.estimatedHours} hours
                        </span>
                      </div>
                      
                      {!module.isLocked && (
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{module.completionRate}%</span>
                          </div>
                          <Progress value={module.completionRate} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {module.isLocked ? (
                      <Button variant="outline" className="w-full" disabled>
                        <Lock className="h-4 w-4 mr-2" />
                        Locked
                      </Button>
                    ) : module.isCompleted ? (
                      <Button variant="outline" className="w-full">
                        <Award className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    ) : (
                      <Button className="w-full">
                        {module.completionRate > 0 ? 'Continue' : 'Start'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
