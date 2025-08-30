import { Settings, Bell, LogOut, Crown, Headphones, CircleUserRound } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/unk-button"
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

export const ProfileHeader = () => {
  const { profile } = useUser();
  const navigate = useNavigate();

  const displayName = profile?.artist_name || profile?.full_name || 'Usuário';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return `Bom dia, ${displayName}`;
    } else if (hour >= 12 && hour < 18) {
      return `Boa tarde, ${displayName}`;
    } else {
      return `Boa noite, ${displayName}`;
    }
  };

  const handleProfileNavigation = () => {
    navigate('/profile');
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
            <AvatarImage src={profile?.avatar_url || "/placeholder-avatar.jpg"} alt="Perfil" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Badge de identificação */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
            {profile?.is_admin ? (
              <Crown className="w-3 h-3 text-primary-foreground" />
            ) : (
              <Headphones className="w-3 h-3 text-primary-foreground" />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground">{getGreeting()}</h2>
            {profile?.is_admin && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                Admin
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Vamos criar conexões reais hoje?</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="glass" size="sm">
          <Bell className="w-4 h-4" />
        </Button>
        <Button variant="glass" size="sm" onClick={handleProfileNavigation}>
          <CircleUserRound className="w-4 h-4" />
        </Button>
        <Button variant="glass" size="sm" onClick={() => {}}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}