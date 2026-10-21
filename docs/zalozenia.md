# Oczko — rejestr założeń

Jeden rejestr dla wszystkich ról. Założenie to twierdzenie, na którym stoją decyzje, a którego prawdziwość nie wynika z kodu. Przy zmianie statusu na „podważone” albo „obalone”: `grep -rn "ZAL-0nn" docs/` i lista zależnych pozycji do decyzji właściciela.

| ID | Założenie | Rola | Status | Dowód (źródło, data) | Zależą od niego |
|---|---|---|---|---|---|
| ZAL-001 | Osoby dziergające na iPhonie płacą za narzędzie do własnych robótek | 02 | potwierdzone (R) dla US/GB | `docs/monetyzacja.md` E1: 12 płatnych narzędzi N, cytaty płacących; 2026-10-21 | werdykt bramki |
| ZAL-002 | Wartość jest stała (praca przy każdej robótce), nie jednorazowa | 02 | częściowo potwierdzone (R) | E1: odnawiane subskrypcje 10–30 USD/rok obok zakupów jednorazowych 4–45 USD; 2026-10-21 | model (sesja 2, E2) |
| ZAL-003 | Bez konta, sieci i usług: koszt pieniężny aplikacji 0 zł/rok | 02 | hipoteza | pomysł; Garmin i zegarek do sprawdzenia w sesji 2 / rola 05 | bramka (koszty 0) |
| ZAL-004 | Platforma: tylko iOS | 02 | potwierdzone decyzją | P-011, 2026-10-21 | bramka |
| ZAL-005 | Nikt poza właścicielem nie zapłacił za poprzednią wersję | 02 | potwierdzone | właściciel, OP-02, 2026-10-21 | swoboda modelu (3.1.2(a)) |
| ZAL-006 | Popyt jest globalny; kolejność storefrontów z sygnałów popytu | 02 | potwierdzone (przesiew) | E1b: US 3918 ocen/rok N, potem CA, GB, JP, NO, AU, DE, FR; 2026-10-21 | lista krótka, kolejność języków (09) |
| ZAL-007 | Obszary 1–12 z `docs/pomysl.md` to mapa fraz, nie wymagania; WTP w sesji 2 na BRD | 02 | ustalenie procesu | prompt roli 02 | sesja 2 |
| ZAL-008 | Rynek dzieli się na narzędzia N i aplikacje W z treścią i płatną reklamą; Oczko to N | 02 | hipoteza (ocena roli 02) | E1, tabela rynku; P-012 | bramka (konkurenci), rola 01 |
| ZAL-009 | Uczciwość to realna przewaga: skargi płacących dotyczą okresów próbnych, zabranych funkcji, utraty zakupu i danych | 02 | hipoteza (R) | E1, tabela recenzji | rola 01 (wyróżnik), 04, 12 |
| ZAL-010 | PL ma mało ocen narzędzi (21/rok) | 02 | potwierdzone (pomiar) | E1b przesiew | kolejność języków |
| ZAL-011 | 60 instalacji na ocenę (pes. 20, opt. 200) | 02 | hipoteza, bez źródła | E1b; sprawdzenie: App Analytics innych aplikacji właściciela (OP-06) | wynik bramki |
| ZAL-012 | Oczko zdobędzie 6% (2–20%) rocznych instalacji narzędzi N bez płatnej reklamy | 02 | hipoteza, bez źródła | E1b | wynik bramki |
| ZAL-013 | Konwersja pobranie → płacący ok. 2,1% (freemium) | 02 | hipoteza ze źródłem szczebla 4 | RevenueCat 2026 (MS-12) | wynik bramki, sesja 2 |
| ZAL-014 | Tanie tworzenie aplikacji (AI) zwiększa liczbę konkurentów szybciej, niż obniża ceny; pierwsze ryzyko to widoczność | 02 | hipoteza (R częściowo) | RevenueCat 2026 (MS-12); przesiew E1b: 63 ze 100 lokalnych narzędzi N wydano w 2026, 72 z 73 nowych ma < 10 ocen; 2026-10-21 | udział nowej aplikacji, odświeżenie bramki, rola 01 (wyróżnik), M5 |
| ZAL-015 | Ceny narzędzi N spadną w ciągu 1–2 lat (scenariusz właściciela) | właściciel / 02 | hipoteza | brak dowodu spadku na 2026-10-21; scenariusze A/B w `docs/monetyzacja.md` | cena (sesja 2, E2), odświeżenie |
| ZAL-016 | Cena ok. ⅓ rynku (0,99 / 6,99 / 14,99 USD) podnosi konwersję i udział o ok. 50% każde (wtedy dorównuje cenom rynkowym) | właściciel | hipoteza | RevenueCat 2025/2026 (MS-12, MS-12a): dane mieszane; brak eksperymentu w kategorii; 2026-10-21 | cena (sesja 2, E2) |
