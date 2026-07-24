import { NextResponse } from "next/server";
import { dbConnect, Progress } from "@/lib/db";
import { todayDayNumber } from "@/lib/today";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const rows = await Progress.find({}).sort({ day: 1 }).lean();
    return NextResponse.json({ progress: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { day, done } = await req.json();
    const n = Number(day);
    const today = todayDayNumber();

    if (!n || n < 1 || n > 84) {
      return NextResponse.json({ error: "Invalid day" }, { status: 400 });
    }
    // Future days lock — aaj se aage ka din mark nahi hoga
    if (n > today) {
      return NextResponse.json(
        { error: `Day ${n} abhi locked hai — pehle aaj ka din karo 😏` },
        { status: 403 }
      );
    }

    await dbConnect();
    const row = await Progress.findOneAndUpdate(
      { day: n },
      { done: !!done, doneAt: done ? new Date() : null },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ ok: true, progress: row });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
