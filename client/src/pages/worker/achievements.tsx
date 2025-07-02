import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { 
  Trophy, 
  Star, 
  Target, 
  Clock, 
  Award, 
  Medal, 
  Zap, 
  TrendingUp,
  Gift,
  Crown,
  CheckCircle,
  Lock
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'performance' | 'quality' | 'milestone' | 'special';
  points: number;
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  badge: string;
}

interface LeaderboardEntry {
  rank: number;
  workerId: string;
  workerName: string;
  totalPoints: number;
  totalJobs: number;
  averageRating: number;
  badges: string[];
  avatar?: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'cash_bonus' | 'day_off' | 'equipment' | 'training' | 'recognition';
  availability: number;
  claimed: boolean;
}

export default function WorkerAchievements() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Worker achievements
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/worker/achievements'],
  });

  // Worker points and stats
  const { data: workerStats } = useQuery({
    queryKey: ['/api/worker/stats'],
  });

  // Leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['/api/worker/leaderboard', selectedPeriod],
  });

  // Available rewards
  const { data: rewards = [] } = useQuery({
    queryKey: ['/api/worker/rewards'],
  });

  const getAchievementIcon = (iconName: string) => {
    const icons = {
      trophy: Trophy,
      star: Star,
      target: Target,
      clock: Clock,
      award: Award,
      medal: Medal,
      zap: Zap,
      trending: TrendingUp,
      crown: Crown
    };
    return icons[iconName as keyof typeof icons] || Trophy;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      performance: 'bg-blue-100 text-blue-800',
      quality: 'bg-green-100 text-green-800',
      milestone: 'bg-purple-100 text-purple-800',
      special: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRewardTypeIcon = (type: string) => {
    const icons = {
      cash_bonus: Gift,
      day_off: Clock,
      equipment: Target,
      training: Star,
      recognition: Crown
    };
    return icons[type as keyof typeof icons] || Gift;
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const IconComponent = getAchievementIcon(achievement.icon);
    const progressPercentage = (achievement.progress / achievement.requirement) * 100;

    return (
      <Card className={`relative ${achievement.isUnlocked ? 'border-yellow-300 bg-yellow-50' : ''}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${achievement.isUnlocked ? 'bg-yellow-200' : 'bg-gray-100'}`}>
              {achievement.isUnlocked ? (
                <IconComponent className="h-6 w-6 text-yellow-700" />
              ) : (
                <Lock className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-medium ${achievement.isUnlocked ? 'text-yellow-800' : 'text-gray-700'}`}>
                  {achievement.title}
                </h3>
                <Badge className={getCategoryColor(achievement.category)}>
                  {achievement.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
              
              {achievement.isUnlocked ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    Unlocked {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                  <Badge variant="secondary">+{achievement.points} pts</Badge>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.requirement}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="text-sm text-gray-500">
                    Reward: {achievement.points} points
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Achievements & Rewards</h1>
          <p className="text-gray-600">Track your progress and earn rewards</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold">{workerStats?.totalPoints || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Medal className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold">
                  {achievements.filter((a: Achievement) => a.isUnlocked).length}/{achievements.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Leaderboard Rank</p>
                <p className="text-2xl font-bold">#{workerStats?.leaderboardRank || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{workerStats?.averageRating || 0}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards Store</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Badge variant={selectedPeriod === 'performance' ? 'default' : 'outline'}>
                Performance
              </Badge>
              <Badge variant={selectedPeriod === 'quality' ? 'default' : 'outline'}>
                Quality
              </Badge>
              <Badge variant={selectedPeriod === 'milestone' ? 'default' : 'outline'}>
                Milestones
              </Badge>
              <Badge variant={selectedPeriod === 'special' ? 'default' : 'outline'}>
                Special
              </Badge>
            </div>

            {achievementsLoading ? (
              <div className="text-center py-8">Loading achievements...</div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {achievements.map((achievement: Achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Worker Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="text-center py-8">Loading leaderboard...</div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                    <div
                      key={entry.workerId}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        entry.workerId === user?.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                        {entry.rank <= 3 ? (
                          <Crown className={`h-5 w-5 ${
                            entry.rank === 1 ? 'text-yellow-500' :
                            entry.rank === 2 ? 'text-gray-400' :
                            'text-orange-600'
                          }`} />
                        ) : (
                          <span className="font-bold text-gray-600">#{entry.rank}</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{entry.workerName}</h3>
                          {entry.workerId === user?.id && (
                            <Badge variant="secondary">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{entry.totalJobs} jobs</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {entry.averageRating}/5
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.totalPoints}</p>
                        <p className="text-sm text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Your current balance: <span className="font-bold">{workerStats?.totalPoints || 0} points</span>
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {rewards.map((reward: Reward) => {
                const IconComponent = getRewardTypeIcon(reward.type);
                const canAfford = (workerStats?.totalPoints || 0) >= reward.pointsCost;
                
                return (
                  <Card key={reward.id} className={`${reward.claimed ? 'opacity-50' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-purple-100">
                          <IconComponent className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{reward.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{reward.pointsCost} points</Badge>
                              {reward.availability > 0 && (
                                <span className="text-sm text-gray-500">
                                  {reward.availability} available
                                </span>
                              )}
                            </div>
                            
                            {reward.claimed ? (
                              <Badge variant="secondary">Claimed</Badge>
                            ) : (
                              <button
                                className={`px-4 py-2 rounded text-sm font-medium ${
                                  canAfford
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!canAfford}
                              >
                                {canAfford ? 'Claim' : 'Insufficient Points'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}