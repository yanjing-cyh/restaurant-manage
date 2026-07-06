import { NextResponse } from "next/server";
import { store } from "@/lib/store";

// GET /api/orders - 获取订单列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const orders = store.getOrders(status || undefined);
  return NextResponse.json(orders);
}

// POST /api/orders - 创建订单
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, items } = body;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    // 计算总价和订单项
    let totalAmount = 0;
    const orderItems: { dishId: string; dishName: string; quantity: number; unitPrice: number }[] = [];

    for (const item of items) {
      const dish = store.getDishById(item.dishId);
      if (!dish) {
        return NextResponse.json({ error: `菜品 ${item.dishId} 不存在` }, { status: 400 });
      }
      orderItems.push({
        dishId: item.dishId,
        dishName: dish.name,
        quantity: item.quantity,
        unitPrice: dish.price,
      });
      totalAmount += dish.price * item.quantity;
    }

    const order = store.createOrder({
      customerName,
      items: orderItems,
      totalAmount,
      status: "PENDING",
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}