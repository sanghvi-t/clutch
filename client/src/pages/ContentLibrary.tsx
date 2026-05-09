import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, Play, FileText, Share2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const SPORTS = ["pool", "snooker", "pickleball", "basketball", "baseball", "golf", "american football", "soccer"];
const CATEGORIES = ["breathing", "focus", "anxiety", "confidence", "clutch_moments", "visualization"];

// Mock content data
const mockVideos = [
  {
    id: 1,
    title: "Pre-Shot Breathing Technique for Golf",
    category: "breathing",
    sport: "golf",
    duration: "8 min",
    description: "Master the 4-7-8 breathing technique to calm nerves before critical shots.",
    url: "https://youtube.com/watch?v=example1",
  },
  {
    id: 2,
    title: "Focus Under Pressure: Basketball Free Throws",
    category: "focus",
    sport: "basketball",
    duration: "12 min",
    description: "Develop laser-sharp focus when the game is on the line.",
    url: "https://youtube.com/watch?v=example2",
  },
  {
    id: 3,
    title: "Anxiety Management for Competitive Athletes",
    category: "anxiety",
    sport: null,
    duration: "15 min",
    description: "Science-backed techniques to manage pre-competition anxiety.",
    url: "https://youtube.com/watch?v=example3",
  },
];

const mockArticles = [
  {
    id: 1,
    title: "The Clutch Gene: Why Some Athletes Thrive Under Pressure",
    category: "clutch_moments",
    sport: null,
    readTime: "8 min read",
    description: "Explore the psychological traits that separate clutch performers from the rest.",
    url: "https://example.com/article1",
  },
  {
    id: 2,
    title: "Visualization Techniques for Peak Performance",
    category: "visualization",
    sport: null,
    readTime: "6 min read",
    description: "Step-by-step guide to mental imagery for athletes.",
    url: "https://example.com/article2",
  },
  {
    id: 3,
    title: "Building Confidence in Your Sport",
    category: "confidence",
    sport: "soccer",
    readTime: "10 min read",
    description: "Practical strategies to develop unshakeable confidence.",
    url: "https://example.com/article3",
  },
];

export default function ContentLibrary() {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: bookmarked = [] } = trpc.community.getContentRecommendations.useQuery(
    { sport: selectedSport || undefined },
    { enabled: !!user }
  );

  const bookmarkMutation = trpc.community.bookmarkContent.useMutation();

  const handleBookmark = (contentId: number) => {
    bookmarkMutation.mutate({ contentId });
  };

  const filterContent = (items: any[]) => {
    return items.filter((item) => {
      const sportMatch = !selectedSport || item.sport === selectedSport || item.sport === null;
      const categoryMatch = !selectedCategory || item.category === selectedCategory;
      return sportMatch && categoryMatch;
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
              Content Library
            </h1>
            <p className="text-muted-foreground text-lg">
              Curated videos and articles to enhance your mental performance across all sports.
            </p>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-4 border-border/50">
              <label className="block text-sm font-semibold mb-3">Sport</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSport === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSport(null)}
                >
                  All
                </Button>
                {SPORTS.map((sport) => (
                  <Button
                    key={sport}
                    variant={selectedSport === sport ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSport(sport)}
                    className="capitalize"
                  >
                    {sport.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-border/50">
              <label className="block text-sm font-semibold mb-3">Category</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="capitalize"
                  >
                    {cat.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Articles
              </TabsTrigger>
            </TabsList>

            {/* Videos */}
            <TabsContent value="videos">
              <div className="grid md:grid-cols-2 gap-6">
                {filterContent(mockVideos).map((video) => (
                  <Card key={video.id} className="p-6 border-border/50 hover:shadow-lg transition-shadow flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-primary" />
                        <span className="text-xs font-semibold text-muted-foreground">{video.duration}</span>
                      </div>
                      {video.sport && <Badge variant="outline" className="capitalize">{video.sport}</Badge>}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                    <p className="text-sm text-foreground/70 mb-4 flex-1">{video.description}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 flex items-center gap-2"
                        asChild
                      >
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <Play className="w-4 h-4" />
                          Watch
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookmark(video.id)}
                        disabled={!user}
                      >
                        <BookmarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Articles */}
            <TabsContent value="articles">
              <div className="grid md:grid-cols-2 gap-6">
                {filterContent(mockArticles).map((article) => (
                  <Card key={article.id} className="p-6 border-border/50 hover:shadow-lg transition-shadow flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-xs font-semibold text-muted-foreground">{article.readTime}</span>
                      </div>
                      {article.sport && <Badge variant="outline" className="capitalize">{article.sport}</Badge>}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                    <p className="text-sm text-foreground/70 mb-4 flex-1">{article.description}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 flex items-center gap-2"
                        asChild
                      >
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                          Read
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookmark(article.id)}
                        disabled={!user}
                      >
                        <BookmarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Bookmarked Section */}
          {user && (
            <Card className="p-6 border-border/50 mt-12">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <BookmarkIcon className="w-5 h-5" />
                Your Bookmarks
              </h3>
              {bookmarked.length === 0 ? (
                <p className="text-muted-foreground">No bookmarks yet. Save your favorite content to access it later.</p>
              ) : (
                <div className="space-y-3">
                  {bookmarked.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/30">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
