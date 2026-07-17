"use client";

import {
  Crosshair,
  BrickWall,
  ShieldAlert,
  Globe,
  Database,
  FileSearch,
  Fingerprint,
  TerminalSquare,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { ProjectTopology, TopologyNodeView, NodeRole, ProjectObjectiveView } from "@/lib/projectTypes";

const ROLE_ICON: Record<NodeRole, typeof Crosshair> = {
  attacker: Crosshair,
  firewall: BrickWall,
  waf: ShieldAlert,
  target: Globe,
  database: Database,
  log: FileSearch,
  directory: Fingerprint,
};
const ROLE_LABEL: Record<NodeRole, string> = {
  attacker: "Attaquant",
  firewall: "Firewall",
  waf: "WAF",
  target: "Serveur web",
  database: "Base de données",
  log: "Journalisation",
  directory: "Contrôleur de domaine",
};

// Palette par zone (external hostile / dmz tampon / internal protégé / mgmt admin
// / corp réseau plat).
const ZONE_STYLE: Record<string, { ring: string; bg: string; text: string; label: string }> = {
  external: { ring: "#E06C5E", bg: "rgba(224,108,94,0.07)", text: "#E0937E", label: "External (hostile)" },
  dmz: { ring: "#E0A85E", bg: "rgba(224,168,94,0.07)", text: "#E0B87E", label: "DMZ (tampon)" },
  internal: { ring: "#5EB37E", bg: "rgba(94,179,126,0.07)", text: "#7EC49B", label: "Internal (protégé)" },
  mgmt: { ring: "#5E8AB3", bg: "rgba(94,138,179,0.07)", text: "#7EA6C4", label: "Mgmt (administration)" },
  corp: { ring: "#8A82A6", bg: "rgba(138,130,166,0.07)", text: "#A79EC0", label: "Corp (réseau plat)" },
};

function NodeCard({
  node,
  terminalUrl,
  onOpenTerminal,
  badge,
}: {
  node: TopologyNodeView;
  terminalUrl?: string;
  onOpenTerminal: (id: string) => void;
  badge?: { ok: boolean; text: string };
}) {
  const Icon = ROLE_ICON[node.role];
  return (
    <div className="w-44 rounded-xl border border-line bg-surface/80 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-semibold text-fg">{node.id}</p>
          <p className="truncate text-[11px] text-muted">{ROLE_LABEL[node.role]}</p>
        </div>
      </div>
      <div className="mt-2 space-y-0.5">
        {node.networks.map((n) => (
          <p key={n.name} className="font-mono text-[10px] text-faint">{n.ip}</p>
        ))}
      </div>
      {badge && (
        <p className={`mt-2 flex items-center gap-1 text-[11px] ${badge.ok ? "text-emerald-400" : "text-amber-400"}`}>
          {badge.ok ? <Check className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
          {badge.text}
        </p>
      )}
      {node.terminal && terminalUrl && (
        <button
          onClick={() => onOpenTerminal(node.id)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-line bg-surface-2 py-1 text-[11px] font-medium text-fg hover:border-primary/50 hover:text-primary"
        >
          <TerminalSquare className="h-3 w-3" /> Terminal
        </button>
      )}
    </div>
  );
}

function Link({ state }: { state: "secured" | "permissive" | "blocked" | "idle" }) {
  const map = {
    secured: { color: "#5EB37E", icon: <Check className="h-3 w-3" />, label: "durci" },
    permissive: { color: "#E0A85E", icon: <ShieldAlert className="h-3 w-3" />, label: "permissif" },
    blocked: { color: "#E06C5E", icon: <X className="h-3 w-3" />, label: "bloqué" },
    idle: { color: "#6b7280", icon: <ArrowRight className="h-3 w-3" />, label: "—" },
  }[state];
  return (
    <div className="flex flex-col items-center justify-center px-1" aria-label={`lien ${map.label}`}>
      <div className="h-0.5 w-8 sm:w-10" style={{ background: map.color }} />
      <span className="mt-1 inline-flex items-center gap-0.5 text-[10px]" style={{ color: map.color }}>
        {map.icon} {map.label}
      </span>
    </div>
  );
}

function Zone({ name, children }: { name: string; children: React.ReactNode }) {
  const s = ZONE_STYLE[name] ?? { ring: "#6b7280", bg: "transparent", text: "#9ca3af", label: name };
  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: `${s.ring}55`, background: s.bg }}>
      <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-wider" style={{ color: s.text }}>{s.label}</p>
      <div className="flex flex-col items-center gap-2">{children}</div>
    </div>
  );
}

/**
 * Cœur du dashboard : la topologie réseau en direct. Zones colorées, nœuds par
 * rôle, liens dont l'état (durci/permissif/bloqué) reflète la progression des
 * objectifs de défense. Le terminal reste secondaire (bouton par nœud).
 */
