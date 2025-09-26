# Fejlesztési ütemterv

## 0. Technológiai referenciák és dokumentációk

### Fő technológiai stack dokumentációi:
- [ ] **Svelte 5**: https://svelte.dev/docs/svelte/overview - Új runes API, komponens architektúra
- [ ] **SvelteKit**: https://svelte.dev/docs/kit - Routing, SSR, build rendszer
- [ ] **TailwindCSS 4**: https://tailwindcss.com/docs - Utility-first CSS framework
- [ ] **TypeScript**: https://www.typescriptlang.org/docs/ - Type safety, fejlesztői élmény
- [ ] **Vite**: https://vite.dev/guide/ - Build tool, dev server
- [ ] **Bun**: https://bun.sh/docs - Package manager, runtime

### UI és interakció komponensek:
- [ ] **Bits UI**: https://bits-ui.com/ - Headless UI komponensek Svelte-hez
- [ ] **Lucide Svelte**: https://lucide.dev/guide/packages/lucide-svelte - Ikonkészlet
- [ ] **svelte-moveable**: https://www.npmjs.com/package/svelte-moveable - Drag & drop, resize funkcionalitás

### Tesztelési és minőségbiztosítási eszközök:
- [ ] **Vitest**: https://vitest.dev/guide/ - Unit és integrációs tesztek
- [ ] **Playwright**: https://playwright.dev/docs/intro - E2E tesztelés
- [ ] **Testing Library Svelte**: https://testing-library.com/docs/svelte-testing-library/intro - Komponens tesztelés
- [ ] **ESLint**: https://eslint.org/docs/latest/ - Kód minőség, statikus analízis
- [ ] **Prettier**: https://prettier.io/docs/en/ - Kód formázás

### Performance és monitoring:
- [ ] **Lighthouse**: https://developer.chrome.com/docs/lighthouse - Web performance audit
- [ ] **Svelte DevTools**: https://github.com/sveltejs/svelte-devtools - Fejlesztői eszközök
- [ ] **Web Vitals**: https://web.dev/articles/vitals - Core performance metrikák

### Biztonsági referenciák:
- [ ] **Content Security Policy**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP - XSS védelem
- [ ] **OWASP Frontend Security**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

### Accessibility:
- [ ] **ARIA Guidelines**: https://www.w3.org/WAI/ARIA/apg/ - Akadálymentesítési irányelvek
- [ ] **axe-core**: https://github.com/dequelabs/axe-core - Accessibility tesztelés

## 1. Projekt előkészítése és tooling
- [ ] Felülvizsgálni a `package.json` függőségeket, összevetni a projekt igényelt csomagjaival (`svelte`, `sveltekit`, `tailwindcss`, `moveable-svelte`, animációs eszközök stb.).
- [ ] Ellenőrizni a `svelte.config.js`, `vite.config.ts`, `tsconfig.json` és `eslint.config.js` beállításait, frissíteni Svelte 5 kompatibilitásra.
- [ ] Beállítani a `bun run check` pipeline-t: `svelte-kit sync`, `svelte-check --tsconfig ./tsconfig.json` futtatása, hibák feltárása.
- [ ] Létrehozni vagy frissíteni a Tailwind 4 konfigurációt (`tailwind.config.ts`), integrálni a SvelteKit build folyamatba.
- [ ] Bevezetni a Svelte 5 rúnák használatát segítő utility modult (`src/lib/utils/runes.ts`), benne közös mintákkal (pl. fókuszált ablak kezelése, media query helper), és dokumentálni a használatát.
- [ ] ESLint és Prettier szabályok finomítása (Svelte 5 recommended, Tailwind plugin), automatikus formázás beállítása.
- [ ] Gyors manuális ellenőrzés: `bun install`, majd `bun run check` futtatása, eredmények jegyzése.
- [ ] Megerősíteni, hogy a fenti konfigurációk megfelelnek a már meglévő beállításaidnak; bármilyen módosítást csak közös jóváhagyás után bevezetni.

