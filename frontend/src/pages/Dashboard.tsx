import { motion } from "framer-motion";
import { KanbanSquare, Trophy, Smile, Star, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, getActiveUsers, mockTasks, weeklyMoodData, monthlyProductivity } from "@/data/mock";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Dashboard() {
  const currentUser = getCurrentUser();
  console.log("[Dashboard] currentUser:", currentUser);

  const activeUsers = getActiveUsers();
  const isExampleUser = currentUser.email === "ana@azis.com";
  const userPoints = Number(currentUser.points ?? 0);
  const userName = currentUser.name?.split(" ")[0] ?? "Usuário";

  const stats = [
    { label: "Tarefas Concluídas", value: isExampleUser ? "23" : "0", icon: CheckCircle2, color: "text-primary" },
    { label: "Pontos Totais", value: (isExampleUser ? userPoints : 0).toLocaleString(), icon: Star, color: "text-warning" },
    {
      label: "Ranking",
      value: isExampleUser
        ? `#${Math.max(1, activeUsers.findIndex((u) => u.id === currentUser.id) + 1)}`
        : "#—",
      icon: Trophy,
      color: "text-accent",
    },
    { label: "Humor Hoje", value: isExampleUser ? "😊" : "—", icon: Smile, color: "text-mood-good" },
  ];

  const myTasks = isExampleUser
    ? mockTasks.filter((t) => t.assignee.id === currentUser.id || currentUser.role === "manager")
    : [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Olá, {userName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Aqui está o resumo do seu dia</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-heading font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <KanbanSquare className="w-5 h-5 text-primary" />
              Produtividade Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyProductivity}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip />
                <Bar dataKey="tasks" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Smile className="w-5 h-5 text-accent" />
              Humor da Equipe (Semana)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyMoodData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="happy" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="neutral" stroke="hsl(244, 75%, 59%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="sad" stroke="hsl(43, 100%, 65%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Ranking Preview */}
      {currentUser.role === "manager" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Ranking da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...activeUsers]
                .sort((a, b) => b.points - a.points)
                .slice(0, 5)
                .map((member, i) => (
                  <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm ${
                      i === 0 ? "bg-warning text-warning-foreground" : i === 1 ? "bg-muted text-muted-foreground" : i === 2 ? "bg-warning/60 text-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role === "manager" ? "Gestor" : "Membro"}</div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Star className="w-4 h-4 text-warning" />
                      {member.points}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
