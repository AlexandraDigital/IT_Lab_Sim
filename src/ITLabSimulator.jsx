import { useState, useRef, useEffect } from "react";

// PWA Install Event - handled as a regular Event object
const CERTS = [
  { id: "aplus", label: "A+", color: "#00ff88", desc: "Hardware, OS, Troubleshooting" },
  { id: "netplus", label: "Network+", color: "#00cfff", desc: "Networking, Protocols, Infrastructure" },
  { id: "secplus", label: "Security+", color: "#ff4f8b", desc: "Threats, Cryptography, Risk Management" },
  { id: "linuxplus", label: "Linux+", color: "#ffcc00", desc: "Linux Admin, Shell, Filesystems" },
  { id: "cysa", label: "CySA+", color: "#ff7f3f", desc: "Threat Detection, SOC, Analytics" },
];

const SYSTEM_PROMPT = (cert) => `You are an advanced IT Lab Simulator AI for CompTIA ${cert} exam preparation.

Your role:
- Simulate a realistic IT lab environment (terminal, network configs, system logs, etc.)
- Respond to commands as if you are an actual OS/network device/system
- Ask the user to perform tasks relevant to ${cert} exam objectives
- Give hints when asked, score responses, and provide feedback
- Use realistic output formatting (command prompts, log entries, config files, etc.)
- Keep track of the current lab scenario and guide the user

Lab Modes you support:
1. SCENARIO: Generate a realistic troubleshooting or configuration scenario
2. TERMINAL: Respond to typed commands as a simulated system
3. QUIZ: Ask exam-style multiple choice or practical questions
4. HINT: Give a helpful hint for the current task
5. EXPLAIN: Explain a concept in depth

Always start responses with a clear context (e.g., what system is running, what the task is).
Format outputs like a real terminal: use monospace-style text, realistic prompts, proper spacing.
Be educational but realistic. Never break character unless asked to explain something.`;

const GROQ_MODELS = [
  { id: "meta-llama/llama-4-scout-17b-16e-instruct", label: "Llama 4 Scout 17B", tag: "🆕 Newest" },
  { id: "meta-llama/llama-4-maverick-17b-128e-instruct-fp8", label: "Llama 4 Maverick", tag: "⚡ Advanced" },
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", tag: "🏆 Best Quality" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B", tag: "🚀 Super Fast" },
  { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B", tag: "🔀 Versatile" },
];

const QUICK_ACTIONS = [
  { label: "📋 New Scenario", prompt: "Generate a new lab scenario for me to practice. Set the scene, give me a problem to solve, and tell me what commands/tools to use." },
  { label: "❓ Quiz Me", prompt: "Give me a challenging exam-style question relevant to my current cert." },
  { label: "💡 Give Hint", prompt: "Give me a hint for the current task without revealing the full answer." },
  { label: "📖 Explain Topic", prompt: "Explain the most important concept from our current scenario in depth, as if teaching a student." },
  { label: "✅ Check Answer", prompt: "Evaluate my last response/command. Was it correct? What should I have done differently?" },
  { label: "🔄 Next Lab", prompt: "Move to the next lab exercise. Make it slightly harder than the previous one." },
];

