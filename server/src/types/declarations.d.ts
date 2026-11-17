declare module 'jsonwebtoken' {
  export function sign(payload: unknown, secretOrPrivateKey: string, options?: unknown): string;
  export function verify(token: string, secretOrPublicKey: string, options?: unknown): unknown;
  export function decode(token: string, options?: unknown): unknown;
}

declare module 'bcryptjs' {
  export function genSalt(rounds?: number): Promise<string>;
  export function hash(s: string, salt: string | number): Promise<string>;
  export function compare(s: string, hash: string): Promise<boolean>;
}
