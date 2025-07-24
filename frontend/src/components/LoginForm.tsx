import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../stores/auth-store'
import { RegisterForm } from './RegisterForm'
import { useNavigate } from 'react-router-dom'

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const navigate = useNavigate()
  const { user, signIn } = useAuthStore()

  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('请填写完整的登录信息')
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('登录成功！')
    } catch (error: any) {
      toast.error(error.message || '登录失败，请检查邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md relative">
      {/* 主容器 */}
      <div className="relative tech-card p-8 backdrop-blur-xl shadow-xl">
        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-animation">
            <span className="text-white text-3xl font-bold">S</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">SmartFactory Studio</h2>
          <p className="text-slate-400 text-sm">智能工厂管理系统 v2.0</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              邮箱地址
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="tech-input w-full pl-10"
                placeholder="请输入邮箱地址"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              密码
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="tech-input w-full pl-10"
                placeholder="请输入密码"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-700"
              />
              <span className="ml-2 text-sm text-slate-300">记住我</span>
            </label>
            <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              忘记密码？
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary relative overflow-hidden group"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                登录中...
              </div>
            ) : (
              <>
                <span className="relative z-10">登录系统</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </>
            )}
          </button>
        </form>

        {/* 底部信息 */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            还没有账号？{' '}
            <button
              type="button"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium underline"
              onClick={() => setShowRegister(true)}
            >
              注册账号
            </button>
          </p>
        </div>

        {/* 装饰性元素 */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-6 w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* 注册表单弹窗 */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <RegisterForm onClose={() => setShowRegister(false)} />
        </div>
      )}

      {/* 系统信息 */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            <span>系统在线</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span>AI分析</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span>3D仿真</span>
          </div>
        </div>
      </div>
    </div>
  )
} 