# Implementációs Terv

- [x] 1. Adatbázis réteg és típusok létrehozása
  - Adatbázis template típusok és interfészek definiálása
  - DatabaseTemplateRepository osztály implementálása Drizzle ORM-mel
  - Template lekérdezési metódusok (getTemplateByType, getAllActiveTemplates)
  - Template kezelési metódusok (createTemplate, updateTemplate, deactivateTemplate)
  - _Követelmények: 1.1, 1.2, 2.1, 3.3_

- [x] 2. Cache réteg implementálása
  - TemplateCache interfész és implementáció létrehozása
  - In-memory cache Map-alapú megvalósítással
  - TTL (Time To Live) kezelés implementálása
  - Cache invalidáció és refresh mechanizmusok
  - Batch műveletek (getMultiple, setMultiple) implementálása
  - _Követelmények: 4.1, 4.2, 4.4_

- [x] 3. Template migráció szolgáltatás
  - TemplateMigrationService osztály létrehozása
  - Built-in template-ek adatbázisba migrálásának implementálása
  - Template létezés ellenőrzés (checkTemplateExists)
  - Migráció validáció és rollback mechanizmus
  - Migráció logging és hibakezlés
  - _Követelmények: 1.4, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. TemplateRegistry átdolgozása
  - TemplateRegistry módosítása DatabaseTemplateRepository használatára
  - API kompatibilitás megőrzése (render metódus)
  - Cache integráció a template lekérdezésekbe
  - Hibakezelés és fallback mechanizmus implementálása
  - Template validáció megtartása
  - _Követelmények: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Teljesítmény optimalizálás és monitoring
  - Adatbázis indexek optimalizálása (composite és partial indexek)
  - Batch lekérdezések implementálása (getTemplatesByTypes)
  - Cache warm-up stratégia implementálása
  - Teljesítmény metrikák és monitoring hozzáadása
  - Connection pooling optimalizálás
  - _Követelmények: 4.2, 4.3, 3.5_

- [ ] 6. Hibakezelés és fallback rendszer
  - DatabaseTemplateError enum és hibatípusok definiálása
  - Retry logika implementálása exponenciális backoff-fal
  - Fallback mechanizmus (cache -> adatbázis -> built-in templates)
  - Hibalogolás és monitoring integráció
  - Graceful degradation biztosítása
  - _Követelmények: 1.3, 4.5_

- [x] 7. Inicializálás és konfiguráció
  - Email rendszer inicializálás módosítása
  - Automatikus migráció futtatása indításkor
  - Konfiguráció validáció és hibakezlés
  - Cache inicializálás és warm-up
  - Rendszer health check implementálása
  - _Követelmények: 1.1, 1.4_

- [x] 8. Biztonsági validáció és audit
  - Template tartalom validáció (HTML injection védelem)
  - Template méret limitek implementálása
  - Audit logging minden template művelethez
  - Rate limiting template lekérdezésekhez
  - Sensitive data maszkolása log-okban
  - _Követelmények: 3.1, 3.2_

- [ ] 9. Tesztek írása
  - Unit tesztek DatabaseTemplateRepository-hoz
  - Unit tesztek TemplateCache-hez
  - Unit tesztek TemplateMigrationService-hez
  - Integrációs tesztek adatbázis és cache együttműködéshez
  - E2E tesztek teljes email küldési folyamathoz
  - Teljesítmény benchmark tesztek
  - _Követelmények: 2.2, 2.3, 4.2_

- [x] 10. Dokumentáció és migráció útmutató
  - API dokumentáció frissítése
  - Migráció útmutató készítése
  - Troubleshooting guide létrehozása
  - Teljesítmény tuning útmutató
  - Rollback eljárások dokumentálása
  - _Követelmények: 5.4_