export function ProjectTopologyView({
  topology,
  objectives,
  terminalUrls,
  onOpenTerminal,
}: {
  topology: ProjectTopology;
  objectives: ProjectObjectiveView[];
  terminalUrls: { nodeId: string; url: string }[];
  onOpenTerminal: (id: string) => void;
}) {
  const urlByNode = Object.fromEntries(terminalUrls.map((t) => [t.nodeId, t.url]));
  const done = (id: string) => objectives.find((o) => o.id === id)?.completed;

  // Topologie NON segmentée (aucun firewall) → rendu GÉNÉRIQUE groupé par réseau :
  // chaque réseau devient une zone colorée avec ses nœuds. Couvre les scénarios à
  // réseau plat (ex. Shadowdomain / corp) sans logique firewall/WAF spécifique.
  const isSegmented = topology.nodes.some((n) => n.role === "firewall");
  if (!isSegmented) {
    const zones = topology.networks
      .map((net) => ({ name: net.name, nodes: topology.nodes.filter((n) => (n.networks[0]?.name ?? "") === net.name) }))
      .filter((z) => z.nodes.length > 0);
    return (
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <div className="flex items-center gap-2 pb-3 text-sm font-semibold text-fg">
          <ShieldCheck className="h-4 w-4 text-primary" /> Topologie réseau
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {zones.map((z, i) => (
            <div key={z.name} className="flex items-center gap-2">
              {i > 0 && <Link state="idle" />}
              <Zone name={z.name}>
                {z.nodes.map((n) => (
                  <NodeCard key={n.id} node={n} terminalUrl={urlByNode[n.id]} onOpenTerminal={onOpenTerminal} />
                ))}
              </Zone>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-[11px] text-muted">
          <span className="font-semibold text-faint">Légende :</span>
          {zones.map((z) => (
            <span key={z.name} className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: (ZONE_STYLE[z.name] ?? { ring: "#6b7280" }).ring }} /> {z.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const firewallHardened = done("firewall-dmz-policy");
  const wafActive = done("waf-crs-activation");

  const byRole = (r: NodeRole) => topology.nodes.filter((n) => n.role === r);
  const attacker = byRole("attacker")[0];
  const firewall = byRole("firewall")[0];
  const waf = byRole("waf")[0];
  const webapp = topology.nodes.find((n) => n.id === "webapp") ?? byRole("target")[0];
  const db = byRole("database")[0];
  const fileserver = topology.nodes.find((n) => n.id === "fileserver");
  const siem = byRole("log")[0];

  const linkState = (secured: boolean | undefined): "secured" | "permissive" =>
    secured ? "secured" : "permissive";

  return (
    <div className="rounded-2xl border border-line bg-surface/40 p-4">
      <div className="flex items-center gap-2 pb-3 text-sm font-semibold text-fg">
        <ShieldCheck className="h-4 w-4 text-primary" /> Topologie réseau (NovaBank)
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {attacker && (
          <Zone name="external">
            <NodeCard node={attacker} terminalUrl={urlByNode[attacker.id]} onOpenTerminal={onOpenTerminal} />
          </Zone>
        )}
        <Link state={firewallHardened ? "secured" : "permissive"} />
        {firewall && (
          <div className="flex flex-col items-center">
            <NodeCard
              node={firewall}
              terminalUrl={urlByNode[firewall.id]}
              onOpenTerminal={onOpenTerminal}
              badge={{ ok: !!firewallHardened, text: firewallHardened ? "durci" : "permissif" }}
            />
          </div>
        )}
        <Link state={linkState(firewallHardened)} />
        <Zone name="dmz">
          {waf && (
            <NodeCard
              node={waf}
              terminalUrl={urlByNode[waf.id]}
              onOpenTerminal={onOpenTerminal}
              badge={{ ok: !!wafActive, text: wafActive ? "blocage actif" : "détection seule" }}
            />
          )}
          {webapp && <NodeCard node={webapp} onOpenTerminal={onOpenTerminal} />}
        </Zone>
        <Link state={linkState(firewallHardened)} />
        {(db || fileserver) && (
          <Zone name="internal">
            {db && <NodeCard node={db} onOpenTerminal={onOpenTerminal} />}
            {fileserver && <NodeCard node={fileserver} onOpenTerminal={onOpenTerminal} />}
          </Zone>
        )}
        {siem && (
          <>
            <Link state={firewallHardened ? "secured" : "permissive"} />
            <Zone name="mgmt">
              <NodeCard node={siem} terminalUrl={urlByNode[siem.id]} onOpenTerminal={onOpenTerminal} />
            </Zone>
          </>
        )}
      </div>

      {/* Isolation notable + légende (accessibilité : icônes + couleurs). */}
      <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
        <X className="h-3.5 w-3.5" /> attaquant → base : aucune route (isolation réseau) — seule la voie applicative (SQLi) existe.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-[11px] text-muted">
        <span className="font-semibold text-faint">Légende :</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: ZONE_STYLE.external.ring }} /> external</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: ZONE_STYLE.dmz.ring }} /> dmz</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: ZONE_STYLE.internal.ring }} /> internal</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: ZONE_STYLE.mgmt.ring }} /> mgmt</span>
        <span className="inline-flex items-center gap-1 text-emerald-400"><Check className="h-3 w-3" /> durci</span>
        <span className="inline-flex items-center gap-1 text-amber-400"><ShieldAlert className="h-3 w-3" /> permissif</span>
        <span className="inline-flex items-center gap-1 text-danger"><X className="h-3 w-3" /> bloqué</span>
      </div>
    </div>
  );
}
