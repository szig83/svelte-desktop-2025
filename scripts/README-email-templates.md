# Email Templates Adatbázis Inicializálás

## Áttekintés

Ez a script beszúrja a jelenlegi kódban lévő built-in email templateket az adatbázis `email_templates` táblájába.

## Használat

### 1. Adatbázis kapcsolat ellenőrzése

Győződj meg róla, hogy a PostgreSQL adatbázis fut és elérhető:

```bash
# Docker-rel (ha használod)
cd docker
docker-compose up -d

# Vagy ellenőrizd a kapcsolatot
psql -h localhost -p 5432 -U your_username -d your_database
```

### 2. Script futtatása

```bash
# Közvetlenül psql-lel
psql -h localhost -p 5432 -U your_username -d your_database -f scripts/insert-email-templates.sql

# Vagy Docker-rel
docker exec -i postgres_container_name psql -U your_username -d your_database < scripts/insert-email-templates.sql
```

### 3. Ellenőrzés

A script végén automatikusan kilistázza a beszúrt templateket. Vagy manuálisan is ellenőrizheted:

```sql
SELECT type, name, is_active FROM platform.email_templates ORDER BY type;
```

## Mit csinál a script

1. **Törli a meglévő templateket** - Ha már vannak templatek az adatbázisban, azokat törli
2. **Beszúrja a 4 alap templatet**:
   - `welcome` - Üdvözlő email
   - `password_reset` - Jelszó visszaállítás
   - `notification` - Általános értesítés
   - `email_verification` - Email cím megerősítés (magyar nyelven)
3. **Ellenőrzi az eredményt** - Kilistázza a beszúrt templateket

## Template struktúra

Minden template tartalmazza:

- `type` - Egyedi azonosító (pl. 'welcome')
- `name` - Emberi olvasható név
- `subject_template` - Email tárgy sablon
- `html_template` - HTML email sablon
- `text_template` - Szöveges email sablon
- `required_data` - Kötelező adatok JSON tömbként
- `optional_data` - Opcionális adatok JSON tömbként
- `is_active` - Aktív-e a template

## Migrációs funkciók eltávolítása

A korábbi bonyolult migrációs rendszer helyett most egyszerűen:

1. **Futtatod ezt az SQL scriptet** - Egyszer, amikor inicializálod az adatbázist
2. **Az alkalmazás az adatbázisból olvassa a templateket** - Nincs szükség kód-adatbázis szinkronizálásra
3. **Új templateket közvetlenül az adatbázisban kezelsz** - INSERT/UPDATE/DELETE SQL parancsokkal

## Fájl átnevezések

A repository fájlok átnevezésre kerültek az egyértelműség érdekében:

- `database-template-repository.ts` → `email-template-repository.ts`
- `template-cache.ts` → `email-template-cache.ts`
- `template-cache-manager.ts` → `email-template-cache-manager.ts`
- `template-repository-factory.ts` → `email-template-repository-factory.ts`

A migrációs fájlok törölve lettek:

- `template-migration-service.ts` ❌
- `template-migration-factory.ts` ❌

## Következő lépések

1. Futtasd le a scriptet az adatbázisban
2. Ellenőrizd, hogy az alkalmazás megfelelően működik
3. Ha új templateket akarsz hozzáadni, használj egyszerű INSERT SQL parancsokat
4. Ha meglévő templateket akarsz módosítani, használj UPDATE SQL parancsokat
