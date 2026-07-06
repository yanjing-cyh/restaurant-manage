// @ts-nocheck

"use client";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { LogOut, ChefHat, ClipboardList, TrendingUp, DollarSign, Clock, Plus } from 'lucide-react';

interface Dish {
  id: string; name: string; price: number; description: string;
  categoryId: string; categoryName: string; image: string; available: boolean;
}
interface OrderItem { dishId: string; dishName: string; quantity: number; unitPrice: number; }
interface Order {
  id: string; customerName: string; items: OrderItem[];
  totalAmount: number; status: 'PENDING'|'PREPARING'|'COMPLETED'|'CANCELLED'; createdAt: string;
}
interface Stats { todayOrders: number; todayRevenue: number; pendingCount: number; totalOrders: number; }

export default function MerchantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{id:string;username:string;name:string;role:string} | null>(null);
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ todayOrders: 0, todayRevenue: 0, pendingCount: 0, totalOrders: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDish, setNewDish] = useState({ name: '', price: '', categoryId: 'cat-1', description: '' });

  useEffect(() => {
    const saved = localStorage.getItem('restaurant_user');
    if (!saved) { router.push('/login'); return; }
    const userData = JSON.parse(saved);
    if (userData.role !== 'MERCHANT') { router.push('/login'); return; }
    setUser(userData);
    loadData();
  }, [router]);

  async function loadData() {
    const [dRes, oRes, sRes] = await Promise.all([
      fetch('/api/dishes'), fetch('/api/orders'), fetch('/api/stats'),
    ]);
    const [dData, oData, sData] = await Promise.all([dRes.json(), oRes.json(), sRes.json()]);
    setDishes(dData);
    setOrders(oData);
    setStats(sData);
  }

  async function handleStatusChange(orderId: string, status: string) {
    await fetch('/api/orders/' + orderId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  }

  function handleLogout() {
    localStorage.removeItem('restaurant_user');
    router.push('/login');
    router.refresh();
  }

  async function handleAddDish(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/dishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newDish, price: parseFloat(newDish.price) }),
    });
    setShowAddModal(false);
    setNewDish({ name: '', price: '', categoryId: 'cat-1', description: '' });
    loadData();
  }

  if (!user) return null;

  const tabItems = [
    { key: 'dashboard', label: '仪表盘', icon: TrendingUp },
    { key: 'dishes', label: '菜品管理', icon: ChefHat },
    { key: 'orders', label: '订单管理', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <header className="bg-white border-b border-[#F0E0D0] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-[#E8742D]">味来餐厅 - 商家后台</h1><a href="https://yanjing-cyh.github.io/personal-website/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-[#F0E0D0] text-[#3D2B1F] opacity-70 hover:opacity-100 hover:border-[#E8742D] transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>返回首页</a>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#3D2B1F] opacity-60">用户: {user.name || user.username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut size={16} /></Button>
            </div>
          </div>
          <div className="flex gap-1">
            {tabItems.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all " + (activeTab === tab.key ? "bg-[#E8742D] text-white" : "text-[#3D2B1F] opacity-60 hover:opacity-100 hover:bg-[#F0E0D0]")}>
                <tab.icon size={16} />{tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<TrendingUp size={24}/>} label="今日订单" value={stats.todayOrders} color="#E8742D" />
              <StatCard icon={<DollarSign size={24}/>} label="今日营收" value={'¥' + stats.todayRevenue.toFixed(2)} color="#27AE60" />
              <StatCard icon={<Clock size={24}/>} label="待处理" value={stats.pendingCount} color="#F39C12" />
              <StatCard icon={<ClipboardList size={24}/>} label="总订单" value={stats.totalOrders} color="#3498DB" />
            </div>
            <Card className="p-4">
              <h3 className="font-bold text-[#3D2B1F] mb-3">最近订单</h3>
              {orders.length === 0 ? <p className="text-center py-8 text-[#3D2B1F] opacity-40">暂无订单</p> : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-[#FFF8F0] rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-[#3D2B1F]">{order.customerName}</span>
                        <span className="text-xs text-[#3D2B1F] opacity-50 ml-2">{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        <span className="text-[#C0392B] font-bold">¥{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'dishes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#3D2B1F]">菜品列表</h2>
              <Button onClick={() => setShowAddModal(true)}><Plus size={16} className="mr-1"/> 新增菜品</Button>
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FFF8F0] border-b border-[#F0E0D0]">
                    <tr>
                      <th className="text-left p-3 font-medium">菜品</th>
                      <th className="text-left p-3 font-medium">分类</th>
                      <th className="text-left p-3 font-medium">价格</th>
                      <th className="text-left p-3 font-medium">状态</th>
                      <th className="text-right p-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dishes.map(dish => (
                      <tr key={dish.id} className="border-b border-[#F0E0D0] last:border-0">
                        <td className="p-3">
                          <div className="font-medium text-[#3D2B1F]">{dish.name}</div>
                          <div className="text-xs text-[#3D2B1F] opacity-50 truncate max-w-[200px]">{dish.description}</div>
                        </td>
                        <td className="p-3 text-[#3D2B1F] opacity-70">{dish.categoryName}</td>
                        <td className="p-3 text-[#C0392B] font-medium">¥{dish.price}</td>
                        <td className="p-3">
                          <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " + (dish.available ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#F5F5F5] text-[#616161]")}>
                            {dish.available ? '在售' : '下架'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => {
                              fetch('/api/dishes/' + dish.id, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ available: !dish.available }),
                              }).then(() => loadData());
                            }} className="text-xs px-2 py-1 rounded bg-[#FFF8F0] border border-[#F0E0D0] text-[#3D2B1F] hover:bg-[#F0E0D0]">
                              {dish.available ? '下架' : '上架'}
                            </button>
                            <button onClick={() => {
                              if (confirm('确定删除"' + dish.name + '"？')) {
                                fetch('/api/dishes/' + dish.id, { method: 'DELETE' }).then(() => loadData());
                              }
                            }} className="text-xs px-2 py-1 rounded bg-[#FFF8F0] border border-[#F0E0D0] text-[#C0392B] hover:bg-[#FEE2E2]">
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#3D2B1F]">订单管理</h2>
            {orders.length === 0 ? (
              <Card className="p-8 text-center text-[#3D2B1F] opacity-40">暂无订单</Card>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs text-[#3D2B1F] opacity-50 font-mono block">{order.id}</span>
                        <span className="font-medium text-[#3D2B1F]">{order.customerName}</span>
                        <span className="text-xs text-[#3D2B1F] opacity-50 ml-2">{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-[#3D2B1F]">{item.dishName} x {item.quantity} = ¥{(item.unitPrice * item.quantity).toFixed(2)}</p>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#C0392B] font-bold text-lg">¥{order.totalAmount.toFixed(2)}</span>
                      <div className="flex gap-1">
                        {order.status === 'PENDING' && (
                          <Button size="sm" onClick={() => handleStatusChange(order.id, 'PREPARING')}>开始制作</Button>
                        )}
                        {order.status === 'PREPARING' && (
                          <Button size="sm" onClick={() => handleStatusChange(order.id, 'COMPLETED')}>完成</Button>
                        )}
                        {(order.status === 'PENDING' || order.status === 'PREPARING') && (
                          <Button variant="danger" size="sm" onClick={() => handleStatusChange(order.id, 'CANCELLED')}>取消</Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddModal(false)} />
          <Card className="relative p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">新增菜品</h3>
            <form onSubmit={handleAddDish} className="space-y-3">
              <Input label="菜名" value={newDish.name} onChange={e => setNewDish(p => ({ ...p, name: e.target.value }))} placeholder="请输入菜名" required />
              <Input label="价格" type="number" step="0.01" value={newDish.price} onChange={e => setNewDish(p => ({ ...p, price: e.target.value }))} placeholder="0.00" required />
              <div>
                <label className="block text-sm font-medium text-[#3D2B1F] mb-1.5">分类</label>
                <select value={newDish.categoryId} onChange={e => setNewDish(p => ({ ...p, categoryId: e.target.value }))} className="input-field">
                  <option value="cat-1">热销</option>
                  <option value="cat-2">主食</option>
                  <option value="cat-3">小菜</option>
                  <option value="cat-4">饮品</option>
                  <option value="cat-5">甜品</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D2B1F] mb-1.5">描述</label>
                <textarea value={newDish.description} onChange={e => setNewDish(p => ({ ...p, description: e.target.value }))} className="input-field resize-none" rows={2} placeholder="菜品描述" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" fullWidth>添加</Button>
                <Button type="button" variant="outline" fullWidth onClick={() => setShowAddModal(false)}>取消</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20', color }}>{icon}</div>
        <div>
          <p className="text-xs text-[#3D2B1F] opacity-60">{label}</p>
          <p className="text-xl font-bold text-[#3D2B1F]">{value}</p>
        </div>
      </div>
    </Card>
  );
}
