# Termék Áttekintés

Ez egy SvelteKit-tel épített asztali környezet webalkalmazás, amely egy hagyományos asztali operációs rendszer felületét szimulálja a böngészőben.

## Főbb Funkciók

- **Ablakkezelő Rendszer**: Többablakos felület húzható, átméretezhető ablakokkal
- **Asztali Környezet**: Teljes asztali metafora tálcával, start menüvel és munkaterülettel
- **Alkalmazás Keretrendszer**: Moduláris app rendszer, ahol minden app külön Svelte komponens
- **Téma Rendszer**: Dinamikus témázás világos/sötét módokkal és testreszabható hátterekkel
- **Hitelesítés**: Beépített felhasználói hitelesítés és jogosultságkezelés
- **Adatbázis Integráció**: PostgreSQL Drizzle ORM-mel az adatok tárolásához
- **Beállítások Kezelése**: Felhasználói preferenciák és konfigurációk tárolása

## Architektúra Filozófia

Az alkalmazás egy asztali OS paradigmát követ, ahol:

- Az appok független Svelte komponensek, amelyek dinamikusan töltődnek be
- Az ablakok megnyithatók, bezárhatók, minimalizálhatók, maximalizálhatók és kezelhetők
- Minden app több példányban is futhat különböző paraméterekkel
- A rendszer fenntartja az állapotot az ablakpozíciókhoz, méretekhez és felhasználói beállításokhoz
- A hitelesítés és jogosultságok szabályozzák a különböző appokhoz és funkciókhoz való hozzáférést
