// Adapter portu Identyfikatory (UUID v4, moduly.md „Porty domeny”) na expo-crypto (ADR-0016): jedyne miejsce importu pakietu.
// SHA-256 plików zostaje w TS (src/dane/archiwum/sha256.ts): `digest` expo-crypto bierze cały bufor naraz (P-122 (b), ryzyko 400 MB).
import { randomUUID } from 'expo-crypto';
import type { Identyfikatory } from '../domena/porty';

export const identyfikatory: Identyfikatory = { nowy: () => randomUUID() };
