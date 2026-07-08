"""Merge PT topology B into A → one richer topology. Value edits only."""
import re, sys
from pka_codec import decrypt_pka, encrypt_pka

def blocks(s, tag):
    return re.findall(rf"<{tag}>.*?</{tag}>", s, flags=re.DOTALL)

def split_phys(x):
    p = x.find("<PHYSICALWORKSPACE")
    return x[:p], x[p:]

def rack_path(logical):
    m = re.search(r"<PHYSICAL translate=\"true\">([^<]*),[^,<]+</PHYSICAL>", logical)
    return m.group(1) if m else None  # everything up to ...,Rack

def device_nodes(phys):
    # TYPE=6 NODE blocks (devices) inside the rack CHILDREN
    return re.findall(r"<NODE>\s*<X>[^<]*</X>\s*<Y>[^<]*</Y>\s*<TYPE>6</TYPE>.*?</NODE>\s*", phys, flags=re.DOTALL)

def merge(a, b, renames, dx=250.0, dy=250.0):
    for new, old in renames.items():
        b = b.replace(old, new)
    ah, ap = split_phys(a); bh, bp = split_phys(b)
    a_devs = blocks(ah, "DEVICE"); na = len(a_devs)
    b_devs = blocks(bh, "DEVICE")
    a_path = rack_path(ah); b_path = rack_path(bh)
    # 1) B devices: shift logical pos + rewrite rack path to A's
    def fixdev(blk):
        blk = re.sub(r"(<LOGICAL>\s*<X>)([-\d.]+)(</X>\s*<Y>)([-\d.]+)",
                     lambda m: f"{m.group(1)}{float(m.group(2))+dx}{m.group(3)}{float(m.group(4))+dy}", blk)
        if a_path and b_path and a_path != b_path:
            blk = blk.replace(b_path + ",", a_path + ",")
        return blk
    b_devs_fixed = [fixdev(d) for d in b_devs]
    # 2) B links: reindex FROM/TO by +na
    b_links = blocks(bh, "LINK")
    def fixlink(blk):
        blk = re.sub(r"<FROM>(\d+)</FROM>", lambda m: f"<FROM>{int(m.group(1))+na}</FROM>", blk)
        blk = re.sub(r"<TO>(\d+)</TO>", lambda m: f"<TO>{int(m.group(1))+na}</TO>", blk)
        return blk
    b_links_fixed = [fixlink(l) for l in b_links]
    # 3) insert B devices before </DEVICES>
    out = ah.replace("</DEVICES>", "".join(b_devs_fixed) + "</DEVICES>", 1)
    # 4) insert B links before </LINKS> (create LINKS if absent)
    if "<LINKS>" in out:
        out = out.replace("</LINKS>", "".join(b_links_fixed) + "</LINKS>", 1)
    else:
        out = out.replace("</NETWORK>", "<LINKS>" + "".join(b_links_fixed) + "</LINKS></NETWORK>", 1)
    # 5) physical: insert B device rack-nodes into A's rack CHILDREN (before rack </CHILDREN>)
    b_nodes = device_nodes(bp)
    # A rack CHILDREN closes right before the many </CHILDREN> that unwind the rack tree;
    # the FIRST </CHILDREN> after the last existing device node is the rack's.
    ap2 = re.sub(r"(</NODE>)(\s*</CHILDREN>)", r"\1" + "".join(b_nodes) + r"\2", ap, count=1)
    return out + ap2

if __name__ == "__main__":
    a = decrypt_pka(open(sys.argv[1], "rb").read()).decode("utf-8", "replace")
    b = decrypt_pka(open(sys.argv[2], "rb").read()).decode("utf-8", "replace")
    renames = dict(p.split("=", 1) for p in sys.argv[4:])
    m = merge(a, b, renames)
    open(sys.argv[3], "wb").write(encrypt_pka(m.encode("utf-8")))
    import re as _re
    na = len(blocks(split_phys(a)[0], "DEVICE")); nb = len(blocks(split_phys(b)[0], "DEVICE"))
    print(f"merged {na}+{nb} devices -> {sys.argv[3]}")
