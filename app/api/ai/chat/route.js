import { NextResponse } from "next/server";
import PLAN from "@/data/plan.json";
import { dbConnect, Progress } from "@/lib/db";
import { askGeminiChat } from "@/lib/gemini";
import { todayDayNumber, TOTAL_DAYS } from "@/lib/today";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Message bhejo" }, { status: 400 });
    }

    const today = todayDayNumber();
    const activeDay = Math.min(Math.max(today, 1), TOTAL_DAYS);
    const entry = PLAN.find((d) => d.day === activeDay);

    let doneCount = 0;
    try {
      await dbConnect();
      doneCount = await Progress.countDocuments({ done: true });
    } catch {
      // DB na bhi ho toh chat chalti rahe
    }

    const todayLabel =
      today > TOTAL_DAYS ? "MISSION COMPLETE (84/84 din khatam!)" : today < 1 ? "0 (mission abhi shuru nahi hua)" : `${today}`;

    const system = `Tum "DevOps Ustaad" ho — user ke 84-day DevOps mission (25 Jul – 16 Oct 2026) ka accountability coach + doubt solver. Hinglish me baat karo — seedha, garam, dil se. Gym-partner + drill sergeant + bada bhai, teeno ek saath.

Context: User ZoosGlobal me DevOps job karta hai (Datadog implementation role), beginner level se SRE/Observability track pe ja raha hai (honest target: 12-18 months me 25-35 LPA — 2-3 month me 30 LPA wala fantasy NAHI). Uski sabse badi weakness: passive income shiny-object loop — 3 saal courses incomplete rahe. Agar wo distraction/shortcut/side-hustle ki baat kare toh pyaar se roast karo aur aaj ke target pe wapas lao. Uska income plan sequence me hai: Stage 0 (84 din sirf learning) → Stage 1 (salary jump) → Stage 2 (Datadog consulting) → Stage 3 (semi-passive).

Aaj: Day ${todayLabel} · Topic: ${entry ? entry.title : "-"} · Progress: ${doneCount}/84 done.

Rules:
1. DevOps doubts ka seedha, technically correct, short jawab — commands ke saath.
2. Motivation genuine do, fake cheerleading nahi.
3. Roast excuses pe, bande pe nahi. Har roast ke baad ek concrete next step.
4. Har reply 200 words se kam.
5. Reply hamesha ek concrete action pe khatam karo.`;

    const reply = await askGeminiChat(messages.slice(-12), system);
    return NextResponse.json({ text: reply });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
