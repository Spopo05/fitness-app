import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  console.log('Layout - User:', user);
  console.log('Layout - Children:', children);

  if (!user) {
    console.log('Layout - No user, returning children only');
    return children;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            isOpen={true} 
            onClose={() => {}}
            userRole={user.role}
            isRTL={isRTL}
          />
        </div>
        
        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar 
                isOpen={true} 
                onClose={() => setSidebarOpen(false)}
                userRole={user.role}
                isRTL={isRTL}
              />
            </div>
          </>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 xl:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout