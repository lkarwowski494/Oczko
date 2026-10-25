// Arytmetyka dat kalendarzowych RRRR-MM-DD (RD-16): bez strefy i bez zegara systemu — dzień to data, nie chwila.
export function dodajDni(dzien: string, dni: number): string {
  const [r, m, d] = dzien.split('-').map(Number);
  return new Date(Date.UTC(r, m - 1, d + dni)).toISOString().slice(0, 10);
}