## 2. Alap design rendszer és globális stílusok
- [ ] Frissíteni a `src/app.css` fájlt: globális reset, alap betűtípusok, háttér (`static/bg.jpg`) integrálása, a screenshotok szerinti vizuális megjelenéshez igazítva.
- [ ] Tailwind theme kiterjesztése: színpaletta, árnyékok, border-radius, spacing a desktop kinézethez, a referencia screenshotok minimális eltéréssel történő leképezésével.
- [ ] A Bits UI (`bits-ui`) headless komponenskönyvtár integrálása, alap komponensek kiválasztása (menü, dialog, tooltip stb.) a design rendszerrel összhangban.
- [ ] A `lucide-svelte` ikoncsomag integrálása (`src/lib/icons/`), a szükséges ikonok listázása és a menüsáv/start menü gombokhoz való hozzárendelése.
- [ ] Dinamikus ikon betöltő rendszer kidolgozása: string alapján lucide ikont renderelni, alternatívaként lokális PNG/SVG fájlt betölteni (public `static/` vagy komponens könyvtárból dinamikus importtal).
- [ ] Mintakomponensek létrehozása Tailwind osztályokkal (gomb, badge, overlay) a konzisztens UI érdekében, a runtime előnézethez SvelteKit oldalt használva.

## 3. Desktop layout és menüsáv váz
- [ ] Elkészíteni a `src/lib/Desktop/DesktopLayout.svelte` alapját: menüsáv, munkaterület, háttér, start gomb placeholder.
- [ ] Megvalósítani a menüsáv szerkezetét: bal oldali ablak-lista placeholder, jobb oldali státusz terület (óra, ikonok).
- [ ] Előkészíteni a start menü overlay vázát (még statikus tartalommal), a design szerinti pozicionálással.
- [ ] Biztosítani, hogy a desktop layout reszponzívan kezelje a viewport méreteket (minimum támogatott felbontás definiálása).
- [ ] Manuális ellenőrzés: desktop nézet megjelenik-e helyesen, nincsenek stílus hibák.

## 4. Ablakkezelő architektúra (mag komponens)
- [ ] Létrehozni a központi window state tárolót (`src/lib/stores/windowManager.ts`) Svelte rúnákkal.
  - [ ] Definiálni a `WindowInstance` típust (`id`, `title`, `position`, `size`, `zIndex`, `isMaximized`, `isMinimized`, `isActive`).
  - [ ] Implementálni a `WindowManagerState` struktúrát (nyitott ablakok listája, next z-index számláló).
  - [ ] Kezelni a meta szinten beállított többször nyitható appokat (`allowMultiple`), egyedi példányazonosító (`instanceId`) kiosztással.
  - [ ] Architektúra irányelv: osztály/factory alapú window manager, belső logikában Svelte 5 rúnák, kifelé store-szerű (`subscribe`) API.
- [ ] Központi szolgáltatás modul (`src/lib/services/windowService.ts`): `openApp`, `closeWindow`, `focusWindow`, `toggleMinimize`, paraméter átadás kezelése.
- [ ] Dinamikus komponens betöltés: `openApp` használja a `lib/apps/{appId}/index.svelte` lazy importot, meta kiolvasással.
- [ ] Alapértelmezett ablak pozicionálási logika: első ablak bal felső régió, további ablakok offsettel.
  - [ ] Nyitáskor vegye figyelembe az app meta szerinti méretet (px, %, fullscreen), és szükség esetén igazítsa a pozíciót, hogy ne lógjon ki a menüsáv vagy a viewport határain túl.
  - [ ] Ha a megadott kezdeti mérettel nem lehet elhelyezni az ablakot a munkaterületen, automatikus fullscreen módra váltás.
- [ ] Munkamenet közbeni ablak újranyitási védelem: egyszer nyitható appoknál fókuszra vált, többször nyitható appoknál új példányt hoz létre az egyedi `instanceId` alapján.
- [ ] Egységtesztek: window store reducer műveletek (`open`, `focus`, `close`, `minimize`, `maximize`) lefedése.

## 4.5. Memória és lifecycle management
- [ ] App komponens lifecycle hooks implementálása: `onMount`, `onDestroy`, automatikus cleanup logika.
- [ ] Memória monitoring rendszer: ablak bezárásakor teljes cleanup, event listener eltávolítás, DOM referenciák nullázása.
- [ ] Lazy loading optimalizálás: komponensek csak látható/aktív ablakoknál renderelődjenek, inaktív ablakok virtualizálása.
- [ ] Maximum ablak limit bevezetése (konfiguráció: pl. 20 ablak), túllépéskor felhasználói figyelmeztetés és legrégebbi ablak automatikus bezárása.
- [ ] Inactive ablak suspend mechanizmus: hosszú ideig (pl. 10 perc) inaktív ablakok DOM-ból való eltávolítása, state megőrzésével.
- [ ] Memory leak detection: fejlesztői módban memória használat figyelése, növekvő trend esetén figyelmeztetés.
- [ ] Garbage collection trigger: kritikus memória szint esetén manuális cleanup futtatása.

