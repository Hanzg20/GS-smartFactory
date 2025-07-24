import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { auth } from '../lib/supabase';

interface RegisterFormProps {
  onClose: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error('请填写完整的注册信息');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      const { error } = await auth.signUp(email, password);
      if (error) throw error;
      toast.success('注册成功，请前往邮箱激活账号！');
      onClose();
    } catch (error: any) {
      toast.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tech-card p-8 w-full max-w-md relative">
      <h2 className="text-xl font-bold text-white mb-6 text-center">注册账号</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">邮箱地址</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="tech-input w-full"
            placeholder="请输入邮箱地址"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="tech-input w-full"
            placeholder="请输入密码"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">确认密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="tech-input w-full"
            placeholder="请再次输入密码"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? '注册中...' : '注册'}
        </button>
        <button
          type="button"
          className="w-full btn-secondary mt-2"
          onClick={onClose}
        >
          取消
        </button>
      </form>
    </div>
  );
}; 