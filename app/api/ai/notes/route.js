import { NextResponse } from "next/server";
import PLAN from "@/data/plan.json";
import { askGemini } from "@/lib/gemini";
import { todayDayNumber } from "@/lib/today";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { day } = await req.json();
    const entry = PLAN.find((d) => d.day === Number(day));
    if (!entry) return NextResponse.json({ error: "Day nahi mila" }, { status: 404 });
    if (entry.day > todayDayNumber()) {
      return NextResponse.json({ error: "Locked day ke notes nahi milte 😏 — aaj ka din karo" }, { status: 403 });
    }

    const system =
      "Tum ek senior DevOps engineer ho jo ek beginner ko Hinglish (Roman Hindi + English technical terms) me sikhata hai. Explanations simple, analogies real-world, commands exact. Output markdown me do.";

    const prompt = `Aaj Day ${entry.day} hai — topic: "${entry.title}".
Target: ${entry.target}
Subtopics: ${entry.subtopics.join(", ")}
Depth guidance: ${entry.depth}

In subtopics ke complete study notes banao Hinglish me:
1. Har subtopic ka concept simple words me (jahan useful ho real-world analogy ke saath)
2. Exact commands/code examples ke saath — aur unka expected output
3. Common beginner mistakes (2-3)
4. 3 chhote practice tasks jo abhi terminal pe kar sake
5. Interview angle: is topic pe 2 common interview questions + short answers

Notes focused rakho — sirf AAJ ke subtopics, aage ke din ka nahi.`;

    const text = await askGemini(prompt, system);
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
