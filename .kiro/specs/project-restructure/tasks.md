# Implementációs Terv

- [x] 1. Új könyvtár struktúra és alapok létrehozása
  - Az új alkalmazás-központú könyvtár struktúra létrehozása `src/lib/` alatt
  - `components/`, `apps/`, `stores/`, `types/`, `utils/`, `services/` könyvtárak felállítása
  - `server/database/` könyvtár megtartása változatlan formában
  - Alkalmazás regiszter alapjainak létrehozása
  - _Követelmények: 1.1, 1.2, 1.3, 2.1_

- [x] 2. Közös típusok és segédprogramok alapjainak felállítása
  - Közös típus definíciók létrehozása `src/lib/types/` mappában
  - Közös segédprogramok áthelyezése `src/lib/utils/` mappába
  - Alkalmazás konstansok létrehozása
  - Megfelelő TypeScript exportok beállítása a közös modulokhoz
  - _Követelmények: 2.4, 1.4_

- [x] 3. Alkalmazás regiszter rendszer implementálása
  - Alkalmazás regiszter létrehozása `src/lib/apps/registry/` mappában
  - Szabványosított alkalmazás metaadat interfész és típusok definiálása
  - Alkalmazás betöltési és regisztrációs mechanizmusok implementálása
  - Alkalmazás sablon struktúra létrehozása
  - _Követelmények: 3.1, 3.2, 3.4_

- [x] 4. Meglévő alkalmazások migrálása új struktúrába
  - Minden meglévő alkalmazás migrálása a szabványosított struktúrába
  - Alkalmazás-specifikus komponensek, logika és eszközök egy helyre szervezése
  - Alkalmazás metaadat fájlok létrehozása minden alkalmazáshoz
  - Alkalmazás importok és regisztráció frissítése
  - _Követelmények: 3.1, 3.2, 3.3_

- [x] 5. Core asztali komponensek átszervezése
  - Desktop, Window és Taskbar komponensek áthelyezése `src/lib/components/core/` mappába
  - Ablakkezelési store-ok átszervezése `src/lib/stores/` mappában
  - Core típusok létrehozása és szervezése
  - Komponens importok és hivatkozások frissítése
  - _Követelmények: 6.2, 6.4, 1.2_

- [x] 6. UI komponensek átszervezése és komponens szervezés kialakítása
  - Újrafelhasználható UI komponensek áthelyezése `src/lib/components/ui/` mappába
  - Közös komponensek áthelyezése `src/lib/components/shared/` mappába
  - Alkalmazás-specifikus komponensek elkülönítése az általános UI komponensektől
  - Komponens importok frissítése az alkalmazásban
  - _Követelmények: 6.1, 6.2, 6.3_

- [x] 7. Store-ok és állapotkezelés átszervezése
  - Globális store-ok átszervezése `src/lib/stores/` mappában
  - Alkalmazás-specifikus store-ok áthelyezése az alkalmazás mappákba
  - Store importok és függőségek frissítése
  - Állapotkezelési minták konzisztenciájának biztosítása
  - _Követelmények: 2.1, 6.3_

- [x] 8. Szolgáltatások átszervezése
  - Alkalmazás szolgáltatások kategorizálása és átszervezése
  - Szerver oldali szolgáltatások megtartása `src/lib/server/` alatt
  - Kliens oldali szolgáltatások szervezése
  - Szolgáltatás importok és függőségek frissítése
  - _Követelmények: 2.1, 2.3_

- [x] 9. Segédprogramok átszervezése
  - Közös segédprogramok áthelyezése `src/lib/utils/` mappába
  - Alkalmazás-specifikus segédprogramok áthelyezése az alkalmazás mappákba
  - Szerver oldali segédprogramok elkülönítése
  - Segédprogram importok frissítése az alkalmazásban
  - _Követelmények: 2.1, 2.2_

- [x] 10. Routing és API végpontok frissítése
  - SvelteKit útvonalak frissítése az új import útvonalak használatához
  - API végpontok frissítése az új szerver struktúra használatához
  - Kliens és szerver kód megfelelő szétválasztásának biztosítása az útvonalakban
  - Útvonal-specifikus importok és függőségek frissítése
  - _Követelmények: 2.1, 2.3_

- [x] 11. Régi könyvtár struktúra tisztítása és migráció finalizálása
  - Régi könyvtár struktúra eltávolítása az összes migráció ellenőrzése után
  - Összes fennmaradó import útvonal frissítése a kódbázisban
  - Build konfiguráció és TypeScript útvonalak frissítése szükség esetén
  - Törött importok vagy körkörös függőségek hiányának ellenőrzése
  - _Követelmények: 1.1, 1.2, 1.3, 1.4_

- [x] 12. Migráció validálása és átfogó tesztek futtatása
  - TypeScript fordítás futtatása típus hibák ellenőrzésére
  - Meglévő teszt csomag futtatása regressziók elkerülése érdekében
  - Kulcsfontosságú felhasználói folyamatok manuális tesztelése
  - Összes alkalmazás betöltésének és helyes működésének validálása
  - _Követelmények: Összes követelmény validálása_
