import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const categories = store.getCategories();
  return NextResponse.json(categories);
}
