"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Chhota markdown → HTML converter (Gemini output ke liye)
function mdToHtml(md) {
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s) =>
    s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");

  const lines = esc(md).split("\n");
  const out = [];
  let inCode = false;
  let inList = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(inCode ? "</code></pre>" : "<pre><code>");
      inCode = !inCode;
      continue;
    }
    if (inCode) { out.push(line); continue; }

    const li = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)/);
    if (li) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(li[1])}</li>`);
      continue;
    }
    if (inList) { out.push("</ul>"); inList = false; }

    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) { out.push(`<h4>${inline(h[2])}</h4>`); continue; }
    if (!line.trim()) { out.push(""); continue; }
    out.push(`<p>${inline(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  if (inCode) out.push("</code></pre>");
  return out.join("\n");
}

export default function DayClient({ day, week, initialDone, isRevisionDay }) {
  const router = useRouter();
  const [done, setDone] = useState(initialDone);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("notes");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [err, setErr] = useState("");
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");

  async function toggleDone() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, done: !done }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save nahi hua");
      setDone(!done);
      router.refresh();
    } catch (e) {
      setErr(e.message);
    }
    setSaving(false);
  }

  async function getAi(kind) {
    setAiLoading(true);
    setErr("");
    setAiText("");
    try {
      const url = kind === "quiz" ? "/api/ai/quiz" : "/api/ai/notes";
      const body = kind === "quiz" ? { week } : { day };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI se response nahi aaya");
      setAiText(data.text);
    } catch (e) {
      setErr(e.message);
    }
    setAiLoading(false);
  }

  async function sendChat(e) {
    e.preventDefault();
    if (!input.trim() || aiLoading) return;
    const next = [...chat, { role: "user", text: input.trim() }];
    setChat(next);
    setInput("");
    setAiLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ustaad so gaya lagta hai — retry");
      setChat([...next, { role: "model", text: data.text }]);
    } catch (e2) {
      setErr(e2.message);
    }
    setAiLoading(false);
  }

  return (
    <section className="dayclient">
      <button
        className={`donebtn ${done ? "isdone" : ""}`}
        onClick={toggleDone}
        disabled={saving}
      >
        {saving ? "..." : done ? "✓ Ho gaya — wapas kholna hai toh click" : "Aaj ka kaam complete — ✓ Mark karo"}
      </button>

      <div className="aipanel">
        <div className="tabs mono">
          <button className={tab === "notes" ? "on" : ""} onClick={() => setTab("notes")}>
            🤖 Deep-dive Notes
          </button>
          <button className={tab === "quiz" ? "on" : ""} onClick={() => setTab("quiz")}>
            📝 Quiz {isRevisionDay ? "(aaj revision day hai!)" : ""}
          </button>
          <button className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}>
            🥋 Ustaad se pucho
          </button>
        </div>

        {tab !== "chat" && (
          <div className="aibody">
            <button className="btn" onClick={() => getAi(tab)} disabled={aiLoading}>
              {aiLoading
                ? "Gemini soch raha hai..."
                : tab === "quiz"
                ? `Week ${week} ka quiz banao`
                : "Aaj ke topic ke full notes banao (Gemini)"}
            </button>
            {aiText && (
              <div className="aiout" dangerouslySetInnerHTML={{ __html: mdToHtml(aiText) }} />
            )}
          </div>
        )}

        {tab === "chat" && (
          <div className="aibody">
            <div className="chatbox">
              {chat.length === 0 && (
                <p className="muted">
                  Doubt pucho, motivation maango, ya bahana banao (roast milega 😏)
                </p>
              )}
              {chat.map((m, idx) => (
                <div key={idx} className={`msg ${m.role}`}>
                  {m.role === "model" ? (
                    <div dangerouslySetInnerHTML={{ __html: mdToHtml(m.text) }} />
                  ) : (
                    m.text
                  )}
                </div>
              ))}
              {aiLoading && <div className="msg model muted">Ustaad type kar raha hai...</div>}
            </div>
            <form className="chatform" onSubmit={sendChat}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ustaad se kuch bhi pucho..."
              />
              <button className="btn" disabled={aiLoading || !input.trim()}>
                →
              </button>
            </form>
          </div>
        )}

        {err && <p className="err">⚠ {err}</p>}
      </div>
    </section>
  );
}
