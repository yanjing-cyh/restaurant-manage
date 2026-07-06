import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const validStatuses = ["PENDING", "PREPARING", "COMPLETED", "CANCELLED"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "无效的状态" }, { status: 400 });
  }

  const order = store.updateOrderStatus(id, status as any);
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  return NextResponse.json(order);
}