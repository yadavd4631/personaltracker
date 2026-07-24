import Link from "next/link";
import PLAN from "@/data/plan.json";
import { dbConnect, Progress } from "@/lib/db";
import { todayDayNumber, TOTAL_DAYS } from "@/lib/today";
import DayClient from "@/components/DayClient";

export const dynamic = "force-dynamic";

export default async function DayPage({ params }) {
  const n = Number(params.n);
  const entry = PLAN.find((d) => d.day === n);
  const today = todayDayNumber();

  if (!entry) {
    return (
      <main className="wrap">
        <p>Yeh day exist nahi karta.</p>
        <Link className="btn ghost" href="/">← Dashboard</Link>
      </main>
    );
  }

  // 🔒 DAILY LOCK — future din server pe hi block
  if (n > today) {
    return (
      <main className="wrap locked-screen">
        <div className="lock-icon">🔒</div>
        <h1>Day {n} abhi locked hai</h1>
        <p className="muted">
          Yeh <b>{entry.date}</b> ko khulega. Ek din me ek hi kadam — aage bhaagne se
          foundation nahi banta.
        </p>
        {today >= 1 && today <= TOTAL_DAYS && (
          <Link className="btn" href={`/day/${today}`}>
            Aaj ka din kholo (Day {today}) →
          </Link>
        )}
        <Link className="btn ghost" href="/">← Dashboard</Link>
      </main>
    );
  }

  let isDone = false;
  try {
    await dbConnect();
    const row = await Progress.findOne({ day: n }).lean();
    isDone = !!row?.done;
  } catch {
    // DB na ho toh bhi page khule
  }

  const isToday = n === today;

  return (
    <main className="wrap">
      <nav className="daynav mono">
        <Link href="/">← Dashboard</Link>
        <span className="muted">{entry.date}</span>
      </nav>

      <header className="day-head">
        <div className="badges">
          <span className="badge">{entry.phase}</span>
          <span className="badge">Week {entry.week}</span>
          <span className="badge">⏱ {entry.time}</span>
          {isToday && <span className="badge live">AAJ</span>}
          {isDone && <span className="badge ok">✓ DONE</span>}
          {!isDone && n < today && <span className="badge miss">MAKEUP PENDING</span>}
        </div>
        <h1>
          <span className="mono accent">Day {n}</span> · {entry.title}
        </h1>
        <p className="target">{entry.target}</p>
      </header>

      <section className="cards">
        <div className="card">
          <h3>📚 Aaj kya cover karna hai</h3>
          <ul>
            {entry.subtopics.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>🎯 Kitni depth me</h3>
          <p>{entry.depth}</p>
        </div>
        <div className="card">
          <h3>🔗 Resources (sirf yehi — course-hopping ban)</h3>
          <ul>
            {entry.resources.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>📦 Aaj ka deliverable (proof of work)</h3>
          <p>{entry.deliverable}</p>
        </div>
      </section>

      <DayClient
        day={n}
        week={entry.week}
        initialDone={isDone}
        isRevisionDay={n % 7 === 0}
      />
    </main>
  );
}
