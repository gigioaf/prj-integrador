// =====================
// TYPES
// =====================

export type TaskStatus = "todo" | "in_progress" | "done";
export type MoodType = "very_happy" | "happy" | "neutral" | "sad" | "stressed";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "manager" | "member";
  points: number;
  institution_id: string;
  position?: string;
  managerId?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: User;
  status: TaskStatus;
  points: number;
  deadline: string;
  created_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  cost: number;
  available: number;
}

// =====================
// USERS
// =====================

export const users: User[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana@azis.com",
    avatar: "",
    role: "manager",
    points: 1250,
    institution_id: "1",
    position: "CEO",
    managerId: null,
  },
  {
    id: "2",
    name: "Carlos Santos",
    email: "carlos@azis.com",
    avatar: "",
    role: "member",
    points: 980,
    institution_id: "1",
    position: "Frontend Developer",
    managerId: "1",
  },
  {
    id: "3",
    name: "Maria Oliveira",
    email: "maria@azis.com",
    avatar: "",
    role: "member",
    points: 1100,
    institution_id: "1",
    position: "Backend Developer",
    managerId: "1",
  },
  {
    id: "4",
    name: "Pedro Costa",
    email: "pedro@azis.com",
    avatar: "",
    role: "member",
    points: 750,
    institution_id: "1",
    position: "QA Engineer",
    managerId: "3",
  },
  {
    id: "5",
    name: "Julia Lima",
    email: "julia@azis.com",
    avatar: "",
    role: "member",
    points: 890,
    institution_id: "1",
    position: "UX Designer",
    managerId: "2",
  },
  {
    id: "6",
    name: "Rafael Souza",
    email: "rafael@azis.com",
    avatar: "",
    role: "member",
    points: 1350,
    institution_id: "1",
    position: "DevOps Engineer",
    managerId: "1",
  },
];

// compatibilidade com páginas antigas
export const teamMembers = users;

// =====================
// PERSISTED DATA SUPPORT
// =====================

const USERS_STORAGE_KEY = "azis_users";

export function getActiveUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as User[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("getActiveUsers parse error:", error);
  }
  return users;
}

export function saveActiveUsers(activeUsers: User[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(activeUsers));
  } catch (error) {
    console.error("saveActiveUsers error:", error);
  }
}

export function resetActiveUsers() {
  localStorage.removeItem(USERS_STORAGE_KEY);
}

// =====================
// USER FUNCTIONS
// =====================

export function getUserById(id: string): User | undefined {
  const currentUsers = getActiveUsers();
  return currentUsers.find((u) => u.id === id);
}

export function getManagerName(managerId?: string | null): string {
  if (!managerId) return "Sem gestor";

  const currentUsers = getActiveUsers();
  const manager = currentUsers.find((u) => u.id === managerId);
  return manager ? manager.name : "Gestor não encontrado";
}

export function getCurrentUser(): User {
  try {
    const stored = localStorage.getItem("azis_user");
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<User>;
      return {
        ...users[0],
        ...parsed,
        id: parsed.id ?? users[0].id,
        name: parsed.name ?? users[0].name,
        email: parsed.email ?? users[0].email,
        avatar: parsed.avatar ?? users[0].avatar,
        role: parsed.role ?? users[0].role,
        institution_id: parsed.institution_id ?? users[0].institution_id,
        position: parsed.position ?? users[0].position,
        managerId: parsed.managerId ?? users[0].managerId,
        points: typeof parsed.points === "number" ? parsed.points : users[0].points,
      };
    }
  } catch (error) {
    console.error("getCurrentUser parse error:", error);
  }

  return users[0];
}

// =====================
// TASKS
// =====================

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Redesign da landing page",
    description: "Atualizar o design da página inicial",
    assignee: users[1],
    status: "todo",
    points: 50,
    deadline: "2026-03-15",
    created_at: "2026-03-01",
  },
  {
    id: "t2",
    title: "Implementar API de pagamentos",
    description: "Integrar gateway de pagamento",
    assignee: users[2],
    status: "in_progress",
    points: 80,
    deadline: "2026-03-20",
    created_at: "2026-03-02",
  },
  {
    id: "t3",
    title: "Testes de integração",
    description: "Criar testes automatizados",
    assignee: users[3],
    status: "done",
    points: 40,
    deadline: "2026-03-12",
    created_at: "2026-03-01",
  },
];

// =====================
// REWARDS
// =====================

export const mockRewards: Reward[] = [
  {
    id: "r1",
    name: "Day Off",
    description: "Um dia de folga extra",
    image: "🏖️",
    cost: 500,
    available: 3,
  },
  {
    id: "r2",
    name: "Vale Almoço",
    description: "Vale refeição",
    image: "🍽️",
    cost: 200,
    available: 10,
  },
  {
    id: "r3",
    name: "Curso Online",
    description: "Acesso a um curso na plataforma parceira",
    image: "📚",
    cost: 800,
    available: 5,
  },
];

// =====================
// MOOD
// =====================

export const moodLabels: Record<MoodType, { emoji: string; label: string }> = {
  very_happy: { emoji: "😄", label: "Muito Feliz" },
  happy: { emoji: "😊", label: "Feliz" },
  neutral: { emoji: "😐", label: "Neutro" },
  sad: { emoji: "😢", label: "Triste" },
  stressed: { emoji: "😤", label: "Estressado" },
};

export const weeklyMoodData = [
  { day: "Seg", happy: 4, neutral: 2, sad: 0 },
  { day: "Ter", happy: 3, neutral: 2, sad: 1 },
  { day: "Qua", happy: 5, neutral: 1, sad: 0 },
  { day: "Qui", happy: 3, neutral: 3, sad: 0 },
  { day: "Sex", happy: 4, neutral: 1, sad: 1 },
];

// =====================
// PRODUCTIVITY
// =====================

export const monthlyProductivity = [
  { month: "Jan", tasks: 42, points: 1250 },
  { month: "Fev", tasks: 38, points: 1100 },
  { month: "Mar", tasks: 55, points: 1680 },
];