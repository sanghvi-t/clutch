import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Trophy, Share2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const SPORTS = ["pool", "snooker", "pickleball", "basketball", "baseball", "golf", "american football", "soccer"];

export default function Community() {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");

  // Fetch community feed
  const { data: feed = [] } = trpc.community.getFeed.useQuery({ limit: 20 });
  const { data: teams = [] } = trpc.community.getTeams.useQuery({ sport: selectedSport || undefined });
  const { data: challenges = [] } = trpc.community.getChallenges.useQuery({ sport: selectedSport || undefined });

  const createPostMutation = trpc.community.createPost.useMutation({
    onSuccess: () => {
      setNewPostContent("");
      setShowNewPost(false);
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim() || !user) return;
    createPostMutation.mutate({
      content: newPostContent,
      postType: "motivation",
      sport: selectedSport || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="pt-20 pb-16">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Community
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect with athletes, join challenges, and share your mental performance journey.
            </p>
          </div>

          {/* Sport Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSport === null ? "default" : "outline"}
                onClick={() => setSelectedSport(null)}
                size="sm"
              >
                All Sports
              </Button>
              {SPORTS.map((sport) => (
                <Button
                  key={sport}
                  variant={selectedSport === sport ? "default" : "outline"}
                  onClick={() => setSelectedSport(sport)}
                  size="sm"
                  className="capitalize"
                >
                  {sport}
                </Button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
            </TabsList>

            {/* Feed Tab */}
            <TabsContent value="feed" className="space-y-4">
              {/* New Post */}
              {user && (
                <Card className="p-6 border-border/50">
                  {!showNewPost ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => setShowNewPost(true)}
                    >
                      Share your mental performance moment...
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="What's on your mind? Share a win, a challenge, or a tip..."
                        className="w-full h-24 p-3 rounded-lg bg-background border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreatePost}
                          disabled={!newPostContent.trim() || createPostMutation.isPending}
                        >
                          {createPostMutation.isPending ? "Posting..." : "Post"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowNewPost(false);
                            setNewPostContent("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Posts */}
              <div className="space-y-4">
                {feed.length === 0 ? (
                  <Card className="p-8 text-center border-border/50">
                    <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
                  </Card>
                ) : (
                  feed.map((post: any) => (
                    <Card key={post.id} className="p-6 border-border/50 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{post.userName || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {post.sport && <Badge variant="outline" className="capitalize">{post.sport}</Badge>}
                      </div>
                      <p className="text-foreground/80 mb-4">{post.content}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          Reply
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {teams.length === 0 ? (
                  <Card className="col-span-2 p-8 text-center border-border/50">
                    <p className="text-muted-foreground mb-4">No teams found for this sport.</p>
                    <Button>Create a Team</Button>
                  </Card>
                ) : (
                  teams.map((team: any) => (
                    <Card key={team.id} className="p-6 border-border/50 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{team.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{team.sport}</p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {team.memberCount}
                        </Badge>
                      </div>
                      {team.description && (
                        <p className="text-sm text-foreground/70 mb-4">{team.description}</p>
                      )}
                      <Button variant="outline" className="w-full">
                        Join Team
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {challenges.length === 0 ? (
                  <Card className="col-span-2 p-8 text-center border-border/50">
                    <p className="text-muted-foreground">No active challenges right now.</p>
                  </Card>
                ) : (
                  challenges.map((challenge: any) => (
                    <Card key={challenge.id} className="p-6 border-border/50 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground">{challenge.goal}</p>
                        </div>
                        <Badge className="bg-primary/20 text-primary flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          +{challenge.xpReward} XP
                        </Badge>
                      </div>
                      {challenge.description && (
                        <p className="text-sm text-foreground/70 mb-4">{challenge.description}</p>
                      )}
                      <div className="flex gap-2">
                        <Button className="flex-1">Join Challenge</Button>
                        <Button variant="outline">View Leaderboard</Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
