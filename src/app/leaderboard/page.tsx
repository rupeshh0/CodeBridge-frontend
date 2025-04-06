'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/context/auth-context';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trophy, Clock, Zap, Filter } from 'lucide-react';

// Mock data for leaderboard
const GLOBAL_LEADERBOARD = [
  {
    id: '1',
    username: 'codeMaster',
    fullName: 'Alex Johnson',
    avatar: '',
    points: 12500,
    rank: 1,
    completedChallenges: 85,
    badges: ['Top Contributor', 'Algorithm Expert'],
  },
  {
    id: '2',
    username: 'devNinja',
    fullName: 'Sarah Chen',
    avatar: '',
    points: 11200,
    rank: 2,
    completedChallenges: 78,
    badges: ['Full Stack Pro'],
  },
  {
    id: '3',
    username: 'pythonWhisperer',
    fullName: 'Michael Rodriguez',
    avatar: '',
    points: 10800,
    rank: 3,
    completedChallenges: 72,
    badges: ['Python Master'],
  },
  {
    id: '4',
    username: 'algorithmAce',
    fullName: 'Emma Wilson',
    avatar: '',
    points: 9500,
    rank: 4,
    completedChallenges: 65,
    badges: ['Problem Solver'],
  },
  {
    id: '5',
    username: 'debugHero',
    fullName: 'James Lee',
    avatar: '',
    points: 9200,
    rank: 5,
    completedChallenges: 63,
    badges: ['Bug Hunter'],
  },
  {
    id: '6',
    username: 'frontendWizard',
    fullName: 'Olivia Martinez',
    avatar: '',
    points: 8800,
    rank: 6,
    completedChallenges: 60,
    badges: ['UI Expert'],
  },
  {
    id: '7',
    username: 'backendGuru',
    fullName: 'Noah Thompson',
    avatar: '',
    points: 8500,
    rank: 7,
    completedChallenges: 58,
    badges: ['Database Pro'],
  },
  {
    id: '8',
    username: 'fullStackDev',
    fullName: 'Sophia Garcia',
    avatar: '',
    points: 8200,
    rank: 8,
    completedChallenges: 56,
    badges: ['Full Stack Dev'],
  },
  {
    id: '9',
    username: 'codeArtisan',
    fullName: 'Ethan Brown',
    avatar: '',
    points: 7900,
    rank: 9,
    completedChallenges: 54,
    badges: ['Clean Coder'],
  },
  {
    id: '10',
    username: 'syntaxSage',
    fullName: 'Ava Davis',
    avatar: '',
    points: 7600,
    rank: 10,
    completedChallenges: 52,
    badges: ['Syntax Expert'],
  },
];

// Mock data for challenge leaderboards
const CHALLENGE_LEADERBOARDS = {
  'algorithm': [
    { id: '1', username: 'algorithmAce', points: 4500, completedChallenges: 30, rank: 1 },
    { id: '3', username: 'pythonWhisperer', points: 4200, completedChallenges: 28, rank: 2 },
    { id: '2', username: 'devNinja', points: 3800, completedChallenges: 25, rank: 3 },
    { id: '9', username: 'codeArtisan', points: 3500, completedChallenges: 23, rank: 4 },
    { id: '5', username: 'debugHero', points: 3200, completedChallenges: 21, rank: 5 },
  ],
  'web-dev': [
    { id: '6', username: 'frontendWizard', points: 5200, completedChallenges: 35, rank: 1 },
    { id: '1', username: 'codeMaster', points: 4800, completedChallenges: 32, rank: 2 },
    { id: '7', username: 'backendGuru', points: 4500, completedChallenges: 30, rank: 3 },
    { id: '8', username: 'fullStackDev', points: 4200, completedChallenges: 28, rank: 4 },
    { id: '2', username: 'devNinja', points: 3900, completedChallenges: 26, rank: 5 },
  ],
  'data-structures': [
    { id: '3', username: 'pythonWhisperer', points: 4800, completedChallenges: 32, rank: 1 },
    { id: '1', username: 'codeMaster', points: 4500, completedChallenges: 30, rank: 2 },
    { id: '4', username: 'algorithmAce', points: 4200, completedChallenges: 28, rank: 3 },
    { id: '9', username: 'codeArtisan', points: 3900, completedChallenges: 26, rank: 4 },
    { id: '10', username: 'syntaxSage', points: 3600, completedChallenges: 24, rank: 5 },
  ],
  'database': [
    { id: '7', username: 'backendGuru', points: 3900, completedChallenges: 26, rank: 1 },
    { id: '1', username: 'codeMaster', points: 3600, completedChallenges: 24, rank: 2 },
    { id: '8', username: 'fullStackDev', points: 3300, completedChallenges: 22, rank: 3 },
    { id: '2', username: 'devNinja', points: 3000, completedChallenges: 20, rank: 4 },
    { id: '5', username: 'debugHero', points: 2700, completedChallenges: 18, rank: 5 },
  ],
};

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}

function LeaderboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Get user's rank
  const userRank = GLOBAL_LEADERBOARD.find(item => item.username === user?.username)?.rank || 'N/A';
  
  // Filter leaderboard based on search query
  const filteredLeaderboard = GLOBAL_LEADERBOARD.filter(item => 
    item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get challenge leaderboard based on category
  const getChallengeLeaderboard = () => {
    if (categoryFilter === 'all') {
      return GLOBAL_LEADERBOARD.slice(0, 5);
    }
    return CHALLENGE_LEADERBOARDS[categoryFilter as keyof typeof CHALLENGE_LEADERBOARDS] || [];
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other coders</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Your Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
              <div className="text-3xl font-bold">{userRank}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Your Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-blue-500 mr-2" />
              <div className="text-3xl font-bold">
                {GLOBAL_LEADERBOARD.find(item => item.username === user?.username)?.points || 0}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold">
                {GLOBAL_LEADERBOARD.find(item => item.username === user?.username)?.completedChallenges || 0}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Your Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {GLOBAL_LEADERBOARD.find(item => item.username === user?.username)?.badges.map((badge, index) => (
                <Badge key={index} variant="secondary">{badge}</Badge>
              )) || 'No badges yet'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
          <TabsTrigger value="challenge">Challenge Leaderboards</TabsTrigger>
        </TabsList>
        
        {/* Global Leaderboard Tab */}
        <TabsContent value="global" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 font-medium text-gray-500 border-b">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">User</div>
              <div className="col-span-2 text-right">Points</div>
              <div className="col-span-2 text-right">Challenges</div>
              <div className="col-span-2 text-right">Badges</div>
            </div>
            
            {filteredLeaderboard.map((item) => (
              <div 
                key={item.id} 
                className={`grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  item.username === user?.username ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="col-span-1 flex items-center">
                  {item.rank <= 3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                      item.rank === 2 ? 'bg-gray-100 text-gray-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {item.rank}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {item.rank}
                    </div>
                  )}
                </div>
                <div className="col-span-5 flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={item.avatar} alt={item.username} />
                    <AvatarFallback>{item.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{item.username}</div>
                    <div className="text-sm text-gray-500">{item.fullName}</div>
                  </div>
                </div>
                <div className="col-span-2 text-right font-medium">{item.points.toLocaleString()}</div>
                <div className="col-span-2 text-right">{item.completedChallenges}</div>
                <div className="col-span-2 text-right">
                  <div className="flex justify-end gap-1">
                    {item.badges.slice(0, 2).map((badge, index) => (
                      <Badge key={index} variant="outline" className="truncate max-w-[100px]">
                        {badge}
                      </Badge>
                    ))}
                    {item.badges.length > 2 && (
                      <Badge variant="outline">+{item.badges.length - 2}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* Challenge Leaderboards Tab */}
        <TabsContent value="challenge" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Challenge Leaderboards</h2>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="algorithm">Algorithms</SelectItem>
                <SelectItem value="web-dev">Web Development</SelectItem>
                <SelectItem value="data-structures">Data Structures</SelectItem>
                <SelectItem value="database">Databases</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 font-medium text-gray-500 border-b">
              <div className="col-span-1">Rank</div>
              <div className="col-span-7">User</div>
              <div className="col-span-2 text-right">Points</div>
              <div className="col-span-2 text-right">Challenges</div>
            </div>
            
            {getChallengeLeaderboard().map((item) => (
              <div 
                key={item.id} 
                className={`grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  item.username === user?.username ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="col-span-1 flex items-center">
                  {item.rank <= 3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                      item.rank === 2 ? 'bg-gray-100 text-gray-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {item.rank}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {item.rank}
                    </div>
                  )}
                </div>
                <div className="col-span-7 flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src="" alt={item.username} />
                    <AvatarFallback>{item.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{item.username}</div>
                </div>
                <div className="col-span-2 text-right font-medium">{item.points.toLocaleString()}</div>
                <div className="col-span-2 text-right">{item.completedChallenges}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
