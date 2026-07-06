// 全局类型定义
export interface User {
  id: string
  username: string
  password: string
  name: string
  role: 'CUSTOMER' | 'MERCHANT'
}

export interface Category {
  id: string
  name: string
  sortOrder: number
}

export interface Dish {
  id: string
  name: string
  price: number
  description: string
  categoryId: string
  categoryName: string
  image: string
  available: boolean
}

export interface CartItem {
  dishId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface OrderItem {
  dishId: string
  dishName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  customerName: string
  items: OrderItem[]
  totalAmount: number
  status: 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
}

export type UserRole = 'CUSTOMER' | 'MERCHANT'
export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED'
