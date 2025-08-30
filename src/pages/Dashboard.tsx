import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ProfileHeader } from "@/components/dashboard/ProfileHeader"
import { AdminCard } from "@/components/dashboard/AdminCard"
import { QuickNotes } from "@/components/dashboard/QuickNotes"
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents"
import { ProjectTasks } from "@/components/dashboard/ProjectTasks"
import { ProjectGoals } from "@/components/dashboard/ProjectGoals"
import { DailyQuote } from "@/components/dashboard/DailyQuote"
import { useAuth } from "@/contexts/AuthContext"

const Dashboard = () => {
  const { user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login")
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Profile Header */}
      <ProfileHeader />

      <div className="px-4 space-y-4">
        {/* Admin Card - apenas para admins */}
        {isAdmin && <AdminCard />}

        {/* Grid Principal */}
        <div className="grid grid-cols-1 gap-4">
          {/* Frase do Dia */}
          <DailyQuote />

          {/* Duas colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickNotes />
            <UpcomingEvents />
          </div>

          {/* Duas colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProjectTasks />
            <ProjectGoals />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard