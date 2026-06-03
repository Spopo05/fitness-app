import { Link, useLocation } from 'react-router-dom'
import { 
  Users, MessageCircle, User, Dumbbell, Utensils, CreditCard, 
  LayoutDashboard, Sparkles, X, ChevronLeft, ChevronRight, LogOut, Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

const Sidebar = ({ isOpen, onClose, userRole, isRTL = false }) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  const role = userRole || user?.role

  // Define menu items directly
  const getNavigationItems = () => {
    // For admin role - ADD ALL MENU ITEMS
    if (role === 'admin') {
      return [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Users', href: '/users', icon: Users },  // Added Users
        { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },  // Added Subscriptions
        { name: 'Profile', href: '/profile', icon: User },
      ]
    }
    
    // For coach role
    if (role === 'coach') {
      return [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
        { name: 'Profile', href: '/profile', icon: User },
      ]
    }
    
    // For user role
    if (role === 'user') {
      return [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Workouts', href: '/workouts', icon: Dumbbell },
        { name: 'Diet Plan', href: '/diet-plan', icon: Utensils },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
        { name: 'Subscription', href: '/subscription', icon: Sparkles },
        { name: 'Profile', href: '/profile', icon: User },
      ]
    }
    
    // Default fallback
    return [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Profile', href: '/profile', icon: User },
    ]
  }

  const navigationItems = getNavigationItems()
  const sidebarPosition = isRTL ? 'right-0' : 'left-0'

  if (!user) return null

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed ${isOpen ? 'top-0' : 'top-16'} ${sidebarPosition} z-40 h-full bg-white shadow-2xl flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-72'}
          lg:top-16 lg:h-[calc(100vh-4rem)] lg:static
          transform ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Mobile Close Button */}
        {isOpen && (
          <div className="flex justify-end p-4 lg:hidden">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        )}

        {/* User Profile Card */}
        {!collapsed && (
          <div className="p-4 mx-3 mt-6 mb-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{role || 'Role'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed User Avatar */}
        {collapsed && (
          <div className="flex justify-center py-6">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 mx-3"></div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isRTL ? 'flex-row-reverse' : ''}
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-blue-100' : 'bg-transparent group-hover:bg-gray-100'
                }`}>
                  <Icon className={`h-5 w-5 transition-all duration-200 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                </div>
                {!collapsed && (
                  <span className={`${isRTL ? 'text-right' : 'text-left'} flex-1 truncate`}>
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section - Settings & Logout */}
        <div className="border-t border-gray-100 pt-3 pb-4">
          <Link
            to="/settings"
            onClick={onClose}
            className={`
              flex items-center gap-3 px-3 py-2.5 mx-3 rounded-xl text-sm font-medium transition-all duration-200
              text-gray-600 hover:bg-gray-50 hover:text-gray-900
              ${isRTL ? 'flex-row-reverse' : ''}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
            {!collapsed && <span>Settings</span>}
          </Link>

          <button
            onClick={() => logout()}
            className={`
              flex items-center gap-3 px-3 py-2.5 mx-3 rounded-xl text-sm font-medium transition-all duration-200
              text-red-600 hover:bg-red-50
              ${isRTL ? 'flex-row-reverse' : ''}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center">
              <LogOut className="h-5 w-5 text-red-500" />
            </div>
            {!collapsed && <span>Logout</span>}
          </button>

          {/* Collapse/Expand Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
              hidden lg:flex items-center justify-center gap-2
              w-full py-3 border-t border-gray-100 mt-2
              text-gray-500 hover:text-gray-700 hover:bg-gray-50
              transition-all duration-200
            `}
          >
            {collapsed ? (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-xs">Expand</span>
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar