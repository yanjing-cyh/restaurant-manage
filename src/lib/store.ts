// 内存数据存储（演示用，刷新后重置）

import type { User, Category, Dish, Order } from '@/types'

// 初始商家账号
const MERCHANT_USER: User = {
  id: 'merchant-1',
  username: 'admin',
  password: 'admin123',
  name: '店长',
  role: 'MERCHANT',
}

// 顾客用户存储
let customers: User[] = []

// 分类数据
const categories: Category[] = [
  { id: 'cat-1', name: '热销', sortOrder: 0 },
  { id: 'cat-2', name: '主食', sortOrder: 1 },
  { id: 'cat-3', name: '小菜', sortOrder: 2 },
  { id: 'cat-4', name: '饮品', sortOrder: 3 },
  { id: 'cat-5', name: '甜品', sortOrder: 4 },
]

// 菜品数据
const dishes: Dish[] = [
  { id: 'd1', name: '宫保鸡丁', price: 32, description: '经典川菜，花生鸡肉，微辣', categoryId: 'cat-1', categoryName: '热销', image: '/dishes/kungpao.jpg', available: true },
  { id: 'd2', name: '麻婆豆腐', price: 22, description: '麻辣鲜香，下饭神器', categoryId: 'cat-1', categoryName: '热销', image: '/dishes/mapo.jpg', available: true },
  { id: 'd3', name: '红烧牛肉面', price: 28, description: '慢炖牛肉，手工拉面', categoryId: 'cat-2', categoryName: '主食', image: '/dishes/beef-noodle.jpg', available: true },
  { id: 'd4', name: '蛋炒饭', price: 15, description: '粒粒分明，蛋香浓郁', categoryId: 'cat-2', categoryName: '主食', image: '/dishes/fried-rice.jpg', available: true },
  { id: 'd5', name: '扬州炒饭', price: 20, description: '虾仁火腿豌豆，丰富配料', categoryId: 'cat-2', categoryName: '主食', image: '/dishes/yangzhou-rice.jpg', available: true },
  { id: 'd6', name: '凉拌黄瓜', price: 10, description: '蒜泥陈醋，清爽开胃', categoryId: 'cat-3', categoryName: '小菜', image: '/dishes/cucumber.jpg', available: true },
  { id: 'd7', name: '拍茄子', price: 12, description: '蒜泥辣椒油，夏天必备', categoryId: 'cat-3', categoryName: '小菜', image: '/dishes/eggplant.jpg', available: true },
  { id: 'd8', name: '老干妈炒青菜', price: 14, description: '家常小炒，香辣可口', categoryId: 'cat-3', categoryName: '小菜', image: '/dishes/vegetable.jpg', available: true },
  { id: 'd9', name: '酸梅汤', price: 8, description: '冰镇特饮，酸甜解腻', categoryId: 'cat-4', categoryName: '饮品', image: '/dishes/plum.jpg', available: true },
  { id: 'd10', name: '鲜榨橙汁', price: 15, description: '现榨新鲜橙子', categoryId: 'cat-4', categoryName: '饮品', image: '/dishes/orange.jpg', available: true },
  { id: 'd11', name: '珍珠奶茶', price: 12, description: '经典港式风味', categoryId: 'cat-4', categoryName: '饮品', image: '/dishes/milk-tea.jpg', available: true },
  { id: 'd12', name: '杨枝甘露', price: 18, description: '芒果椰奶西米露', categoryId: 'cat-5', categoryName: '甜品', image: '/dishes/mango.jpg', available: true },
  { id: 'd13', name: '红豆双皮奶', price: 14, description: '传统广式甜品', categoryId: 'cat-5', categoryName: '甜品', image: '/dishes/pudding.jpg', available: true },
]

// 订单存储
let orders: Order[] = []

export const store = {
  getMerchant(): User { return MERCHANT_USER },
  getCustomers(): User[] { return customers },
  setCustomers(c: User[]) { customers = c },

  getCategories(): Category[] { return [...categories].sort((a, b) => a.sortOrder - b.sortOrder) },

  getDishes(categoryId?: string): Dish[] {
    let result = [...dishes]
    if (categoryId) result = result.filter(d => d.categoryId === categoryId)
    return result
  },

  getDishById(id: string): Dish | undefined {
    return dishes.find(d => d.id === id)
  },

  createDish(dish: Omit<Dish, 'id' | 'categoryName'>): Dish {
    const newDish: Dish = { ...dish, id: `d-${Date.now()}`, categoryName: categories.find(c => c.id === dish.categoryId)?.name || '' }
    dishes.push(newDish)
    return newDish
  },

  updateDish(id: string, updates: Partial<Dish>): Dish | null {
    const idx = dishes.findIndex(d => d.id === id)
    if (idx === -1) return null
    Object.assign(dishes[idx], updates)
    return dishes[idx]
  },

  deleteDish(id: string): boolean {
    const idx = dishes.findIndex(d => d.id === id)
    if (idx === -1) return false
    dishes.splice(idx, 1)
    return true
  },

  getOrders(status?: string): Order[] {
    let result = [...orders]
    if (status) result = result.filter(o => o.status === status)
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getOrderById(id: string): Order | undefined {
    return orders.find(o => o.id === id)
  },

  createOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const newOrder: Order = { ...order, id: `ord-${Date.now()}`, createdAt: new Date().toISOString() }
    orders.push(newOrder)
    return newOrder
  },

  updateOrderStatus(id: string, status: Order['status']): Order | null {
    const order = orders.find(o => o.id === id)
    if (!order) return null
    order.status = status
    return order
  },

  getCustomerByUsername(username: string): User | undefined {
    return customers.find(u => u.username === username)
  },

  createCustomer(user: Omit<User, 'id' | 'role'>): User {
    const newUser: User = { ...user, id: `cust-${Date.now()}`, role: 'CUSTOMER' }
    customers.push(newUser)
    return newUser
  },

  // 统计数据
  getStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today)
    const todayRevenue = todayOrders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalAmount, 0)
    const pendingCount = orders.filter(o => o.status === 'PENDING').length
    return { todayOrders: todayOrders.length, todayRevenue, pendingCount, totalOrders: orders.length }
  },
}
