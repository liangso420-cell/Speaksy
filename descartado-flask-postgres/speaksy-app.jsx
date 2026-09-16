import React, { useState, useEffect, useRef } from "react";
import {
  Wind, BookOpen, MessageCircle, Mic, TrendingUp, Award, Flame,
  Play, Pause, Square, Check, ChevronRight, Home, User, Settings,
  Menu, X, Info
} from "lucide-react";

/* ---------------------------------------------------------
   SPEAKSY — prototipo de interfaz
   Paleta: tinta #16302B, lienzo #F5F8F6, teal profundo #1F5C52,
   menta suave #DCECE6, ámbar cálido #E3A34E (solo racha/CTA)
   Tipografía: Fraunces (display) + Inter (cuerpo) + IBM Plex Mono (datos)
--------------------------------------------------------- */

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap";

function useFonts() {
  useEffect(() => {
    if (!document.querySelector('link[data-speaksy-fonts]')) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = FONT_LINK;
      l.setAttribute("data-speaksy-fonts", "1");
      document.head.appendChild(l);
    }
  }, []);
}

const colors = {
  ink: "#16302B",
  inkSoft: "#4B615C",
  canvas: "#F5F8F6",
  card: "#FFFFFF",
  teal: "#1F5C52",
  tealDark: "#123832",
  mint: "#DCECE6",
  mintSoft: "#EDF5F2",
  amber: "#E3A34E",
  amberSoft: "#FBEAD2",
  border: "#DCE6E2",
};

const NAV = [
  { id: "dashboard", label: "Inicio", icon: Home },
  { id: "practice", label: "Practicar", icon: Play },
  { id: "progress", label: "Progreso", icon: TrendingUp },
  { id: "achievements", label: "Logros", icon: Award },
  { id: "profile", label: "Perfil", icon: User },
];

/* ---------- Reusable bits ---------- */

function Card({ children, style, ...rest }) {
  return (
    <div
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 20,
        padding: 24,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone = "mint" }) {
  const tones = {
    mint: { bg: colors.mintSoft, fg: colors.teal },
    amber: { bg: colors.amberSoft, fg: "#8A5A16" },
  };
  const t = tones[tone];
  return (
    <span style={{
      background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600,
      padding: "4px 10px", borderRadius: 999, fontFamily: "Inter, sans-serif",
      letterSpacing: 0.2,
    }}>
      {children}
    </span>
  );
}

function DisclaimerNote({ children }) {
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      background: colors.mintSoft, border: `1px solid ${colors.border}`,
      borderRadius: 14, padding: "12px 14px", fontSize: 13.5,
      color: colors.inkSoft, fontFamily: "Inter, sans-serif", lineHeight: 1.5,
    }}>
      <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: colors.teal }} />
      <span>{children}</span>
    </div>
  );
}

function PrimaryButton({ children, onClick, style, ...rest }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: colors.teal, color: "#fff", border: "none",
        borderRadius: 999, padding: "13px 26px", fontSize: 15,
        fontWeight: 600, fontFamily: "Inter, sans-serif", cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 8,
        transition: "transform .15s ease, background .15s ease",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = colors.tealDark)}
      onMouseLeave={(e) => (e.currentTarget.style.background = colors.teal)}
      {...rest}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent", color: colors.teal,
        border: `1.5px solid ${colors.teal}`, borderRadius: 999,
        padding: "12px 24px", fontSize: 15, fontWeight: 600,
        fontFamily: "Inter, sans-serif", cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ---------- Breathing ring (signature visual) ---------- */

