"""Full .pka/.pkt codec: Twofish-EAX + double XOR obfuscation + zlib.
Mirrors pka2xml (key=16x0x89, iv/nonce=16x0x10)."""
import sys, zlib
from twofish_py import Twofish

KEY = bytes([137]*16)
IV  = bytes([16]*16)
Rb  = 0x87

def _dbl(block):  # GF(2^128) doubling for CMAC
    n = int.from_bytes(block, 'big')
    n <<= 1
    if n & (1 << 128):
        n ^= (1 << 128)
        n ^= Rb
    return (n & ((1 << 128) - 1)).to_bytes(16, 'big')

def _xor(a, b):
    return bytes(x ^ y for x, y in zip(a, b))

class EAX:
    def __init__(self, key, nonce):
        self.tf = Twofish(key)
        L = self.tf.encrypt(bytes(16))
        self.K1 = _dbl(L)
        self.K2 = _dbl(self.K1)
        self.N = self._omac(0, nonce)
        self.H = self._omac(1, b'')

    def _cmac(self, msg):
        if len(msg) == 0:
            blk = _xor(self.K2, b'\x80' + b'\x00'*15)
            return self.tf.encrypt(blk)
        x = bytes(16)
        n = len(msg)
        full = n % 16 == 0
        nb = n // 16 if full else n // 16 + 1
        for i in range(nb):
            block = msg[i*16:i*16+16]
            if i == nb - 1:
                if full:
                    block = _xor(block, self.K1)
                else:
                    block = block + b'\x80' + b'\x00'*(15 - len(block))
                    block = _xor(block, self.K2)
            x = self.tf.encrypt(_xor(x, block))
        return x

    def _omac(self, t, msg):
        return self._cmac(t.to_bytes(16, 'big') + msg)

    def _ctr(self, data, ctr0):
        out = bytearray()
        ctr = int.from_bytes(ctr0, 'big')
        for i in range(0, len(data), 16):
            ks = self.tf.encrypt((ctr & ((1<<128)-1)).to_bytes(16, 'big'))
            chunk = data[i:i+16]
            out += _xor(chunk, ks[:len(chunk)])
            ctr += 1
        return bytes(out)

    def encrypt(self, pt):
        C = self._ctr(pt, self.N)
        Cm = self._omac(2, C)
        tag = _xor(_xor(self.N, Cm), self.H)
        return C + tag

    def decrypt(self, ct):
        C, tag = ct[:-16], ct[-16:]
        Cm = self._omac(2, C)
        exp = _xor(_xor(self.N, Cm), self.H)
        ok = (exp == tag)
        return self._ctr(C, self.N), ok

def decrypt_pka(data: bytes) -> bytes:
    length = len(data)
    # Stage 1: deobfuscation (reverse + xor)
    processed = bytearray(length)
    for i in range(length):
        processed[i] = data[length - 1 - i] ^ ((length - i*length) & 0xFF)
    # Stage 2: EAX-Twofish decrypt
    eax = EAX(KEY, IV)
    dec, ok = eax.decrypt(bytes(processed))
    if not ok:
        sys.stderr.write("[warn] EAX tag mismatch\n")
    # Stage 3: deobfuscation
    out = bytearray(dec)
    for i in range(len(out)):
        out[i] ^= ((len(out) - i) & 0xFF)
    # Stage 4: zlib (PT frames a 4-byte big-endian uncompressed length prefix)
    raw = bytes(out)
    n = int.from_bytes(raw[:4], 'big')
    xml = zlib.decompress(raw[4:])
    if len(xml) != n:
        sys.stderr.write(f"[warn] length prefix {n} != actual {len(xml)}\n")
    return xml

def encrypt_pka(xml: bytes) -> bytes:
    # Stage 1: compress (prepend 4-byte big-endian uncompressed length)
    comp = len(xml).to_bytes(4, 'big') + zlib.compress(xml, 9)
    # Stage 2: obfuscation
    comp = bytearray(comp)
    for i in range(len(comp)):
        comp[i] ^= ((len(comp) - i) & 0xFF)
    # Stage 3: EAX-Twofish encrypt
    eax = EAX(KEY, IV)
    enc = eax.encrypt(bytes(comp))
    # Stage 4: obfuscation (reverse + xor)
    length = len(enc)
    out = bytearray(length)
    for i in range(length):
        out[length - 1 - i] = enc[i] ^ ((length - i*length) & 0xFF)
    return bytes(out)

if __name__ == '__main__':
    cmd, inp = sys.argv[1], sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 else None
    data = open(inp, 'rb').read()
    if cmd == 'decrypt':
        xml = decrypt_pka(data)
        if out: open(out, 'wb').write(xml)
        sys.stderr.write(f"decrypted {len(data)} -> {len(xml)} bytes; head: {xml[:60]!r}\n")
    elif cmd == 'encrypt':
        pka = encrypt_pka(data)
        if out: open(out, 'wb').write(pka)
        sys.stderr.write(f"encrypted {len(data)} -> {len(pka)} bytes\n")
    elif cmd == 'roundtrip':
        xml = decrypt_pka(data)
        re = encrypt_pka(xml)
        xml2 = decrypt_pka(re)
        sys.stderr.write(f"roundtrip {'OK' if xml==xml2 else 'FAIL'} ({len(xml)} bytes)\n")
