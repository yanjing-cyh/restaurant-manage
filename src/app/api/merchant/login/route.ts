import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }

    const merchant = store.getMerchant();
    if (merchant.username !== username || merchant.password !== password) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    return NextResponse.json({
      user: { id: merchant.id, username: merchant.username, name: merchant.name, role: merchant.role },
    });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
