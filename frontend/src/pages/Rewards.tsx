import { motion } from "framer-motion";
import { Gift, Star, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, mockRewards } from "@/data/mock";
import { useState } from "react";
import { toast } from "sonner";

export default function Rewards() {
  const currentUser = getCurrentUser();
  const initialPoints = Number(currentUser.points ?? 0);
  const [points, setPoints] = useState(initialPoints);

  const handleRedeem = (reward: typeof mockRewards[0]) => {
    if (points < reward.cost) {
      toast.error("Pontos insuficientes!");
      return;
    }
    setPoints((p) => p - reward.cost);
    toast.success(`🎉 "${reward.name}" resgatado com sucesso!`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <Gift className="w-8 h-8 text-accent" />
            Recompensas
          </h1>
          <p className="text-muted-foreground mt-1">Troque seus pontos por prêmios incríveis</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-5 py-3">
          <Star className="w-5 h-5 text-warning" />
          <span className="text-2xl font-heading font-bold text-foreground">{points.toLocaleString()}</span>
          <span className="text-muted-foreground text-sm">pontos</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRewards.map((reward, i) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-32 bg-gradient-card flex items-center justify-center text-6xl">
                {reward.image}
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading font-semibold text-foreground">{reward.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {reward.available} restantes
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning" />
                    <span className="font-heading font-bold text-foreground">{reward.cost}</span>
                  </div>
                  <Button
                    size="sm"
                    disabled={points < reward.cost || reward.available === 0}
                    onClick={() => handleRedeem(reward)}
                    className="bg-gradient-primary text-primary-foreground"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Resgatar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
