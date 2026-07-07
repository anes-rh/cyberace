# Packet Tracer `.pka` toolkit

Tools to **decrypt, edit and re-encrypt** Cisco Packet Tracer files (`.pka` / `.pkt`)
so we can ship purpose-built practice topologies for the Réseaux checkpoint.

## Files
- `twofish_py.py` — pure-Python Twofish (validated against the official test vector).
- `pka_codec.py` — the container codec: Twofish-EAX + double XOR obfuscation +
  zlib with a 4-byte length prefix (PT 8.x framing). CLI: `decrypt` / `encrypt` / `roundtrip`.
- `generate.py` — builds a blank "starter" topology from a real, valid PT sample by
  value substitution only (rename devices, clear IPs, wipe configs, blank notes).

## Format (recovered)
Key = sixteen `0x89`, IV/nonce = sixteen `0x10`, Twofish in EAX mode. Decrypt:
reverse-and-XOR deobfuscation → EAX-Twofish → per-byte XOR → strip 4-byte
big-endian length → zlib inflate. Encrypt is the exact inverse. Verified by a
byte-identical round-trip on real files, including an 8.2.1 activity file.

## Golden rule
The codec is proven, but **every generated topology must be opened in Packet
Tracer to confirm it loads** (a naive edit can trigger *"corrupted Physical
Workspace data"* — device names live in the logical `<NAME>`, a `<PHYSICAL>`
breadcrumb, the `HOMERACK` list and a physical `<NODE>`; all must be renamed
together). Only the logical half (before `<PHYSICALWORKSPACE>`) holds configs
and port IPs, so config-wiping there is safe.

## Example
```
python generate.py base.pkt ../../frontend/public/pka/res-wan-architecture-1.pka R1=Router0 R2=Router1
```
Then open the result in Packet Tracer and verify the topology before shipping.
Base samples come from the local PT install's `saves/` folder (guaranteed valid).
```
