// Déclaration ambiante minimale pour `tar-stream` (pas de @types publié).
// Couvre uniquement `pack().entry()/finalize()` utilisé par copyTextToNode.
declare module "tar-stream" {
  import { Readable } from "stream";
  export interface Pack extends Readable {
    entry(headers: { name: string; mode?: number; size?: number }, buffer?: string | Buffer): void;
    finalize(): void;
  }
  export function pack(): Pack;
}
