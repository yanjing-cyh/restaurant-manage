import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }

    // 先查商家
    const merchant = store.getMerchant();
    if (merchant.username === username && merchant.password === password) {
      return NextResponse.json({
        error: "请使用商家后台登录",
      }, { status: 403 });
    }

    // 查顾客
    const customer = store.getCustomerByUsername(username);
    if (!customer || customer.password !== password) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    return NextResponse.json({
      user: { id: customer.id, username: customer.username, name: customer.name, role: customer.role },
    });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
