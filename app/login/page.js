"use client";
import { useState } from "react";

export default function Login() {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      window.location.href = "/";
    } else {
      setErr("Galat PIN — dobara try karo");
      setLoading(false);
    }
  }

  return (
    <main className="login-wrap">
      <div className="login-card">
        <div className="login-icon">🥋</div>
        <h1>Operation 30 LPA</h1>
        <p className="muted">PIN daalo aur mission pe wapas aao</p>
        <form onSubmit={submit}>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            autoFocus
          />
          <button disabled={loading || !pin}>{loading ? "..." : "Unlock →"}</button>
        </form>
        {err && <p className="err">{err}</p>}
      </div>
    </main>
  );
}
