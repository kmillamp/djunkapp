import React from 'react'
import { motion } from 'framer-motion'
import {
  Music,
  Palette,
  DollarSign,
  Play,
  Heart,
  Calendar,
  CheckSquare,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavigationItem {
  id: string
  icon: React.ComponentType<any>
  label: string
  path: string
  color: string
  activeColor: string
  bgActive: string
  isCenter?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    id: 'unk',
    icon: Music,
    label: 'UNK',
    path: '/unk',
    color: 'from-purple-500 to-purple-600',
    activeColor: 'text-purple-400',
    bgActive: 'bg-purple-500/15'
  },
  {
    id: 'branding',
    icon: Palette,
    label: 'Branding',
    path: '/branding',
    color: 'from-blue-500 to-blue-600',
    activeColor: 'text-blue-400',
    bgActive: 'bg-blue-500/15'
  },
  {
    id: 'unkash',
    icon: DollarSign,
    label: 'Unkash',
    path: '/unkash',
    color: 'from-green-500 to-green-600',
    activeColor: 'text-green-400',
    bgActive: 'bg-green-500/15'
  },
  {
    id: 'dashboard',
    icon: Play,
    label: 'Home',
    path: '/',
    color: 'from-cyan-500 to-purple-500',
    activeColor: 'text-cyan-400',
    bgActive: 'bg-gradient-to-r from-cyan-500/15 to-purple-500/15',
    isCenter: true
  },
  {
    id: 'self-care',
    icon: Heart,
    label: 'SelfCare',
    path: '/self-care',
    color: 'from-pink-500 to-rose-500',
    activeColor: 'text-pink-400',
    bgActive: 'bg-pink-500/15'
  },
  {
    id: 'agenda',
    icon: Calendar,
    label: 'Agenda',
    path: '/agenda',
    color: 'from-orange-500 to-yellow-500',
    activeColor: 'text-orange-400',
    bgActive: 'bg-orange-500/15'
  },
  {
    id: 'projetos',
    icon: CheckSquare,
    label: 'Projetos',
    path: '/projetos',
    color: 'from-emerald-500 to-teal-500',
    activeColor: 'text-emerald-400',
    bgActive: 'bg-emerald-500/15'
  }
]

function IPhoneMenuItem({
  item,
  isActive,
  onClick
}: {
  item: NavigationItem
  isActive: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  const isColorful = item.isCenter || isActive

  return (
    <motion.button
      onClick={onClick}
      aria-label={item.label}
      className={`relative flex flex-col items-center justify-center shrink-0 rounded-xl transition-all duration-300 ${
        isActive ? item.bgActive : 'hover:bg-white/5'
      } p-1 ${item.isCenter ? 'scale-110 -translate-y-2' : ''}`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`flex items-center justify-center rounded-lg mb-1 shadow-lg ${
          isColorful
            ? `bg-gradient-to-br ${item.color}`
            : 'bg-white/10'
        } w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 ${
          item.isCenter ? 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14' : ''
        }`}
        animate={{
          boxShadow: isColorful
            ? '0 4px 14px rgba(0,0,0,0.25)'
            : '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        <Icon
          size={item.isCenter ? 18 : 16}
          className="text-white sm:w-5 sm:h-5 bg-transparent"
        />
      </motion.div>
      <span
        className={`leading-tight font-medium text-[9px] sm:text-[10px] ${
          isActive || item.isCenter ? item.activeColor : 'text-white/70'
        }`}
      >
        {item.label}
      </span>
      {isActive && !item.isCenter && (
        <motion.div
          layoutId="active-dot"
          className="absolute -bottom-1 w-1 h-1 bg-white/90 rounded-full"
        />
      )}
    </motion.button>
  )
}

export function IPhoneMenu() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentActiveId = navigationItems.find(item => item.path === location.pathname)?.id || 'dashboard'

  const handleItemClick = (item: NavigationItem) => {
    console.log('Navigation to:', item.path)
    navigate(item.path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto w-full max-w-md px-2">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/80 backdrop-blur-xl border-t border-white/10 px-2 py-2 rounded-t-3xl shadow-2xl"
        >
          {/* Navigation Items */}
          <div className="flex items-end justify-between gap-1 pt-2">
            {navigationItems.map(item => (
              <IPhoneMenuItem
                key={item.id}
                item={item}
                isActive={currentActiveId === item.id}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
          <div className="w-24 h-1 bg-white/15 rounded-full mx-auto mt-2" />
        </motion.div>
      </div>
    </div>
  )
}