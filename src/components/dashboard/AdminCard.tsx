import { Shield, Settings } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/unk-button";
import { useNavigate } from "react-router-dom";

export const AdminCard = () => {
  const navigate = useNavigate();

  return (
    <GlassCard 
      variant="primary" 
      className="p-6 hover:scale-105 transition-transform cursor-pointer"
      onClick={() => navigate('/admin/central')}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h3 className="text-xl font-semibold text-foreground">Central Administrativa</h3>
            <p className="text-sm text-muted-foreground">Acesso completo ao sistema</p>
          </div>
        </div>
        <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
      </div>

      <Button 
        variant="glass" 
        className="w-full"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/admin/central');
        }}
      >
        <Settings className="w-4 h-4 mr-2" />
        Acessar Painel
      </Button>
    </GlassCard>
  );
};