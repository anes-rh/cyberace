"use client";

import { useState } from "react";
import { Send, Zap, Inbox, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Msg { id: number; from: 0 | 1; to: 0 | 1; ts: number; }

export function LamportSim() {
  const [clocks, setClocks] = useState<[number, number]>([0, 0]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [nextId, setNextId] = useState(1);

  const P = ["P1", "P2"] as const;
  const addLog = (s: string) => setLog((l) => [s, ...l].slice(0, 8));

  const local = (p: 0 | 1) => {
    setClocks((c) => {
      const nc: [number, number] = [...c] as [number, number];
      nc[p] += 1;
      addLog(`${P[p]} · événement local → C=${nc[p]}`);
      return nc;
    });
  };

  const send = (from: 0 | 1) => {
    const to: 0 | 1 = from === 0 ? 1 : 0;
    setClocks((c) => {
      const nc: [number, number] = [...c] as [number, number];
      nc[from] += 1;
      setMsgs((m) => [...m, { id: nextId, from, to, ts: nc[from] }]);
      addLog(`${P[from]} · envoi m (ts=${nc[from]}) → ${P[to]}`);
      return nc;
    });
    setNextId((n) => n + 1);
  };

  const receive = (msg: Msg) => {
    setClocks((c) => {
      const nc: [number, number] = [...c] as [number, number];
      nc[msg.to] = Math.max(nc[msg.to], msg.ts) + 1;
      addLog(`${P[msg.to]} · réception m (ts=${msg.ts}) → C=max(${c[msg.to]},${msg.ts})+1=${nc[msg.to]}`);
      return nc;
    });
    setMsgs((m) => m.filter((x) => x.id !== msg.id));
  };

  const reset = () => {
    setClocks([0, 0]);
    setMsgs([]);
    setLog([]);
    setNextId(1);
  };

  return (
    <div className="rounded-xl border border-line bg-void/50 p-4">
      <div className="grid grid-cols-2 gap-3">
        {([0, 1] as const).map((p) => (
          <div key={p} className="rounded-lg border border-line bg-surface/60 p-3 text-center">
            <div className="font-mono text-xs text-muted">{P[p]}</div>
            <div className="my-1 font-display text-3xl font-bold text-primary tnum">{clocks[p]}</div>
            <div className="flex flex-col gap-1.5">
              <Button size="sm" variant="glass" onClick={() => local(p)}>
                <Zap className="h-3.5 w-3.5" /> Local
              </Button>
              <Button size="sm" variant="glass" onClick={() => send(p)}>
                <Send className="h-3.5 w-3.5" /> Envoyer
              </Button>
            </div>
            {/* Inbox for this process */}
            <div className="mt-2 space-y-1">
              {msgs.filter((m) => m.to === p).map((m) => (
                <button
                  key={m.id}
                  onClick={() => receive(m)}
                  className="flex w-full items-center justify-center gap-1 rounded-md border border-magenta/40 bg-magenta/10 px-2 py-1 text-xs text-magenta hover:bg-magenta/20"
                >
                  <Inbox className="h-3 w-3" /> Recevoir (ts={m.ts})
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-xs text-faint">Journal causal</span>
        <button onClick={reset} className="inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
          <RotateCcw className="h-3 w-3" /> Réinitialiser
        </button>
      </div>
      <div className="mt-1 space-y-1 font-mono text-xs text-muted">
        {log.length === 0 ? (
          <p className="text-faint">Clique sur les actions pour simuler les horloges de Lamport.</p>
        ) : (
          log.map((l, i) => <p key={i} className={i === 0 ? "text-primary" : ""}>{l}</p>)
        )}
      </div>
    </div>
  );
}
