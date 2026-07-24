import Link from "next/link";
import PLAN from "@/data/plan.json";
import { dbConnect, Progress } from "@/lib/db";
import { todayDayNumber, istTodayStr, TOTAL_DAYS } from "@/lib/today";

export const dynamic = "force-dynamic";

const PHASES = [
  { key: "P1", name: "Foundation — Linux · Shell · Git", range: [1, 21] },
  { key: "P2", name: "Docker + CI/CD + Datadog", range: [22, 42] },
  { key: "P3", name: "Kubernetes + AWS", range: [43, 63] },
  { key: "P4", name: "Terraform + Capstone", range: [64, 84] },
];

async function getDoneSet() {
  try {
    await dbConnect();
    const rows = await Progress.find({ done: true }).lean();
    return new Set(rows.map((r) => r.day));
  } catch {
    return null; // DB configure nahi — dashboard phir bhi chale
  }
}

export default async function Dashboard() {
  const doneSet = await getDoneSet();
  const dbError = doneSet === null;
  const done = doneSet || new Set();

  const today = todayDayNumber();
  const missionDone = today > TOTAL_DAYS;
  const notStarted = today < 1;
  const activeDay = Math.min(Math.max(today, 1), TOTAL_DAYS);
  const todayEntry = PLAN.find((d) => d.day === activeDay);

  const doneCount = done.size;
  const expected = Math.min(Math.max(today, 0), TOTAL_DAYS);
  const gap = Math.max(expected - doneCount, 0);
  const pct = Math.round((doneCount / TOTAL_DAYS) * 100);

  // Streak: aaj (ya kal) se peeche consecutive ✓
  let streak = 0;
  let i = Math.min(today, TOTAL_DAYS);
  if (i >= 1 && !done.has(i)) i--;
  while (i >= 1 && done.has(i)) {
    streak++;
    i--;
  }

  const currentPhase = PHASES.find((p) => activeDay >= p.range[0] && activeDay <= p.range[1]);

  return (
    <main className="wrap">
      <div className="topbar">
        <span className="brand">
          <span className="dot" /> OPERATION 30 LPA
        </span>
        <span className="mono muted">
          {istTodayStr()} · DAY {missionDone ? "84/84 ✓" : notStarted ? "—" : `${today}/84`}
        </span>
      </div>

      <header className="dash-head">
        <h1>
          84 din. Ek mission.<span className="accent"> Roz ek ✓</span>
        </h1>
        <div className="scoreboard mono">
          <div className="score">
            <b>{doneCount}/84</b>
            <span>done ✓</span>
          </div>
          <div className="score">
            <b>{expected}</b>
            <span>expected</span>
          </div>
          <div className={`score ${gap > 2 ? "bad" : ""}`}>
            <b>{gap}</b>
            <span>backlog</span>
          </div>
          <div className="score">
            <b>🔥 {streak}</b>
            <span>streak</span>
          </div>
          <div className="score wide">
            <b>{currentPhase ? currentPhase.key : "—"}</b>
            <span>{currentPhase ? currentPhase.name : "phase"}</span>
          </div>
        </div>
        <div className="progressbar">
          <div className="fill" style={{ width: `${pct}%` }} />
        </div>
      </header>

      {dbError && (
        <div className="banner warn">
          ⚠ MongoDB connect nahi hua — progress save nahi hoga. README ka setup section dekho (MONGODB_URI env var).
        </div>
      )}

      {missionDone ? (
        <div className="hero done-hero">
          <h2>🎉 MISSION COMPLETE!</h2>
          <p>84 din ho gaye. Ab agla phase: CKA + job applications + Stage 1 salary jump. Ustaad se baat karo kisi bhi din pe jaake.</p>
        </div>
      ) : notStarted ? (
        <div className="hero">
          <h2>Mission 25 Jul 2026 ko shuru hoga</h2>
        </div>
      ) : (
        <Link href={`/day/${activeDay}`} className="hero open">
          <div className="hero-tag mono">AAJ KA DIN — UNLOCKED</div>
          <h2>
            Day {activeDay}: {todayEntry ? todayEntry.title : ""}
          </h2>
          <p className="muted">{todayEntry ? todayEntry.target : ""}</p>
          <div className="hero-foot mono">
            <span>⏱ {todayEntry ? todayEntry.time : ""}</span>
            <span className="go">Kholo →</span>
          </div>
        </Link>
      )}

      {PHASES.map((phase) => (
        <section key={phase.key} className="phase-sec">
          <h3 className="mono">
            <span className="accent">{phase.key}</span> · {phase.name}
            <span className="muted"> — Day {phase.range[0]}–{phase.range[1]}</span>
          </h3>
          <div className="grid">
            {PLAN.filter((d) => d.day >= phase.range[0] && d.day <= phase.range[1]).map((d) => {
              const isDone = done.has(d.day);
              const isToday = d.day === today;
              const isPast = d.day < today;
              const locked = d.day > today;

              const cls = [
                "tile",
                isDone ? "done" : "",
                isToday && !isDone ? "today" : "",
                isPast && !isDone ? "missed" : "",
                locked ? "locked" : "",
              ]
                .join(" ")
                .trim();

              const inner = (
                <>
                  <span className="tnum mono">{locked ? "🔒" : isDone ? "✓" : d.day}</span>
                  <span className="ttitle">{d.title}</span>
                </>
              );

              return locked ? (
                <div key={d.day} className={cls} title={`Day ${d.day} — ${d.date} ko unlock hoga`}>
                  {inner}
                </div>
              ) : (
                <Link key={d.day} href={`/day/${d.day}`} className={cls} title={`Day ${d.day}: ${d.title}`}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <footer className="legend mono">
        <span><i className="sw done" /> done</span>
        <span><i className="sw today" /> aaj</span>
        <span><i className="sw missed" /> missed (makeup karo)</span>
        <span><i className="sw locked" /> locked</span>
      </footer>
    </main>
  );
}