## 4.6. Error handling és stability
- [ ] App-level error boundary implementálása: crashelt app komponens ne állítsa le a teljes desktop környezetet.
- [ ] Global error handler bevezetése: nem kezelt hibák központi logolása, felhasználói értesítés megjelenítése.
- [ ] Graceful degradation: ha egy app nem tölthető be vagy crashel, fallback UI megjelenítése hibaüzenettel.
- [ ] App recovery mechanizmus: crashelt app újraindítási lehetősége, state visszaállítási opció.
- [ ] Debug mode beépítése: fejlesztői konzol, real-time state inspector, performance metrics megjelenítése.
- [ ] Error reporting: opcionális hibareportálás külső szolgáltatásba (Sentry, LogRocket), felhasználói beleegyezéssel.
- [ ] Circuit breaker pattern: gyakran crashelő appok automatikus letiltása, manuális újraengedélyezési opcióval.

## 5. Ablak komponens és interakciók
- [ ] Összerakni a `src/lib/Window/WindowFrame.svelte` komponenst: fejléc, vezérlőgombok, tartalmi slot.
- [ ] Integrálni a `svelte-moveable` csomagot: drag mozgatás a fejlécen, resize a széleken és sarkokon.
- [ ] Maximalizálás logika: dupla klikk a fejlécen, vezérlőgomb funkció, visszaállítás előző méretre.
- [ ] Edge/sarok dupla klikk viselkedés: adott irányba teljes kiterjesztés.
- [ ] Aktív ablak state: kattintáskor `focusWindow`, `zIndex` frissítés, vizuális kiemeléssel az aktív példánynál.
- [ ] Inaktív ablak vizuális jelzése: halványított fejléc, vezérlőgombok elrejtése vagy deaktivált megjelenítése, hogy a fókusz hiánya egyértelmű legyen.
- [ ] Minimalizálás: ablak eltüntetése a munkaterületről, állapot mentése store-ban.
- [ ] Minimalizálásból visszahozva az app komponensek meglévő reaktív állapota (pl. kitöltött form mezők) maradjon változatlan.
- [ ] Csatlakoztatni konfigurálható animációkat (Svelte transition vagy CSS), minimalizálás „zsugorodás”, maximalizálás „tágulás”.
- [ ] Integrációs és vizuális tesztek: Playwright szkriptek az ablaknyitás, drag, resize, maximize, minimize folyamatokra, screenshot összevetésekkel.

## 6. Menüsáv és start menü ablakvezérlés integrációja
- [ ] Menüsáv ablakgomb komponens: aktív/inaktív/minimalizált vizuális állapotok, kattintási logika.
- [ ] Start menü dinamikus lista: regisztrált appok metaadatai alapján gombok létrehozása.

## 7. App komponensek fejlesztési keretrendszere

- [ ] `openApp` bővítése paraméter átadással, default méret/mód beállításokkal, többször nyitható appok esetén egyedi `instanceId` kezelésével.
- [ ] App scaffolding dokumentáció: hogyan kell új appot létrehozni (`dev_instructions/app_guidelines.md`).
- [ ] Unit teszt: dinamikus import modul fallback, hibakezelés (nem létező app id).
- [ ] Ablak állapot visszajelzések: árnyék erősség aktív állapotban, inaktív homályosítás.
- [ ] Mozgatás közbeni vizuális visszacsatolás (pl. ghost outline, grid snap opció?).
- [ ] Resize során minimális mérethatárok, arányok beállítása.
- [ ] Teljesítmény optimalizálás: drag/resize event throttle, unnecessary re-render elkerülése.
- [ ] Lighthouse és Svelte Devtools profilozás a munkaterület teljesítményének mérésére.

## 7.5. Biztonsági sandbox és izolálás
- [ ] Content Security Policy (CSP) beállítása: app komponensek közötti izolálás, külső erőforrások korlátozása.
- [ ] XSS védelem implementálása: user input sanitization, innerHTML helyett textContent használata, trusted types bevezetése.
- [ ] App sandbox architektúra: komponensek közötti shared state védelem, cross-app kommunikáció korlátozása.
- [ ] Secure app loading: dinamikus import validálás, csak engedélyezett app komponensek betöltése.
- [ ] Permission system: app-specifikus jogosultságok (pl. localStorage hozzáférés, external API calls).
- [ ] Input validation: minden app paraméter és user input validálása, type checking.
- [ ] Audit logging: biztonsági események naplózása (sikertelen betöltések, jogosultság túllépések).

