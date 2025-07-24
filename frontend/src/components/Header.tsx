import React from 'react'
import { useAuthStore } from '../stores/auth-store'
import { LogOut } from 'lucide-react'

export const Header: React.FC = () => {
  const { user, signOut, loading } = useAuthStore()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold text-blue-600">SmartFactory Studio</span>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <span className="text-gray-700 text-sm">{user.email}</span>
              <button
                onClick={signOut}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm focus:outline-none"
              >
                <LogOut className="h-4 w-4 mr-1" /> 退出
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 