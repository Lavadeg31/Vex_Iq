declare module 'jwt-encode' {
  export default function encode(payload: any, secret: string): string;
} 