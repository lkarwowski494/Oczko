// Adapter wyboru zdjęcia (F-16; P-191 P9a „Take photo / Choose from library”): expo-image-picker 57.0.20 wstrzyknięty, bez EXIF w wyniku,
// tylko obrazy; aparat po zgodzie; anulowanie = nic się nie dzieje; wyjątek modułu = błąd, nie cisza. Wynik adaptera własny (Powod to kontrakt 05).
import { wybieraczZdjec, type ModulWyboru } from '../../src/platforma/zdjecia';

const modul = (o: Partial<{ zgoda: boolean; anuluj: boolean; uri: string; blad: boolean }> = {}) => {
  const wywolania: { rodzaj: string; opcje?: unknown }[] = [];
  const wynik = async (opcje: unknown) => {
    if (o.blad) throw new Error('brak sceny');
    return o.anuluj ? { canceled: true as const, assets: null } : { canceled: false as const, assets: [{ uri: o.uri ?? 'file:///tmp/ImagePicker/ABC.jpeg' }] };
  };
  const m: ModulWyboru = {
    requestCameraPermissionsAsync: async () => { wywolania.push({ rodzaj: 'zgoda' }); return { granted: o.zgoda ?? true }; },
    launchCameraAsync: async (opcje) => { wywolania.push({ rodzaj: 'aparat', opcje }); return wynik(opcje); },
    launchImageLibraryAsync: async (opcje) => { wywolania.push({ rodzaj: 'biblioteka', opcje }); return wynik(opcje); },
  };
  return { m, wywolania };
};

describe('wybieraczZdjec', () => {
  test('biblioteka: bez prośby o zgodę, tylko obrazy, exif: false; ścieżka bez file:// i rozszerzenie małymi literami', async () => {
    const { m, wywolania } = modul({ uri: 'file:///var/tmp/IMG_0001.HEIC' });
    expect(await wybieraczZdjec(m).wybierz('biblioteka')).toEqual({ rodzaj: 'zdjecie', sciezka: '/var/tmp/IMG_0001.HEIC', rozszerzenie: 'heic' });
    expect(wywolania).toEqual([{ rodzaj: 'biblioteka', opcje: { mediaTypes: ['images'], exif: false } }]);
  });
  test('aparat: najpierw zgoda; odmowa → brak_zgody bez otwierania aparatu', async () => {
    const a = modul();
    expect(await wybieraczZdjec(a.m).wybierz('aparat')).toEqual({ rodzaj: 'zdjecie', sciezka: '/tmp/ImagePicker/ABC.jpeg', rozszerzenie: 'jpeg' });
    expect(a.wywolania.map((w) => w.rodzaj)).toEqual(['zgoda', 'aparat']);
    const b = modul({ zgoda: false });
    expect(await wybieraczZdjec(b.m).wybierz('aparat')).toEqual({ rodzaj: 'brak_zgody' });
    expect(b.wywolania.map((w) => w.rodzaj)).toEqual(['zgoda']);
  });
  test('anulowanie → anulowano; wyjątek modułu → blad', async () => {
    expect(await wybieraczZdjec(modul({ anuluj: true }).m).wybierz('biblioteka')).toEqual({ rodzaj: 'anulowano' });
    expect(await wybieraczZdjec(modul({ blad: true }).m).wybierz('biblioteka')).toEqual({ rodzaj: 'blad' });
  });
});
