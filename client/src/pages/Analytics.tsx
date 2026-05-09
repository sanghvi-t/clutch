import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Download, Calendar } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const SPORTS = ["pool", "snooker", "pickleball", "basketball", "baseball", "golf", "american football", "soccer"];

// Mock data for charts
const mockProgressData = [
  { week: "Week 1", focus: 65, composure: 60, confidence: 70, clutch: 55 },
  { week: "Week 2", focus: 70, composure: 65, confidence: 75, clutch: 60 },
  { week: "Week 3", focus: 75, composure: 72, confidence: 80, clutch: 68 },
  { week: "Week 4", focus: 82, composure: 78, confidence: 85, clutch: 75 },
];

const mockCompletionData = [
  { sport: "Basketball", sessions: 12, completed: 10 },
  { sport: "Golf", sessions: 8, completed: 7 },
  { sport: "Soccer", sessions: 15, completed: 13 },
  { sport: "Baseball", sessions: 10, completed: 9 },
];

export default function Analytics() {
  const [selectedSport, setSelectedSport] = useState<string>("basketball");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  // Metrics will be fetched from profile router
  // const { data: metrics = [] } = trpc.profile.getMetrics.useQuery({ sport: selectedSport });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="pt-20 pb-16">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Performance Analytics
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your mental performance improvements over time across all sports.
            </p>
          </div>

          {/* Sport & Time Range Filters */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-4 border-border/50">
              <label className="block text-sm font-semibold mb-3">Sport</label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full p-2 rounded-lg bg-background border border-border/50 text-foreground"
              >
                {SPORTS.map((sport) => (
                  <option key={sport} value={sport} className="capitalize">
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </option>
                ))}
              </select>
            </Card>

            <Card className="p-4 border-border/50">
              <label className="block text-sm font-semibold mb-3">Time Range</label>
              <div className="flex gap-2">
                {(["week", "month", "all"] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="capitalize"
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Avg Focus", value: "82%", trend: "+12%" },
              { label: "Avg Composure", value: "78%", trend: "+8%" },
              { label: "Avg Confidence", value: "85%", trend: "+15%" },
              { label: "Clutch Rating", value: "75%", trend: "+20%" },
            ].map((metric) => (
              <Card key={metric.label} className="p-4 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <Badge className="bg-green-500/20 text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {metric.trend}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <Tabs defaultValue="progress" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="progress">Mental Performance Trends</TabsTrigger>
              <TabsTrigger value="completion">Session Completion</TabsTrigger>
            </TabsList>

            {/* Progress Chart */}
            <TabsContent value="progress">
              <Card className="p-6 border-border/50">
                <h3 className="text-lg font-semibold mb-6">Weekly Mental Performance Metrics</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="focus" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="composure" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="clutch" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            {/* Completion Chart */}
            <TabsContent value="completion">
              <Card className="p-6 border-border/50">
                <h3 className="text-lg font-semibold mb-6">Training Session Completion by Sport</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="sport" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sessions" fill="#f59e0b" />
                    <Bar dataKey="completed" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Historical Sessions */}
          <Card className="p-6 border-border/50 mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Sessions</h3>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { date: "Apr 8, 2026", sport: "Basketball", mood: "Focused", xp: 50, notes: "Great focus during clutch moments" },
                { date: "Apr 7, 2026", sport: "Golf", mood: "Calm", xp: 45, notes: "Improved composure on pressure shots" },
                { date: "Apr 6, 2026", sport: "Soccer", mood: "Confident", xp: 55, notes: "Best session yet, peak performance" },
                { date: "Apr 5, 2026", sport: "Baseball", mood: "Anxious", xp: 30, notes: "Working on anxiety management" },
              ].map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/30">
                  <div>
                    <p className="font-semibold">{session.sport}</p>
                    <p className="text-xs text-muted-foreground">{session.date}</p>
                    <p className="text-sm text-foreground/70 mt-1">{session.notes}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      {session.mood}
                    </Badge>
                    <p className="text-sm font-semibold">+{session.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
