import { useState } from "react";
import { getActiveUsers, getUserById, getManagerName, type User } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TreeNodeProps {
  user: User;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  allUsers: User[];
}

function TreeNode({ user, level, selectedId, onSelect, allUsers }: TreeNodeProps) {
  const children = allUsers.filter((u) => u.managerId === user.id);
  const isSelected = selectedId === user.id;

  return (
    <div className={cn("ml-0", level > 0 && "ml-6")}>
      <button
        onClick={() => onSelect(user.id)}
        className={cn(
          "flex flex-col items-start px-4 py-3 rounded-md border text-left w-full max-w-xs mb-1 transition-colors",
          isSelected
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/30"
        )}
      >
        <span className="text-sm font-medium text-foreground">{user.name}</span>
        <span className="text-xs text-muted-foreground">{user.position}</span>
      </button>

      {children.length > 0 && (
        <div className="border-l border-border ml-4 space-y-1 mt-1 mb-2">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              user={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              allUsers={allUsers}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgStructure() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newManagerId, setNewManagerId] = useState<string>("");

  const users = getActiveUsers();
  const rootUsers = users.filter((u) => u.managerId === null);
  const selectedUser = selectedId ? getUserById(selectedId) : null;

 const validManagers = users.filter(
  (u) => u.id !== selectedId && u.role === "manager"
);

  const handleSave = () => {
    setSelectedId(null);
    setNewManagerId("");
  };

  return (
    <div className="p-6 lg:p-8">
      {/* HEADER PADRONIZADO */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Estrutura Organizacional
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize a hierarquia da equipe e gerencie relações de liderança
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* ÁRVORE ORGANIZACIONAL */}
        <div className="flex-1">
          <Card className="p-6">
            <div className="space-y-1">
              {rootUsers.map((user) => (
                <TreeNode
                  key={user.id}
                  user={user}
                  level={0}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  allUsers={users}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* SIDEBAR DE DETALHES */}
        {selectedUser && (
          <aside className="w-80 shrink-0">
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Employee Details
              </h2>

              <div className="space-y-3 text-sm mb-6">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">
                    {selectedUser.name}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Position</p>
                  <p className="text-foreground">{selectedUser.position}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="text-foreground">{selectedUser.role}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Current Manager</p>
                  <p className="text-foreground">
                    {getManagerName(selectedUser.managerId)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Assign Manager
                </label>

                <Select value={newManagerId} onValueChange={setNewManagerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>

                  <SelectContent>
                    {validManagers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} — {m.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={!newManagerId}
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          </aside>
        )}
      </div>
    </div>
  );
}