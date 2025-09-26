# Project ismertető

Ez egy olyan webalkalmazás, aminek olyan ui felülete van, mintha egy oprációs rendszer lenne. Tehát teljes értékű ablakkezelő rendszerrel, elszeparált alakalmazásokkal, amiket külön komponensként fejleszthetünk. Van menüsáv és munkaterület is. A menüsávon van "start menü" szerű központi gomb a jobb szélen. Ez nyit egy indító panelt, amin a különböző alkalmazás ikonok vannak, amikkel külön ablakokban nyithatóak meg az alkalmazások. Az ablakkezelő pontos működését később ismertetem. A felületre külön belépés után lehet majd kerülni, amit egy bejelentekési képernyőn kell végrehajtani. A webalkalmazás 1 központi desktop alkalmazást használ, ami a teljes felületet fogja kezelni. Az rendszerben lesz külön "notification" funkció is.

## Technológiák

- Svelte (Svelte 5) és SvelteKit (https://svelte.dev)
- TailwindCSS 4 (https://tailwindcss.com)
- Vite (https://vite.dev)
- Typescript (https://www.typescriptlang.org)
- Moveable-svelte (https://github.com/daybrush/moveable)


## Képernyőképek

Így kell hogy kinézzen az alkalmazás:

### Asztali nézet
![Asztali nézet](desktop.png)

### Indítómenü
![Indítómenü](start_menu.png)

### Alkalmazás ablak
![Alkalmazás ablak](window.png)

### Több ablak
![Több ablak](windows.png)

## Ablakkezelő működése

Az ablakkezelő működése a következőképpen történik:

Az ablakok kezelése a Moveable-svelte komponens segítségével történik.
Az ablakok mozgatása a munkaterületen belül lehetséges.
Az ablakok mozgatása az ablak fejlécét megfogva lehetséges.
Az ablakok méretezése az ablak keretén körbe lehetséges. Egy-egy ablak méretezési mechanizmusa úgy működjön, mint pl a windows operációs rendszerben. Extra méretezési funkciók: fejlécen dupla klikk maximalizálás, az egyes sarkokon illetve az élek közepén lévő kontrol pontokon dupla klikk kitolja az adott irányba maximumig az ablakot. Maximális méret esetén a dupla klikk a fejlécen visszaálítja az ablakot előző méretére.
Az ablakok megnyitása úgy történik, hogy az első megnyitott ablak a munkaterület bal felső sarka felé nyílik meg (nem teljesen a sarokban). A következő ablak kicsit eltolva nyílik meg az előző ablak nyitási pozíciójától, hogy ne fedje le az előző ablakot. A következő ablakok is ugyanúgy működnek, csak kicsit eltolva nyílik meg az előző ablak nyitási pozíciójától.
Az ablakok kezeléséhez legyen központi z-index kezelő. Az első megnyitás z-index = 1, a második z-index = 2, a harmadik z-index = 3 stb. A z-index kezelő legyen központi komponens, amit a Moveable-svelte komponens segítségével lehet kezelni. Egy egy ablakra átkattintás esetén a z-indexe legyen az aktuális legmagasabb z-index + 1.
Egy-egy ablaknak az alábbi tulajdonságai legyenek:
- id: string (a megnyitandó app komponensből jön)
- title: string (a megnyitandó app komponensből jön)
- position: { x: number, y: number }
- size: { width: number, height: number }
- z-index: number
- isMaximized: boolean
- isMinimized: boolean
- isActive: boolean

Az ablakokat bal felső sarkában lévő gombokkal lehet maximalizálni, minimalizálni, bezárni.
Minimalizálás esetén az alkalmazás ablak nem látszódik majd a munkaterületen, vizuálisan a menübaron lesz látható gomb formájában. Egy alkalmazás ablak megnyitásakor is megjelenik a menüsávon az alkalmazás gomb. Az a gomb tükrözze vizuálisan az ablak állapotát (aktív, inaktív, minimalizált).
Ha minimalizálás után rákattintunk a menüsávon a gombra, akkor aktív és látható lesz az ablak (abba a méretben és pozícióban, ahonnan minimalzálás előtt volt). A nyitott ablakok esetén ha a maüság gombjára kattintunk, akkor aktívvá teszi az adott ablakot, a többit inaktívvá teszi. Ha egy ablak nyitva van és a start menüből újra megpróbáljuk megnyitni, akkor aktívvá teszi az adott ablakot (egyelőre nem lehet 1 alkalmazás ablakot többször megnyitni).

## Technikai megvalósítás

Kihasználva a svelte 5 frameworkot, a Moveable-svelte komponenst és a TailwindCSS 4 stíluskezelőt, valamint a Typescript-t, valósítható meg a fenti működés. A Moveable-svelte komponens segítségével lehet az ablakok mozgatását, méretezését és maximalizálását valósítani. A TailwindCSS segítségével lehet a felületet kialakítani, a Typescript segítségével lehet a komponenseket típussal kezelni.
Fontos hogy használva legyen a svelte 5 rúna kezelése. Szem előtt kell tartani a svelte 5 használati tanácsait, rúnák használata.
Svelte komponens szerkezet kialakítása:
- Desktop komponens: A teljes felületet fogja kezelni.
- Window komponens: Az ablakokat fogja kezelni.
- Window menedzser: a megnyitott ablakok kezelésért lesz felelős. ez tud arról hány ablak van nyitva, melyik ablakok, az ablakkezelő funkciókért felelős.

Az alkalmazás ablakok megnyitása technikailag úgy működjön, hogy dinamikus komponens importként legyen, tehát ne legyen az összes komponens importálva a Desktop komponensben, hanem csak akkor, amikor valóban megnyitjuk az adott komponenst. Az egyes alkalmazás komponensek szerkezeti felépítés úgy néz ki, hogy a lib/apps mappában vannak külön mappákban, pl app1, app2...stb. Az egyes app mappákban van az index.svelte fájl, amit dinamikusan importálunk a Desktop komponensben. Ez az index.svelte fájl a komponens központi fájlja, azt kell importálni.

### App komponens szerkezete

Az app komponens szerkezete a következőképpen néz ki:
Minden alkalmazás komponens tetején van egy script modul:
```svelte
<script lang="ts" context="module">
	export const meta = {
		title: 'Felhasználók',
		window: {
			width: 600, // px
			height: 400 // px
			// Alternatívák:
			// width: '50%',     // százalék
			// height: '60%',    // százalék
			// fullscreen: true  // teljes képernyő
		},
		helpId: 'app1Help'
	};
</script>
```

A title tartalmazza, hogy a megnyitott ablaknak mi lesz kiírva a fejlécébe. A window objektumban a width és height a komponens mérete, amivel első nyitáskor nyitni kell az ablakot. A helpId pedig egy opcionális érték, ami ha meg van adva, akkor a window komponens a bal felső sarokban a minimalizáló, maximalizáló, bezáró gombokhoz (elé) felvesz egy "segítség" gombot is, amire kattintva megnyit egy másik app komponenst (konkrétan a help app komponenst) és átadja a helpId értékét a help app komponensnek. Egy-egy app komponens tudjon fogadni paramétereket, amiket a nyitási funkcióval lehet átadni neki.
Úgy kell kialakítani az "openApp" funkciót, hogy dinamikusan importálja a komponenst, és megnyitja az ablakot. Ezt az openApp funkciót meg lehessen hívni bármelyik komponensből (desktop, start menu, bármelyik alkalmazás komponens, window komponens... szóval bárhonnan lehet hívni).

## Speciális ablakkezelő funkciók

Az ablakok kezelésénél legyenek animációk használva. Pl minimalizálás esetén "zsugorodjon" le az ablak a menüsávon lévő viszális gombjához. Amikor maximalizálunk (akár dupla klikk a fejlécen, akár dupla klikk a moveable kiemelt mértezési pontjain) akkor is animáltan növekedjen (vagy zsugorodjon) az ablak az új méretre.

## Fejlesztési követelmények

- nem lehet hiba a kódban a check script futtatásakor nem lehet hiba a kódban (bun run check ->
svelte-kit sync && svelte-check --tsconfig ./tsconfig.json)
- svelte 5 rúnák használata ahol csak lehet
- figyelembe kell venni, hogy jó performancia legyen
- "smooth" felhasználói élmény