import { NextResponse, type NextRequest } from "next/server";
import { store } from "@/lib/store";

// GET /api/dishes
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const dishes = categoryId ? store.getDishes(categoryId) : store.getDishes();
  return NextResponse.json(dishes);
}

// POST /api/dishes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, categoryId, description, image, available } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const newDish = store.createDish({
      name,
      price: parseFloat(price),
      categoryId,
      description: description || "",
      image: image || "/placeholder.jpg",
      available: available !== false,
    });

    return NextResponse.json(newDish, { status: 201 });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}