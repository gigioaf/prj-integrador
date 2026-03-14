import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getActiveUsers, mockTasks, Task, TaskStatus } from "@/data/mock";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import TaskFormModal from "@/components/TaskFormModal";

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "A Fazer", color: "bg-info" },
  { id: "in_progress", title: "Em Progresso", color: "bg-warning" },
  { id: "done", title: "Concluído", color: "bg-primary" },
];

function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border border-border bg-card">
        <h4 className="font-medium text-sm text-foreground mb-2">{task.title}</h4>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs font-medium text-foreground">{task.points}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date(task.deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs py-0">
            <User className="w-3 h-3 mr-1" />
            {task.assignee.name.split(" ")[0]}
          </Badge>
        </div>
      </Card>
    </div>
  );
}

function DroppableColumn({ column, tasks }: { column: typeof columns[0]; tasks: Task[] }) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${column.color}`} />
        <h3 className="font-heading font-semibold text-foreground">{column.title}</h3>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div ref={setNodeRef} className="space-y-3 min-h-[200px] p-2 rounded-xl bg-secondary/30">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div key={task.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <TaskCard task={task} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>
    </div>
  );
}

export default function Kanban() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const activeUsers = getActiveUsers();

  const handleCreateTask = (data: { title: string; description: string; assignedTo: string }) => {
    const assignee = activeUsers.find((u) => u.id === data.assignedTo) || activeUsers[0];
    const newTask: Task = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      assignee,
      status: "todo",
      points: 10,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const overId = over.id as string;
    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Check if dropped on a column
    const targetColumn = columns.find((c) => c.id === overId);
    if (targetColumn) {
      setTasks((prev) =>
        prev.map((t) => (t.id === active.id ? { ...t, status: targetColumn.id } : t))
      );
      return;
    }

    // Dropped on another task — move to that task's column
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask && activeTask.status !== targetTask.status) {
      setTasks((prev) =>
        prev.map((t) => (t.id === active.id ? { ...t, status: targetTask.status } : t))
      );
    }
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Quadro Kanban</h1>
          <p className="text-muted-foreground mt-1">Arraste tarefas entre as colunas</p>
        </div>
        <TaskFormModal
          trigger={
            <Button className="bg-gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          }
          onSubmit={handleCreateTask}
        />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((col) => (
            <DroppableColumn key={col.id} column={col} tasks={tasks.filter((t) => t.status === col.id)} />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <Card className="p-4 shadow-lg border border-primary/30 bg-card rotate-2">
              <h4 className="font-medium text-sm text-foreground">{activeTask.title}</h4>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
