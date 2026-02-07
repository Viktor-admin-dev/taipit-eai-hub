import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const divisions = await prisma.division.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(divisions);
  } catch (error) {
    console.error("Error fetching divisions:", error);
    return NextResponse.json(
      { error: "Failed to fetch divisions" },
      { status: 500 }
    );
  }
}
