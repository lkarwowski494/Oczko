import { escapeCsvCell, buildProjectsCsv, buildStashYarnsCsv, CSV_BOM } from '../csv-exporter';

describe('CSV Exporter & Formula Injection Guard (RD-ENG-10, NFR-SEC-015)', () => {
  it('spełnia wektory testowe RD-ENG-10', () => {
    // 1. =SUM(A1:A5) -> '=SUM(A1:A5)
    expect(escapeCsvCell('=SUM(A1:A5)')).toBe("'=SUM(A1:A5)");

    // 2. +cmd|' /C calc'!A0 -> '+cmd|' /C calc'!A0
    expect(escapeCsvCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");

    // 3. -12.5 (czysta liczba ujemna) -> -12.5
    expect(escapeCsvCell('-12.5')).toBe('-12.5');

    // 4. Notatka z "cudzysłowem", przecinkiem -> "Notatka z ""cudzysłowem"", przecinkiem"
    expect(escapeCsvCell('Notatka z "cudzysłowem", przecinkiem')).toBe(
      '"Notatka z ""cudzysłowem"", przecinkiem"'
    );
  });

  it('obsługuje pozostałe prefiksy formuł (@, \\t, \\r)', () => {
    expect(escapeCsvCell('@SUM(A1:A5)')).toBe("'@SUM(A1:A5)");
    expect(escapeCsvCell('\tcalc')).toBe("'\tcalc");
    expect(escapeCsvCell('\rformat')).toBe("\"'\rformat\"");
  });

  it('obsługuje wartości puste (null, undefined)', () => {
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
  });

  it('obsługuje liczby i standardowe wartości tekstowe', () => {
    expect(escapeCsvCell(42)).toBe('42');
    expect(escapeCsvCell(0)).toBe('0');
    expect(escapeCsvCell(-100)).toBe('-100');
    expect(escapeCsvCell('Zwykły tekst')).toBe('Zwykły tekst');
  });

  it('opakowuje komórki z przecinkiem lub znakiem nowej linii w cudzysłowy', () => {
    expect(escapeCsvCell('jeden,dwa')).toBe('"jeden,dwa"');
    expect(escapeCsvCell('wiersz1\nwiersz2')).toBe('"wiersz1\nwiersz2"');
    expect(escapeCsvCell('wiersz1\rwiersz2')).toBe('"wiersz1\rwiersz2"');
  });

  it('generuje poprawny plik CSV projektów', () => {
    const csv = buildProjectsCsv([
      {
        projectName: 'Sweter Kardigan',
        craftType: 'knitting',
        status: 'in_progress',
        partName: 'Tył',
        counterName: 'Rzędy',
        counterValue: 48,
        targetRows: 120,
        updatedAt: '2026-10-17 10:00:00',
      },
      {
        projectName: 'Szalik "Zygzak"',
        craftType: 'crochet',
        status: 'completed',
        partName: 'Główna część',
        counterName: '=SUM(1,2)', // test ochrony komórki
        counterValue: 200,
        targetRows: null,
        updatedAt: '2026-10-17 11:00:00',
      },
    ]);

    expect(csv).toContain('Projekt,Rękodzieło,Status,Część robótki,Licznik,Aktualna wartość,Wiersze docelowe,Ostatnia zmiana');
    expect(csv).toContain('Sweter Kardigan,knitting,in_progress,Tył,Rzędy,48,120,2006-10-17 10:00:00'.replace('2006', '2026'));
    expect(csv).toContain('"Szalik ""Zygzak"""');
    expect(csv).toContain("'=SUM(1,2)");
  });

  it('generuje poprawny plik CSV magazynu włóczek', () => {
    const csv = buildStashYarnsCsv([
      {
        brand: 'Drops',
        name: 'Nord',
        colorway: 'Oliwka, ciemna',
        dyeLot: '102',
        weightCategory: 'Fingering (1)',
        skeinsRemaining: 4,
        skeinsTotal: 5,
        weightGrams: 50,
        meters: 170,
        notes: '+uwaga/ważne',
      },
    ]);

    expect(csv).toContain('Marka,Nazwa,Kolor / Odcień,Partia farbowania,Grubość CYC,Motki na stanie,Motki łącznie,Masa motka (g),Długość motka (m),Notatki');
    expect(csv).toContain('"Oliwka, ciemna"');
    expect(csv).toContain("'+uwaga/ważne");

    // Test gałęzi z nullami
    const csvEmpty = buildStashYarnsCsv([
      {
        brand: 'Drops',
        name: 'Safran',
        colorway: 'Biel',
        dyeLot: null,
        weightCategory: 'Sport',
        skeinsRemaining: 1,
        skeinsTotal: 1,
        weightGrams: null,
        meters: null,
        notes: null,
      },
    ]);
    expect(csvEmpty).toContain('Drops,Safran,Biel,,Sport,1,1,,,');
  });
});