function BreathingRing({ size = 220 }) {
  const phases = [
    { key: "inhale", label: "INHALA", seconds: 4, scale: 1 },
    { key: "hold", label: "MANTÉN", seconds: 2, scale: 1 },
    { key: "exhale", label: "EXHALA", seconds: 6, scale: 0.62 },
  ];
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(phases[0].seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setPhaseIdx((p) => (p + 1) % phases.length);
          return phases[(phaseIdx + 1) % phases.length].seconds;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIdx]);

  const phase = phases[phaseIdx];
  const targetScale = phase.key === "exhale" ? 0.62 : phase.key === "hold" ? 1 : 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.mint} 0%, ${colors.mintSoft} 70%)`,
          transform: `scale(${running ? targetScale : 0.8})`,
          transition: `transform ${phase.seconds}s ease-in-out`,
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `2px solid ${colors.teal}30`,
        }} />
        <div style={{ position: "relative", textAlign: "center", fontFamily: "Inter, sans-serif" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: colors.teal }}>
            {running ? phase.label : "LISTO"}
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 40, fontWeight: 600,
            color: colors.ink, marginTop: 4,
          }}>
            {running ? count : "—"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {!running ? (
          <PrimaryButton onClick={() => { setRunning(true); setPhaseIdx(0); setCount(phases[0].seconds); }}>
            <Play size={16} /> Iniciar
          </PrimaryButton>
        ) : (
          <GhostButton onClick={() => setRunning(false)}>
            <Pause size={16} /> Pausar
          </GhostButton>
        )}
        <GhostButton onClick={() => { setRunning(false); setPhaseIdx(0); setCount(phases[0].seconds); }}>
          <Square size={16} /> Terminar
        </GhostButton>
      </div>
    </div>
  );
}

/* ---------- Pages ---------- */

function TopBar({ page, setPage, mobileOpen, setMobileOpen }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 28px", borderBottom: `1px solid ${colors.border}`,
      background: colors.card, position: "sticky", top: 0, zIndex: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
           onClick={() => setPage("landing")}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: colors.teal,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Wind size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 600, color: colors.ink }}>
          Speaksy
        </span>
      </div>
      <div className="speaksy-desktop-nav" style={{ display: "flex", gap: 6 }}>
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setPage(n.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: page === n.id ? colors.mintSoft : "transparent",
              color: page === n.id ? colors.teal : colors.inkSoft,
              border: "none", borderRadius: 999, padding: "9px 16px",
              fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
            <n.icon size={15} /> {n.label}
          </button>
        ))}
      </div>
      <button className="speaksy-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}
        style={{ background: "none", border: "none", display: "none" }}>
        {mobileOpen ? <X /> : <Menu />}
      </button>
    </div>
  );
}

function BottomNav({ page, setPage }) {
  return (
    <div className="speaksy-bottom-nav" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, background: colors.card,
      borderTop: `1px solid ${colors.border}`, display: "none",
      justifyContent: "space-around", padding: "8px 4px 10px", zIndex: 30,
    }}>
      {NAV.map((n) => (
        <button key={n.id} onClick={() => setPage(n.id)} style={{
          background: "none", border: "none", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3, color: page === n.id ? colors.teal : "#9AAAA5",
          fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, padding: 6,
        }}>
          <n.icon size={20} />
          {n.label}
        </button>
      ))}
    </div>
  );
}

function Landing({ setPage }) {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 24px 40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 56, alignItems: "center" }}
           className="speaksy-hero-grid">
        <div>
          <Pill>Espacio de práctica, no un diagnóstico</Pill>
          <h1 style={{
            fontFamily: "Fraunces, serif", fontSize: "clamp(36px, 5vw, 54px)",
            lineHeight: 1.08, color: colors.ink, margin: "18px 0 16px", fontWeight: 600,
          }}>
            Practica tu voz.<br />Encuentra tu confianza.
          </h1>
          <p style={{
            fontFamily: "Inter, sans-serif", fontSize: 17, lineHeight: 1.6,
            color: colors.inkSoft, maxWidth: 460, margin: "0 0 28px",
          }}>
            Un espacio de práctica diseñado para ayudarte a trabajar aspectos de tu
            comunicación mediante ejercicios guiados y seguimiento de tu progreso.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <PrimaryButton onClick={() => setPage("dashboard")}>
              Comenzar a practicar <ChevronRight size={16} />
            </PrimaryButton>
            <GhostButton onClick={() => setPage("how")}>Conocer Speaksy</GhostButton>
          </div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: "#8A9B96", marginTop: 22, maxWidth: 440 }}>
            Speaksy es una herramienta de apoyo y práctica. No sustituye la evaluación
            ni el tratamiento de un profesional del habla y el lenguaje.
          </p>
        </div>
        <Card style={{ display: "flex", justifyContent: "center", padding: 36 }}>
          <BreathingRing size={200} />
        </Card>
      </div>

      <div style={{ marginTop: 96 }}>
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: colors.ink, marginBottom: 28 }}>
          ¿Cómo funciona?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="speaksy-how-grid">
          {[
            ["Conoce tus objetivos", "Selecciona qué aspecto quieres practicar."],
            ["Realiza ejercicios", "Completa actividades adaptadas a tus necesidades."],
            ["Practica a tu ritmo", "Repite los ejercicios cuando quieras."],
            ["Observa tu progreso", "Visualiza tus sesiones y evolución."],
          ].map(([t, d], i) => (
            <Card key={t}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: colors.teal,
                marginBottom: 10, fontWeight: 600,
              }}>0{i + 1}</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: colors.ink, marginBottom: 6 }}>{t}</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: colors.inkSoft, lineHeight: 1.5 }}>{d}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 14, padding: 18 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, background: tone || colors.mintSoft,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={19} color={colors.teal} />
      </div>
      <div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: colors.ink }}>
          {value}
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: colors.inkSoft }}>{label}</div>
      </div>
    </Card>
  );
}

function Dashboard({ setPage }) {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 24px 80px" }}>
      <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 30, color: colors.ink, marginBottom: 2 }}>
        Hola, Camila.
      </h1>
      <p style={{ fontFamily: "Inter, sans-serif", color: colors.inkSoft, marginBottom: 28 }}>
        ¿Lista para practicar?
      </p>

      <Card style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: colors.teal, border: "none", marginBottom: 24, flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <Pill tone="amber">Sesión recomendada</Pill>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: "#fff", margin: "10px 0 4px" }}>
            Práctica de ritmo
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: "#CFE3DE" }}>10 minutos</div>
        </div>
        <PrimaryButton style={{ background: "#fff", color: colors.teal }} onClick={() => setPage("practice")}>
          Comenzar <ChevronRight size={16} />
        </PrimaryButton>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}
           className="speaksy-stat-grid">
        <StatCard icon={Play} label="Sesiones realizadas" value="18" />
        <StatCard icon={TrendingUp} label="Minutos practicados" value="142" />
        <StatCard icon={Check} label="Ejercicios completados" value="47" />
        <StatCard icon={Flame} label="Días de práctica" value="5" tone={colors.amberSoft} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="speaksy-two-col">
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Flame size={20} color={colors.amber} />
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: colors.ink }}>
              5 días practicando
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <div key={i} style={{
                flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 10,
                background: i < 5 ? colors.mintSoft : colors.canvas,
                fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
                color: i < 5 ? colors.teal : "#B7C4BF",
              }}>{d}</div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: colors.ink, marginBottom: 12 }}>
            Actividad reciente
          </div>
          {[
            ["Respiración", "Hoy · 6 min"],
            ["Lectura en voz alta", "Ayer · 10 min"],
            ["Conversación · Presentarse", "Ayer · 8 min"],
          ].map(([t, d]) => (
            <div key={t} style={{
              display: "flex", justifyContent: "space-between", padding: "9px 0",
              borderBottom: `1px solid ${colors.border}`, fontFamily: "Inter, sans-serif", fontSize: 13.5,
            }}>
              <span style={{ color: colors.ink }}>{t}</span>
              <span style={{ color: colors.inkSoft }}>{d}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

const EXERCISE_TYPES = [
  { id: "breathing", label: "Respiración", icon: Wind },
  { id: "rhythm", label: "Ritmo", icon: TrendingUp },
  { id: "reading", label: "Lectura", icon: BookOpen },
  { id: "pronunciation", label: "Pronunciación", icon: Mic },
  { id: "conversation", label: "Conversación", icon: MessageCircle },
  { id: "confidence", label: "Confianza al hablar", icon: Award },
];

function Practice({ setPage, setActiveExercise }) {
  const [selected, setSelected] = useState(["breathing", "reading"]);
  const [duration, setDuration] = useState(15);

  const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const routine = selected.map((id) => ({
    id,
    label: EXERCISE_TYPES.find((e) => e.id === id)?.label,
    minutes: Math.max(2, Math.round(duration / Math.max(selected.length, 1))),
  }));

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 80px" }}>
      <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: colors.ink, marginBottom: 6 }}>Mi práctica</h1>
      <p style={{ fontFamily: "Inter, sans-serif", color: colors.inkSoft, marginBottom: 26 }}>
        Elige qué quieres trabajar hoy y arma tu rutina.
      </p>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: colors.ink, marginBottom: 14 }}>
          ¿Qué quieres practicar?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }} className="speaksy-exercise-grid">
          {EXERCISE_TYPES.map((e) => {
            const active = selected.includes(e.id);
            return (
              <button key={e.id} onClick={() => toggle(e.id)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                padding: "16px 8px", borderRadius: 14, cursor: "pointer",
                border: `1.5px solid ${active ? colors.teal : colors.border}`,
                background: active ? colors.mintSoft : "#fff",
                fontFamily: "Inter, sans-serif",
              }}>
                <e.icon size={20} color={active ? colors.teal : colors.inkSoft} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? colors.teal : colors.inkSoft, textAlign: "center" }}>
                  {e.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: colors.ink, marginBottom: 14 }}>
          Duración
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[5, 10, 15, 20, 30].map((m) => (
            <button key={m} onClick={() => setDuration(m)} style={{
              padding: "9px 18px", borderRadius: 999, cursor: "pointer",
              border: `1.5px solid ${duration === m ? colors.teal : colors.border}`,
              background: duration === m ? colors.teal : "#fff",
              color: duration === m ? "#fff" : colors.ink,
              fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5,
            }}>{m} min</button>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: colors.ink, marginBottom: 14 }}>
          Rutina de {duration} minutos
        </div>
        {routine.length === 0 && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: colors.inkSoft }}>
            Elige al menos un aspecto para practicar.
          </p>
        )}
        {routine.map((r, i) => (
          <div key={r.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 0", borderBottom: i < routine.length - 1 ? `1px solid ${colors.border}` : "none",
            fontFamily: "Inter, sans-serif",
          }}>
            <span style={{ fontSize: 14, color: colors.ink }}>{i + 1}. {r.label}</span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: colors.teal,
            }}>{r.minutes} min</span>
          </div>
        ))}
        {routine.length > 0 && (
          <PrimaryButton style={{ marginTop: 18, width: "100%", justifyContent: "center" }}
            onClick={() => { setActiveExercise(routine[0].id); setPage(routine[0].id === "breathing" ? "breathing" : "reading"); }}>
            Comenzar rutina <ChevronRight size={16} />
          </PrimaryButton>
        )}
      </Card>
    </div>
  );
}

function BreathingPage({ setPage }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px 100px", textAlign: "center" }}>
      <button onClick={() => setPage("practice")} style={{
        background: "none", border: "none", color: colors.inkSoft, fontFamily: "Inter, sans-serif",
        fontSize: 13.5, cursor: "pointer", marginBottom: 20,
      }}>← Volver</button>
      <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 26, color: colors.ink, marginBottom: 6 }}>
        Ejercicio de respiración
      </h1>
      <p style={{ fontFamily: "Inter, sans-serif", color: colors.inkSoft, marginBottom: 36, fontSize: 14 }}>
        Sigue el ritmo del círculo. Inhala 4s · mantén 2s · exhala 6s.
      </p>
      <Card style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <BreathingRing size={230} />
      </Card>
    </div>
  );
}

function ReadingPage({ setPage }) {
  const [status, setStatus] = useState("idle"); // idle | recording | done
  const [seconds, setSeconds] = useState(0);
  const text = "Esta mañana salí a caminar por el parque. El clima estaba tranquilo y había muchas personas disfrutando del día.";

  useEffect(() => {
    if (status !== "recording") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "48px 24px 100px" }}>
      <button onClick={() => setPage("practice")} style={{
        background: "none", border: "none", color: colors.inkSoft, fontFamily: "Inter, sans-serif",
        fontSize: 13.5, cursor: "pointer", marginBottom: 20,
      }}>← Volver</button>
      <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 26, color: colors.ink, marginBottom: 20 }}>
        Lectura en voz alta
      </h1>

      <Card style={{ marginBottom: 20 }}>
        <p style={{
          fontFamily: "Fraunces, serif", fontSize: 22, lineHeight: 1.6, color: colors.ink,
        }}>{text}</p>
      </Card>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
        {status !== "recording" ? (
          <PrimaryButton onClick={() => { setStatus("recording"); setSeconds(0); }}>
            <Mic size={16} /> Comenzar grabación
          </PrimaryButton>
        ) : (
          <>
            <GhostButton onClick={() => setStatus("done")}><Square size={16} /> Terminar</GhostButton>
          </>
        )}
      </div>

      {status === "recording" && (
        <div style={{ textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: colors.teal, marginBottom: 16 }}>
          Grabando… {seconds}s
        </div>
      )}

      {status === "done" && (
        <Card>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: colors.ink, marginBottom: 12 }}>
            Resultado de la sesión
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <StatCard icon={Mic} label="Duración" value={`${seconds}s`} />
            <StatCard icon={BookOpen} label="Palabras leídas" value="~22" />
          </div>
          <DisclaimerNote>
            Esta es una vista previa de la interfaz: la duración se mide en el
            dispositivo, pero la velocidad, pausas y repeticiones todavía no vienen
            de un análisis de voz real conectado. Estos datos nunca representan un
            diagnóstico clínico.
          </DisclaimerNote>
        </Card>
      )}
    </div>
  );
}

function ProgressPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 100px" }}>
      <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: colors.ink, marginBottom: 4 }}>Tu progreso</h1>
      <p style={{ fontFamily: "Inter, sans-serif", color: colors.inkSoft, marginBottom: 26 }}>
        Constancia y práctica — no una medida de gravedad.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }} className="speaksy-stat-grid">
        <StatCard icon={Play} label="Sesiones" value="18" />
        <StatCard icon={TrendingUp} label="Minutos totales" value="142" />
        <StatCard icon={Flame} label="Días de práctica" value="9" tone={colors.amberSoft} />
        <StatCard icon={Check} label="Ejercicios" value="47" />
      </div>
      <Card>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: colors.ink, marginBottom: 14 }}>
          Práctica semanal
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
          {[8, 14, 6, 20, 10, 4, 12].map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: "100%", height: `${v * 4}px`, background: colors.mint, borderRadius: 6,
              }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: colors.inkSoft }}>
                {["L", "M", "X", "J", "V", "S", "D"][i]}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AchievementsPage() {
  const items = [
    ["🌱", "Primera sesión", true], ["🔥", "3 días practicando", true],
    ["⭐", "7 días practicando", false], ["🎯", "10 sesiones", true],
    ["🏆", "30 sesiones", false], ["📚", "100 ejercicios", false],
  ];
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 24px 100px" }}>
      <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: colors.ink, marginBottom: 24 }}>Logros</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }} className="speaksy-exercise-grid">
        {items.map(([icon, label, unlocked]) => (
          <Card key={label} style={{ textAlign: "center", opacity: unlocked ? 1 : 0.45 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5, color: colors.ink }}>{label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 100px" }}>
      <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: colors.ink, marginBottom: 24 }}>Perfil</h1>
      <Card style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", background: colors.mintSoft,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <User size={24} color={colors.teal} />
        </div>
        <div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: colors.ink }}>Camila Rodríguez</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: colors.inkSoft }}>camila@correo.com</div>
        </div>
      </Card>
      <DisclaimerNote>
        Tus grabaciones de voz se tratan como información privada. En Configuración
        &gt; Privacidad podrás eliminar tus grabaciones o tu cuenta cuando esa
        sección esté conectada al backend.
      </DisclaimerNote>
    </div>
  );
}

/* ---------- App shell ---------- */

export default function SpeaksyApp() {
  useFonts();
  const [page, setPage] = useState("landing");
  const [, setActiveExercise] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pages = {
    landing: <Landing setPage={setPage} />,
    how: <Landing setPage={setPage} />,
    dashboard: <Dashboard setPage={setPage} />,
    practice: <Practice setPage={setPage} setActiveExercise={setActiveExercise} />,
    breathing: <BreathingPage setPage={setPage} />,
    reading: <ReadingPage setPage={setPage} />,
    progress: <ProgressPage />,
    achievements: <AchievementsPage />,
    profile: <ProfilePage />,
  };

  const showNav = page !== "landing";

  return (
    <div style={{ background: colors.canvas, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @media (max-width: 860px) {
          .speaksy-hero-grid { grid-template-columns: 1fr !important; }
          .speaksy-how-grid { grid-template-columns: repeat(2,1fr) !important; }
          .speaksy-stat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .speaksy-two-col { grid-template-columns: 1fr !important; }
          .speaksy-exercise-grid { grid-template-columns: repeat(2,1fr) !important; }
          .speaksy-desktop-nav { display: none !important; }
          .speaksy-bottom-nav { display: flex !important; }
          body { padding-bottom: 64px; }
        }
        button:focus-visible, [tabindex]:focus-visible { outline: 2px solid ${colors.teal}; outline-offset: 2px; }
      `}</style>
      {showNav && <TopBar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}
      {pages[page]}
      {showNav && <BottomNav page={page} setPage={setPage} />}
    </div>
  );
}
