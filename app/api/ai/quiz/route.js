import { NextResponse } from "next/server";
import PLAN from "@/data/plan.json";
import { askGemini } from "@/lib/gemini";
import { todayDayNumber } from "@/lib/today";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { week } = await req.json();
    const w = Number(week);
    if (!w || w < 1 || w > 12) {
      return NextResponse.json({ error: "Invalid week" }, { status: 400 });
    }

    // Sirf unlocked din hi quiz me aayenge
    const days = PLAN.filter((d) => d.week === w && d.day <= todayDayNumber());
    if (days.length === 0) {
      return NextResponse.json({ error: "Is week ka koi din abhi unlock nahi hua" }, { status: 403 });
    }

    const topics = days
      .map((d) => `Day ${d.day}: ${d.title} — ${d.subtopics.join(", ")}`)
      .join("\n");

    const system =
      "Tum DevOps quiz-master ho. Hinglish me practical quiz banao — commands, outputs, troubleshooting scenarios. Ratta nahi, samajh test karo.";

    const prompt = `Week ${w} ke in topics pe 10-question quiz banao:
${topics}

Format:
- Q1 se Q10 numbered, har question ke 4 options (A-D)
- Mix: 6 concept/command MCQs + 4 scenario-based ("agar yeh error aaye toh kya karoge...")
- Answers + 1-line explanation SABSE END me "--- ANSWERS ---" heading ke neeche do, taaki user pehle khud solve kare`;

    const text = await askGemini(prompt, system);
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
