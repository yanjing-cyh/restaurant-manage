"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isMerchant ? '/api/merchant/login' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '登录失败'); setLoading(false); return; }
      localStorage.setItem('restaurant_user', JSON.stringify(data.user));
      router.push(isMerchant ? '/merchant' : '/menu');
      router.refresh();
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] via-[#FFE8D0] to-[#FFF8F0]">
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#E8742D]">味来餐厅</h1>
        </div>

        <div className="flex rounded-lg border border-[#F0E0D0] overflow-hidden mb-6">
          <button
            onClick={() => { setIsMerchant(false); setError(''); }}
            className={"flex-1 py-2.5 text-sm font-medium transition-all " + (!isMerchant ? "bg-[#E8742D] text-white" : "bg-white text-[#3D2B1F] opacity-60")}
          >
            顾客登录
          </button>
          <button
            onClick={() => { setIsMerchant(true); setError(''); }}
            className={"flex-1 py-2.5 text-sm font-medium transition-all " + (isMerchant ? "bg-[#3D2B1F] text-white" : "bg-white text-[#3D2B1F] opacity-60")}
          >
            商家登录
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="用户名" value={username} onChange={e => setUsername(e.target.value)} placeholder="请输入用户名" required />
          <Input label="密码" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" required />
          {error && <p className="text-[#C0392B] text-sm text-center">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? '登录中...' : (isMerchant ? '商家登录' : '登录')}
          </Button>
        </form>

        <p className="text-center text-sm mt-6 text-[#3D2B1F] opacity-60">
          还没有账号？ <Link href="/register" className="text-[#E8742D] font-medium hover:underline">顾客注册</Link>
        </p>

        {isMerchant && (
          <p className="text-center text-xs mt-4 text-[#3D2B1F] opacity-40">
            默认账号: admin / admin123
          </p>
        )}
      </div>
    </div>
  );
}