export default function ITLabSimulator() {
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedModel, setSelectedModel] = useState(GROQ_MODELS[0].id);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [phase, setPhase] = useState("setup");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // PWA Installation Setup
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => console.log("Service Worker registered"))
        .catch((err) => console.log("Service Worker registration failed:", err));
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (phase === "lab" && inputRef.current) inputRef.current.focus();
  }, [phase]);

  const callGroq = async (msgs) => {
    const response = await fetch("/api/groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 1024,
        messages: [
          { role: "system", content: SYSTEM_PROMPT(selectedCert.label) },
          ...msgs,
        ],
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || "API error — check Cloudflare env vars.");
    }
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const startLab = async () => {
    if (!selectedCert) { setError("Select a CompTIA certification."); return; }
    setError("");
    setPhase("lab");
    setLoading(true);
    const welcomeMsg = {
      role: "user",
      content: `Start my ${selectedCert.label} lab session. Introduce the environment, give me my first scenario/task, and tell me what to do.`,
    };
    try {
      const reply = await callGroq([welcomeMsg]);
      setMessages([welcomeMsg, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e.message);
      setPhase("setup");
    }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    if (text.toLowerCase().includes("check answer") || text.toLowerCase().includes("evaluate")) {
      setSessionScore(s => ({ ...s, total: s.total + 1 }));
    }
    try {
      const reply = await callGroq(newMsgs);
      setMessages([...newMsgs, { role: "assistant", content: reply }]);
      if (/correct|well done|exactly right|great job|perfect/i.test(reply)) {
        setSessionScore(s => ({ ...s, correct: s.correct + 1 }));
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  // ── Save Session ──────────────────────────────────────────────────────────
  const saveSession = () => {
    if (messages.length === 0) return;

    const divider = "─".repeat(60);
    const header = [
      "IT Lab Simulator — Session Transcript",
      `Certification : CompTIA ${selectedCert?.label}`,
      `Model         : ${GROQ_MODELS.find(m => m.id === selectedModel)?.label}`,
      `Score         : ${sessionScore.correct} / ${sessionScore.total}`,
      `Saved         : ${new Date().toLocaleString()}`,
      divider,
      "",
    ].join("\n");

    const body = messages.map(msg =>
      msg.role === "user"
        ? `student@labsim:~$ ${msg.content}`
        : `[LAB-AI]\n${msg.content}`
    ).join("\n\n");

    const blob = new Blob([header + body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `labsim-${selectedCert?.id}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    // Brief visual feedback
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  const resetLab = () => {
    setPhase("setup"); setMessages([]); setSessionScore({ correct: 0, total: 0 });
    setSelectedCert(null); setError("");
  };

  if (phase === "setup") {
    return (
      <div style={s.root}>
        <div style={s.scanlines} />
        <div style={s.setupContainer}>
          <div style={s.installBanner}>
            {installPrompt && !isInstalled && (
              <button style={s.installBtn} onClick={handleInstallClick}>
                📱 Install App for Offline Access
              </button>
            )}
            {isInstalled && (
              <div style={s.installedMsg}>✅ App installed! Works offline</div>
            )}
          </div>

          <div style={s.logo}>
            <span style={s.logoIcon}>⬡</span>
            <div>
              <div style={s.logoTitle}>IT LAB<span style={s.logoAccent}>SIM</span></div>
              <div style={s.logoSub}>CompTIA Exam Preparation Environment</div>
            </div>
          </div>

          <div style={s.setupCard}>
            <div style={s.secureBadge}>
              🔒 Powered by Groq — API key secured via Cloudflare Pages env vars, never exposed to the browser
            </div>

            <div style={s.cardSection}>
              <label style={s.label}>SELECT MODEL</label>
              <div style={s.modelGrid}>
                {GROQ_MODELS.map(m => (
                  <button
                    key={m.id}
                    style={{ ...s.modelBtn, ...(selectedModel === m.id ? s.modelBtnActive : {}) }}
                    onClick={() => setSelectedModel(m.id)}
                  >
                    <div style={s.modelName}>{m.label}</div>
                    <div style={{ ...s.modelTag, color: selectedModel === m.id ? "#00ff88" : "#2a6a3a" }}>{m.tag}</div>
                  </button>
                ))}
              </div>
              <div style={s.hint}>💡 Hit a rate limit? Switch to another model.</div>
            </div>

            <div style={s.cardSection}>
              <label style={s.label}>SELECT CERTIFICATION</label>
              <div style={s.certGrid}>
                {CERTS.map(c => (
                  <button
                    key={c.id}
                    style={{
                      ...s.certBtn,
                      borderColor: selectedCert?.id === c.id ? c.color : "#2a2a3a",
                      boxShadow: selectedCert?.id === c.id ? `0 0 16px ${c.color}55` : "none",
                    }}
                    onClick={() => setSelectedCert(c)}
                  >
                    <div style={{ ...s.certLabel, color: c.color }}>{c.label}</div>
                    <div style={s.certDesc}>{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={s.errorBox}>⚠ {error}</div>}

            <button
              style={{ ...s.launchBtn, opacity: selectedCert ? 1 : 0.4, cursor: selectedCert ? "pointer" : "not-allowed" }}
              onClick={startLab}
              disabled={!selectedCert}
            >
              LAUNCH LAB SESSION ▶
            </button>
          </div>
        </div>
        <style>{globalCSS}</style>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={s.scanlines} />

      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ ...s.certBadge, color: selectedCert.color, borderColor: selectedCert.color }}>
            CompTIA {selectedCert.label}
          </span>
          <span style={s.headerModel}>{GROQ_MODELS.find(m => m.id === selectedModel)?.label}</span>
        </div>
        <div style={s.headerRight}>
          <div style={s.scoreBox}>Score: <span style={{ color: "#00ff88" }}>{sessionScore.correct}</span>/{sessionScore.total}</div>
          {installPrompt && !isInstalled && (
            <button style={s.headerInstallBtn} onClick={handleInstallClick}>📱 Install</button>
          )}
          {/* ── Save Button ── */}
          <button
            style={{
              ...s.saveBtn,
              ...(saveFlash ? s.saveBtnFlash : {}),
              opacity: messages.length === 0 ? 0.35 : 1,
              cursor: messages.length === 0 ? "not-allowed" : "pointer",
            }}
            onClick={saveSession}
            disabled={messages.length === 0}
            title="Download session transcript as .txt"
          >
            {saveFlash ? "✓ SAVED" : "💾 SAVE"}
          </button>
          <button style={s.resetBtn} onClick={resetLab}>↩ RESET</button>
        </div>
      </div>

      <div ref={terminalRef} style={s.terminal} onClick={() => inputRef.current?.focus()}>
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "user" ? (
              <div style={s.userLine}>
                <span style={s.prompt}>student@labsim:~$ </span>
                <span style={s.userText}>{msg.content}</span>
              </div>
            ) : (
              <div style={s.aiBlock}>
                <span style={s.aiPrefix}>[LAB-AI] </span>
                <pre style={s.aiPre}>{msg.content}</pre>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={s.aiBlock}>
            <span style={s.aiPrefix}>[LAB-AI] </span>
            <span style={s.blinkDots}>Processing<span style={s.blink}>...</span></span>
          </div>
        )}
      </div>

      <div style={s.quickActions}>
        {QUICK_ACTIONS.map((a, i) => (
          <button key={i} style={s.quickBtn} onClick={() => sendMessage(a.prompt)} disabled={loading}>{a.label}</button>
        ))}
      </div>

      <div style={s.inputRow}>
        <span style={s.inputPrompt}>student@labsim:~$</span>
        <textarea
          ref={inputRef}
          style={s.termInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command, question, or action... (Enter to send)"
          rows={2}
          disabled={loading}
        />
        <button style={s.sendBtn} onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>▶</button>
      </div>

      {error && (
        <div style={s.errorBanner}>
          ⚠ {error}
          <button style={s.closeErr} onClick={() => setError("")}>✕</button>
        </div>
      )}
      <style>{globalCSS}</style>
    </div>
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap');
  * { box-sizing: border-box; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:#0a0a12; }
  ::-webkit-scrollbar-thumb { background:#1e3a2a; border-radius:3px; }
`;

const s = {
  root: { position:"relative", minHeight:"100vh", background:"#08090f", fontFamily:"'JetBrains Mono',monospace", color:"#c8ffd4", overflow:"hidden", display:"flex", flexDirection:"column" },
  scanlines: { position:"fixed", top:0, left:0, right:0, bottom:0, background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,100,0.015) 2px,rgba(0,255,100,0.015) 4px)", pointerEvents:"none", zIndex:1 },
  setupContainer: { maxWidth:680, margin:"0 auto", padding:"48px 24px", zIndex:2, position:"relative", animation:"fadeIn 0.4s ease" },
  installBanner: { marginBottom:20, display:"flex", justifyContent:"center" },
  installBtn: { background:"linear-gradient(135deg,#003a2e,#00ff88 200%)", border:"1px solid #00ff88", borderRadius:4, color:"#00ff88", fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, letterSpacing:1, padding:"8px 16px", cursor:"pointer", transition:"all 0.2s" },
  installedMsg: { background:"rgba(0,255,100,0.1)", border:"1px solid #00ff88", borderRadius:4, color:"#00ff88", fontSize:12, padding:"8px 16px" },
  logo: { display:"flex", alignItems:"center", gap:16, marginBottom:40 },
  logoIcon: { fontSize:48, color:"#00ff88", lineHeight:1 },
  logoTitle: { fontFamily:"'Orbitron',sans-serif", fontSize:32, fontWeight:900, letterSpacing:4, color:"#e0ffe8" },
  logoAccent: { color:"#00ff88" },
  logoSub: { fontSize:12, color:"#44885a", letterSpacing:2, marginTop:2 },
  setupCard: { background:"rgba(0,255,100,0.03)", border:"1px solid #0e2a1a", borderRadius:8, padding:32, backdropFilter:"blur(8px)" },
  secureBadge: { background:"rgba(0,255,100,0.05)", border:"1px solid #0e3a20", borderRadius:6, color:"#2a7a44", fontSize:11, padding:"10px 14px", marginBottom:28, lineHeight:1.6 },
  cardSection: { marginBottom:28 },
  label: { display:"block", fontSize:10, letterSpacing:3, color:"#44885a", marginBottom:10 },
  hint: { fontSize:11, color:"#2a5a38", marginTop:8 },
  modelGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:8 },
  modelBtn: { background:"rgba(0,255,100,0.02)", border:"1px solid #1a3a24", borderRadius:6, color:"#44885a", fontFamily:"'JetBrains Mono',monospace", padding:"10px 12px", cursor:"pointer", textAlign:"left", transition:"all 0.2s" },
  modelBtnActive: { background:"rgba(0,255,100,0.08)", borderColor:"#00ff88", color:"#00ff88", boxShadow:"0 0 12px rgba(0,255,100,0.15)" },
  modelName: { fontSize:12, fontWeight:700, marginBottom:3 },
  modelTag: { fontSize:10, letterSpacing:0.5 },
  certGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:10 },
  certBtn: { background:"rgba(0,255,100,0.02)", border:"1px solid #1a3a24", borderRadius:6, padding:"14px 16px", cursor:"pointer", textAlign:"left", transition:"all 0.2s" },
  certLabel: { fontFamily:"'Orbitron',sans-serif", fontSize:15, fontWeight:700, marginBottom:4 },
  certDesc: { fontSize:10, color:"#3a6a48" },
  errorBox: { background:"rgba(255,50,50,0.08)", border:"1px solid #5a1a1a", borderRadius:4, color:"#ff6666", fontSize:12, padding:"10px 14px", marginBottom:16 },
  launchBtn: { width:"100%", background:"linear-gradient(135deg,#003a1e,#00ff88 200%)", border:"1px solid #00ff88", borderRadius:4, color:"#00ff88", fontFamily:"'Orbitron',sans-serif", fontSize:13, fontWeight:700, letterSpacing:2, padding:"14px 0", cursor:"pointer", transition:"all 0.2s" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 20px", borderBottom:"1px solid #0e2a1a", background:"rgba(0,0,0,0.6)", zIndex:2, position:"relative", flexShrink:0 },
  headerLeft: { display:"flex", alignItems:"center", gap:14 },
  certBadge: { border:"1px solid", borderRadius:3, padding:"2px 10px", fontFamily:"'Orbitron',sans-serif", fontSize:11, fontWeight:700, letterSpacing:2 },
  headerModel: { fontSize:10, color:"#2a5a38", letterSpacing:1 },
  headerRight: { display:"flex", alignItems:"center", gap:10 },
  scoreBox: { fontSize:12, color:"#2a6a38" },
  headerInstallBtn: { background:"rgba(0,255,100,0.08)", border:"1px solid #00ff88", borderRadius:3, color:"#00ff88", fontFamily:"'JetBrains Mono',monospace", fontSize:10, padding:"3px 8px", cursor:"pointer", transition:"all 0.15s" },
  saveBtn: { background:"rgba(0,200,255,0.06)", border:"1px solid #0a4a5a", borderRadius:3, color:"#00cfff", fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, letterSpacing:1, padding:"4px 10px", cursor:"pointer", transition:"all 0.2s" },
  saveBtnFlash: { background:"rgba(0,255,136,0.12)", borderColor:"#00ff88", color:"#00ff88", boxShadow:"0 0 10px rgba(0,255,136,0.25)" },
  resetBtn: { background:"transparent", border:"1px solid #1a3a24", borderRadius:3, color:"#44885a", fontFamily:"'JetBrains Mono',monospace", fontSize:11, padding:"4px 10px", cursor:"pointer" },
  terminal: { flex:1, overflowY:"auto", padding:"20px 24px", zIndex:2, position:"relative", background:"linear-gradient(180deg,#08090f 0%,#090c0f 100%)", minHeight:0 },
  userLine: { display:"flex", alignItems:"flex-start", marginBottom:4 },
  prompt: { color:"#00ff88", fontWeight:700, whiteSpace:"nowrap", flexShrink:0 },
  userText: { color:"#a8e8b8", wordBreak:"break-all" },
  aiBlock: { margin:"12px 0 20px 0", paddingLeft:16, borderLeft:"2px solid #0e3a1e", animation:"fadeIn 0.3s ease" },
  aiPrefix: { color:"#00ff88", fontSize:11, fontWeight:700, display:"block", marginBottom:6 },
  aiPre: { margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word", color:"#b0e8c0", fontSize:13, lineHeight:1.7, fontFamily:"'JetBrains Mono',monospace" },
  blinkDots: { color:"#44885a", fontSize:13 },
  blink: { animation:"blink 1s infinite" },
  quickActions: { display:"flex", flexWrap:"wrap", gap:6, padding:"10px 20px", borderTop:"1px solid #0e2a1a", background:"rgba(0,0,0,0.5)", zIndex:2, position:"relative", flexShrink:0 },
  quickBtn: { background:"rgba(0,255,100,0.04)", border:"1px solid #0e3a20", borderRadius:4, color:"#44985a", fontFamily:"'JetBrains Mono',monospace", fontSize:11, padding:"5px 12px", cursor:"pointer", transition:"all 0.15s" },
  inputRow: { display:"flex", alignItems:"flex-end", gap:10, padding:"12px 20px", borderTop:"1px solid #0e2a1a", background:"rgba(0,0,0,0.7)", zIndex:2, position:"relative", flexShrink:0 },
  inputPrompt: { color:"#00ff88", fontSize:13, fontWeight:700, whiteSpace:"nowrap", paddingBottom:6 },
  termInput: { flex:1, background:"rgba(0,255,100,0.04)", border:"1px solid #0e3a20", borderRadius:4, color:"#a8e8b8", fontFamily:"'JetBrains Mono',monospace", fontSize:13, padding:"8px 12px", resize:"none", outline:"none", lineHeight:1.5 },
  sendBtn: { background:"rgba(0,255,100,0.1)", border:"1px solid #00ff88", borderRadius:4, color:"#00ff88", fontFamily:"'Orbitron',sans-serif", fontSize:14, padding:"6px 16px", cursor:"pointer", alignSelf:"flex-end", paddingBottom:8 },
  errorBanner: { position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", background:"rgba(80,10,10,0.95)", border:"1px solid #5a1a1a", borderRadius:4, color:"#ff8888", fontSize:12, padding:"8px 16px", zIndex:10, display:"flex", alignItems:"center", gap:12 },
  closeErr: { background:"transparent", border:"none", color:"#ff8888", cursor:"pointer", fontSize:14 },
};
