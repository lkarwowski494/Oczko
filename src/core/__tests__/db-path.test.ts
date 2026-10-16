import { dbDirectory } from '../db-path';

describe('dbDirectory (SEC-09: Apps4Brew Database Path Protection)', () => {
  it('przenosi domyślny katalog /Documents/SQLite/ do bezpiecznego /Library/SQLite', () => {
    const input = '/var/mobile/Containers/Data/Application/12345/Documents/SQLite';
    expect(dbDirectory(input)).toBe('/var/mobile/Containers/Data/Application/12345/Library/SQLite');

    const inputWithSlash = '/data/user/0/com.apps4brew.knitting/Documents/SQLite/';
    expect(dbDirectory(inputWithSlash)).toBe('/data/user/0/com.apps4brew.knitting/Library/SQLite');
  });

  it('zwraca undefined dla null, pustego ciągu lub ścieżek, które nie kończą się na Documents/SQLite', () => {
    expect(dbDirectory(null)).toBeUndefined();
    expect(dbDirectory(undefined)).toBeUndefined();
    expect(dbDirectory('')).toBeUndefined();
    expect(dbDirectory('/some/other/path')).toBeUndefined();
    expect(dbDirectory('/Library/SQLite')).toBeUndefined();
  });
});
