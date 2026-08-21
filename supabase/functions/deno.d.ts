// Ambient shims so VSCode's plain TypeScript server (used when the Deno
// extension isn't installed) doesn't flag Deno's runtime globals and
// jsr:/npm:-specifier imports as errors. This is an editor convenience
// only — Deno itself is the real type-checker for these files at deploy
// time, and `npm run build`/`tsc -b` never includes this folder (see
// tsconfig.app.json's "include": ["src"]). Installing the "Deno for
// VSCode" extension (denoland.vscode-deno) replaces the need for this
// with real type-checking; see .vscode/settings.json.

declare const Deno: {
  serve(handler: (req: Request) => Response | Promise<Response>): void
  env: { get(key: string): string | undefined }
}

declare module '@supabase/functions-js/edge-runtime.d.ts'

declare module '@supabase/supabase-js' {
  export function createClient(url: string, key: string, options?: unknown): any
}

declare module 'zod' {
  export const z: any
}
