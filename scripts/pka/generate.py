"""Generate blank "starter" Packet Tracer topologies (.pka) from real, valid PT
sample files, by *value substitution* only (rename devices, clear IPs, wipe
configs, blank canvas notes). Structure is never touched, so PT opens them.

Every produced file MUST be opened in Packet Tracer to confirm it loads (see
scripts/pka/README.md — the codec is proven, but topology edits need a visual
check). Usage:

    python generate.py <base.pkt> <out.pka> R1=Router0 R2=Router1 [--keep-config]

Renames are given as NEW=OLD pairs. Without --keep-config the routers/switches
are delivered blank (no IPs, no routing) so the student configures them per the
exercise. With --keep-config the sample's configuration is preserved (useful for
"solution" files).
"""
import re, sys
from pka_codec import decrypt_pka, encrypt_pka

_STRIP = ("ip address", "router ospf", "ip ospf ", "network ", "router rip",
          "router eigrp", "router bgp", "standby ", "ipv6 address", "ipv6 ospf",
          "encapsulation", "ppp authentication", "clock rate", "ip helper-address")


def _wipe_config(m: re.Match) -> str:
    kept = [ln for ln in re.findall(r"<LINE>.*?</LINE>", m.group(1), flags=re.DOTALL)
            if not any(k in ln.lower() for k in _STRIP)]
    return "<RUNNINGCONFIG>\n" + "\n".join(kept) + "\n      </RUNNINGCONFIG>"


def generate(base_path: str, out_path: str, renames: dict[str, str], keep_config: bool):
    xml = decrypt_pka(open(base_path, "rb").read()).decode("utf-8", "replace")
    # Consistent full-token rename (device NAME, <PHYSICAL> breadcrumb, HOMERACK,
    # physical NODE — all must agree or PT reports "corrupted Physical Workspace").
    for new, old in renames.items():
        xml = xml.replace(old, new)
    # Blank canvas notes so a starter carries no spoilers.
    xml = re.sub(r'(<TEXT translate="true">).*?(</TEXT>)', r"\1\2", xml, flags=re.DOTALL)
    if not keep_config:
        pw = xml.find("<PHYSICALWORKSPACE")  # only edit the logical half
        head, tail = xml[:pw], xml[pw:]
        head = re.sub(r"(<IP>)[0-9.]+(</IP>)", r"\1\2", head)
        head = re.sub(r"(<SUBNET>)[0-9.]+(</SUBNET>)", r"\1\2", head)
        head = re.sub(r"<RUNNINGCONFIG>(.*?)</RUNNINGCONFIG>", _wipe_config, head, flags=re.DOTALL)
        xml = head + tail
    open(out_path, "wb").write(encrypt_pka(xml.encode("utf-8")))
    print(f"wrote {out_path}")


if __name__ == "__main__":
    args = sys.argv[1:]
    keep = "--keep-config" in args
    args = [a for a in args if a != "--keep-config"]
    base, out, *pairs = args
    renames = dict(p.split("=", 1) for p in pairs)  # NEW=OLD
    generate(base, out, renames, keep)
