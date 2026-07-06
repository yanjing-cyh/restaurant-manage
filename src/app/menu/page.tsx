"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ShoppingCart, User, LogOut, Plus, Minus, Trash2, Clock, ChefHat, X } from 'lucide-react';

interface Dish {
  id: string; name: string; price: number; description: string;
  categoryId: string; categoryName: string; image: string; available: boolean;
}
interface Category { id: string; name: string; sortOrder: number; }
interface OrderItem { dishId: string; dishName: string; quantity: number; unitPrice: number; }
interface Order {
  id: string; customerName: string; items: OrderItem[];
  totalAmount: number; status: 'PENDING'|'PREPARING'|'COMPLETED'|'CANCELLED'; createdAt: string;
}

export default function MenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/dishes').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([dishesData, catsData]) => {
      setDishes(dishesData);
      setCategories(catsData);
    });
  }, []);

  const router = useRouter();
  const { user, logout } = useAuth();
  const { items: cartItems, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) setCustomerName(user.name || '');
    fetch('/api/orders').then(r => r.json()).then(setAllOrders).catch(() => {});
  }, [user]);

  const filteredDishes = activeCategory === 'all' ? dishes : dishes.filter(d => d.categoryId === activeCategory);
  const categoriesList = [{ id: 'all', name: '全部' }, ...categories];

  async function handlePlaceOrder(e: FormEvent) {
    e.preventDefault();
    const name = user ? (user.name || customerName) : customerName.trim();
    if (!name) { alert('请输入您的姓名'); return; }
    if (cartItems.length === 0) { alert('购物车是空的'); return; }
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, items: cartItems.map(i => ({ dishId: i.dishId, quantity: i.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || '下单失败'); return; }
      clearCart();
      setShowCart(false);
      setOrderSuccess(true);
      const allRes = await fetch('/api/orders');
      setAllOrders(await allRes.json());
      setTimeout(() => { setOrderSuccess(false); }, 2000);
    } catch { alert('网络错误'); }
    finally { setPlacing(false); }
  }

  const userOrders = user
    ? allOrders.filter(o => o.customerName === (user.name || user.username))
    : allOrders.filter(o => o.customerName === customerName.trim());

  function handleLogout() {
    logout();
    router.push('/menu');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-[#F0E0D0] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#E8742D]">🍜 味来餐厅</h1><a href="https://yanjing-cyh.github.io/personal-website/" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-[#F0E0D0] text-[#3D2B1F] opacity-70 hover:opacity-100 hover:border-[#E8742D] transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>返回首页</a>
          <div className="flex items-center gap-1">
            {user ? (
              <span className="text-sm text-[#3D2B1F] opacity-60 mr-1 hidden sm:inline">
                👤 {user.name || user.username}
              </span>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => setShowMyOrders(!showMyOrders)}>
              <Clock size={18} />
              <span className="ml-1 hidden sm:inline">我的订单</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCart(!showCart)}>
              <ShoppingCart size={18} />
              <span className="ml-1">购物车</span>
              {totalItems > 0 && (
                <span className="ml-1 bg-[#C0392B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>
              )}
            </Button>
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut size={18} /></Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}><User size={18} /><span className="ml-1 hidden sm:inline">登录</span></Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categoriesList.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={"px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all " + (activeCategory === cat.id ? "bg-[#E8742D] text-white shadow-md" : "bg-white text-[#3D2B1F] border border-[#F0E0D0] hover:border-[#E8742D]")}>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDishes.filter(d => d.available).map(dish => (
            <Card key={dish.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-36 bg-gradient-to-br from-[#FFE8D0] to-[#FFD4B0] flex items-center justify-center">
                <span className="text-5xl">🍽️</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-[#3D2B1F] text-lg">{dish.name}</h3>
                  <span className="text-[#C0392B] font-bold text-lg">¥{dish.price}</span>
                </div>
                <p className="text-sm text-[#3D2B1F] opacity-60 mb-3">{dish.description}</p>
                <Button size="sm" fullWidth onClick={() => addToCart({ dishId: dish.id, name: dish.name, price: dish.price, image: dish.image })}>
                  <Plus size={16} className="mr-1" /> 加入购物车
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredDishes.filter(d => d.available).length === 0 && (
          <div className="text-center py-16 text-[#3D2B1F] opacity-40">
            <ChefHat size={48} className="mx-auto mb-2" /><p>该分类暂无菜品</p>
          </div>
        )}
      </main>

      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b border-[#F0E0D0] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#3D2B1F]">🛒 购物车</h2>
              <button onClick={() => setShowCart(false)} className="text-[#3D2B1F] opacity-60 hover:opacity-100"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-[#3D2B1F] opacity-40">
                  <ShoppingCart size={48} className="mx-auto mb-2" /><p>购物车是空的</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.dishId} className="flex items-center gap-3 p-3 bg-[#FFF8F0] rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#3D2B1F] truncate">{item.name}</p>
                        <p className="text-[#C0392B] text-sm">¥{item.price} × {item.quantity} = ¥{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQuantity(item.dishId, item.quantity - 1)} className="w-7 h-7 rounded-full border border-[#E8742D] text-[#E8742D] flex items-center justify-center hover:bg-[#E8742D] hover:text-white"><Minus size={14} /></button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.dishId, item.quantity + 1)} className="w-7 h-7 rounded-full border border-[#E8742D] text-[#E8742D] flex items-center justify-center hover:bg-[#E8742D] hover:text-white"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.dishId)} className="text-[#C0392B] opacity-60 hover:opacity-100"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-[#F0E0D0] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#3D2B1F] opacity-70">合计</span>
                  <span className="text-[#C0392B] font-bold text-xl">¥{totalPrice.toFixed(2)}</span>
                </div>
                {!user && <Input placeholder="请输入您的姓名" value={customerName} onChange={e => setCustomerName(e.target.value)} />}
                <Button size="lg" fullWidth onClick={handlePlaceOrder} disabled={placing || orderSuccess}>
                  {placing ? '提交中...' : orderSuccess ? '✓ 下单成功！' : '提交订单'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMyOrders && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowMyOrders(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b border-[#F0E0D0] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#3D2B1F]">📋 我的订单</h2>
              <button onClick={() => setShowMyOrders(false)} className="text-[#3D2B1F] opacity-60 hover:opacity-100"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {userOrders.length === 0 ? (
                <p className="text-center py-8 text-[#3D2B1F] opacity-40">暂无订单</p>
              ) : (
                <div className="space-y-3">
                  {userOrders.map(order => (
                    <Card key={order.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-[#3D2B1F] opacity-50 font-mono">{order.id}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="space-y-1 mb-2">
                        {order.items.map((item, idx) => <p key={idx} className="text-sm text-[#3D2B1F]">{item.dishName} × {item.quantity}</p>)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#3D2B1F] opacity-50">{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                        <span className="text-[#C0392B] font-bold">¥{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}