## 9. Ablakkezelő QA és regressziós tesztelés
- [ ] Vitest + Svelte Testing Library: store és komponens egységtesztek bővítése (edge case-ek: sok ablak, gyors kattintásváltás).
- [ ] Playwright: komplex scénariók (több ablak, maximalizálás, minimalizálás, fókuszváltás) és vizuális regresszió screenshot összevetéssel.
- [ ] Vizuális regresszió (Percy/Chromatic vagy kézi screenshot összevetés) az ablak állapotokhoz.
- [ ] Cross-browser manuális teszt: Chrome, Firefox, Safari, Edge legfrissebb verziók.

## 9.5. Performance monitoring és optimalizálás
- [ ] Real-time performance metrics implementálása: FPS monitoring, memória használat, render time mérése.
- [ ] Performance budget beállítása: threshold-ok definiálása (pl. 60 FPS, max 100MB memória), túllépés esetén automatikus optimalizálás.
- [ ] Bundle size monitoring: app komponensek méretének nyomon követése, lazy loading hatékonyságának mérése.
- [ ] Core Web Vitals tracking: LCP, FID, CLS metrikák folyamatos monitorozása, regresszió detektálás.
- [ ] Memory leak detection automatizálása: hosszú távú memória trend elemzés, anomália riasztás.
- [ ] Performance profiling tools: beépített profiler fejlesztői módban, bottleneck azonosítás.
- [ ] Automated performance testing: CI/CD pipeline-ba integrált performance regresszió tesztek.

## 10. Extra funkciók bevezetése (ablakkezelő stabilitása után)
- [ ] Notification rendszer: store (`src/lib/stores/notificationStore.ts`), értesítési panel, auto-dismiss logika.
- [ ] Help rendszer: `help` app komponens, `helpId`-ből adat betöltése, ablakból indítható gomb.
- [ ] Bejelentkezési folyamat: login képernyő, mock backend, session tárolás, route guard.
- [ ] Állapot perzisztencia: nyitott ablakok, pozíciók, felhasználói preferenciák mentése (IndexedDB), session recovery.
- [ ] Offline működés támogatása: Service Worker implementáció, cache stratégia, offline app működés.
- [ ] Accessibility kiterjesztés: ARIA attribútumok, billentyűzet navigáció, screen reader támogatás.
- [ ] Start menü keresőmező és kategória/csoportosítás logika implementálása (debounce, app meta alapján).
- [ ] Billentyűparancs rendszer (pl. "Win" gomb szimuláció, gyorsváltás) kialakítása az érett ablakkezelő felett.
- [ ] Postgres adatbázis integráció: adatmodell megtervezése, migrációk, lokális fejlesztői környezet előkészítése.
- [ ] Drizzle ORM bevezetése: típusbiztos lekérdezések, repository réteg, unit tesztek.
- [ ] Dragonfly cache infrastruktúra: telepítés, session/notification cache réteg, invalidációs stratégiák.
- [ ] Többnyelvűség kezelése `inlang` Paraglide használatával: nyelvi kulcsok, runtime váltás, fallback lánc.
- [ ] Theme rendszer: dark/light mode, custom témák, felhasználói testreszabás.
- [ ] Multi-monitor támogatás: ablak pozicionálás több képernyőn, viewport detection.
- [ ] Tesztelés: funkcionális, integrációs, accessibility audit (Axe), security penetration testing.

## 11. Dokumentáció, release és karbantartás
- [ ] Fejlesztői dokumentáció frissítése (`README.md`, `dev_instructions/`), a feladatlista karbantartása.
- [ ] Felhasználói leírás készítése (desktop használati útmutató, gyorsbillentyűk).
- [ ] CI/CD pipeline beállítása (GitHub Actions vagy más): lint, unit, e2e futtatás, build artefakt előállítás.
- [ ] Release ellenőrző lista: `bun run check`, `bun run build`, preview deploy validálása.
- [ ] Jövőbeli backlog jegyzetelése (további appok, témák, integrációk).
