"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('两次输入的密码不一致'); return; }
    if (password.length < 4) { setError('密码至少4位'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '注册失败'); setLoading(false); return; }
      localStorage.setItem('restaurant_user', JSON.stringify(data.user));
      router.push('/login');
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] via-[#FFE8D0] to-[#FFF8F0]">
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#E8742D]">味来餐厅</h1>
          <p className="text-sm text-[#3D2B1F] opacity-60 mt-1">顾客注册</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="姓名" value={name} onChange={e => setName(e.target.value)} placeholder="请输入姓名" required />
          <Input label="用户名" value={username} onChange={e => setUsername(e.target.value)} placeholder="请输入用户名" required />
          <Input label="密码" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="至少4位" required />
          <Input label="确认密码" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="再次输入密码" required />
          {error && <p className="text-[#C0392B] text-sm text-center">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>{loading ? '注册中...' : '注册'}</Button>
        </form>
        <p className="text-center text-sm mt-6 text-[#3D2B1F] opacity-60">
          已有账号？ <Link href="/login" className="text-[#E8742D] font-medium hover:underline">立即登录</Link>
        </p>
      </div>
    </div>
  );
}
