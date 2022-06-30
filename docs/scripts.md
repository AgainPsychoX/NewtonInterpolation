
### Generalny przebieg głównego kodu

1. Zbadanie struktury głównej dokumentu i wygenerowanie nawigacji dla każdej głównej sekcji (skrypt `structurer.js`)
2. Ustawienie zmiennej `examplesDataURI` zawierającej link spod którego będą pobrane przykłady dla kalkulatora możliwe do załadowania (obecnie jest to link URI, bez wykorzystania serwera).
3. Załadowanie skryptów dostarczających klas i funkcji (`Fraction.js`, `Polynomial.js`, `fractionInputs.js`, `NewtonInterpolationCalculator.js`), oraz głównego skryptu (`index.js`).

	<sub>_Już w głównym skrypcie:_</sub>

4. Załadowanie ustawień (m.in. tryb ciemny jasny, ilość interpolowanych punktów, opóźnienie krok po kroku)
5. Przygotowanie obiektu klasy `NewtonInterpolationCalculator` kapsułkującej funkcjonalności kalkulatora interpolacji.
6. Dodanie obsługi zdarzeń dla przycisków interfejsu (m.in. liczba punktów, przełączniki pokazywania wyniku, szczegółów i kontrolki trybu krok po kroku) wykorzystując metody i pola obiektu `NewtonInterpolationCalculator`.
7. Załadowanie przykładów z linku, przekształcenie załadowanych danych na odpowiednio sformatowane i wyświetlone elementy listy (`#examples ul`), wraz z dodaniem dla nich obsługi kliknięcia w celu załadowania klikniętego przykładu.
8. Włączenie trybu ciemnego, jeśli takie ustawienie zostało wybrane. Dodanie obsługi zdarzeń do przycisku sterującym przełączaniem trybu ciemnego.
9. Przygotowanie do obliczeń, wygenerowanie losowego przykładu i obliczenie go jako pierwsze przykładowe rozwiązanie do wyświetlenia.



### Podział na klasy

* `Fraction` - klasa dostarczająca operacji na i wyświetlania ułamków. 

	_Pola:_

	* `numerator` (licznik ułamka),
	* `denominator` (mianownik ułamka),

	_Główne metody:_

	* operacji: `negate`, `add`, `subtract`, `multiply`, `divideBy` (bez uproszczenia po operacjach, dla wydajności), `equals` (sprawdzanie równości)
	* ogólne: `copy` (kopiowania obiektu), `simplify` (uproszczanie ułamka), `round` (zaokrąglanie ułamka do innego ułamka w celu ułatwienia wyświetlania lub późniejszych obliczeń),
	* `toDecimal` (sprowadzanie do liczby zmiennoprzecinkowej),
	* `toHTMLFragment` (przygotowuje nowy element HTML dla wyświetlenia ułamka opisywanego przez ten obiekt, według określonych ustawień),
	* `toString` (sprowadzenie ułamka do formy tekstowej, według określonych ustawień),
	
	_Główne funkcje statyczne:_

	* (poza klasą) `gcd` (największy wspólny dzielnik),
	* `fromDecimal` (alternatywny nazwany konstruktor generujący obiekt klasy z liczby zmiennoprzecinkowej, według określonej dokładności),
	* `prepareHTMLElement` (przygotowuje nowy element HTML dla wyświetlania ułamka)
	* `_prepareHTMLElementTemplate` (wywoływany przy ładowaniu klasy, przygotowuje szablon dla elementów HTML generowanych przez `prepareHTMLElement` i pośrednio `toHTMLFragment`, zapisywany do statycznej zmiennej `template` wewnątrz klasy).

	_Uwagi:_

	* Szablonowy element HTML ułamka ma postać:

		```html
		<span class="span">
			<span>(</span><!-- Niewidoczny element, dla łatwiejszego kopiowania -->
			<span>3</span><!-- Licznik ułamka -->
			<span>/</span><!-- Niewidoczny element, dla łatwiejszego kopiowania -->
			<span>4</span><!-- Mianownik ułamka -->
			<span>(</span><!-- Niewidoczny element, dla łatwiejszego kopiowania -->
		</span>
		```

* `Polynomial` - klasa dostarczająca operacji na i wyświetlania wielomianów. Korzysta z klasy `Fraction` do przechowywania współczynników wielomianu (tablica ułamków, od najwyższego do najniższego ułamka). 

	_Pola:_
	
	* `coefficients` (tablica współcznynników, obiekty klasy `Fraction`, od najniższego),
	* `degree` (stopień wielomianu, indeks pierwszego od najwyższego niezerowego współczynnika),

	_Główne metody:_

	* operacji: `add` (dodawanie do danej instancji), `multipiedBy` (tworzący nową instancje jako wynik mnożenia, nie modyfikujący składowych), brak innych operacji, bo nie były potrzebne do kalkulatora (choć było by możliwe bardzo proste dodanie m.in. `negate`, 
	`subtract`),
	* ogólne: `copy` (kopiowanie obiektu), `round` (zaokrąglanie wszystkich ułamków (współczynników), delegujący do metody `round` z `Fraction`), `equals` (sprawdzanie równości)
	* `toString` (sprowadzenie do formy tekstowej, według określonych ustawień),
	* `toHTMLFragment` (sprowadzenie do formy tekstowej, według określonych ustawień),
	* `_getDegree` (wylicza stopień wielomianu z współczynnikach, służy głównie do aktualizowania pola `degree`),

* `StepController` - klasa obsługująca tryb krok po kroku dla danego procesu, dostarczająca i zarządzająca asynchronicznymi "przystankami". 

	Przykład użycia tej klasy:

	```js
	const controller = new StepController();

	// Zarejestowanie jakiegoś zdażenia, które będzie prosić o kolejny krok.
	document.getElementById('#someButton').addEventListener('click', () => controller.next());

	const waitForStep = controller.prepare();	// `waitForStep` jest funkcją asynchroniczną, na której zakończenie - żądzanie kolejnego kroku - należy poczekać.

	console.log(0);
	
	// Kolejna część kodu, wypisanie '1', będzie wykonana jako kolejny krok.
	await waitForStep(); // Każde takie oczekiwanie można nazwać "przystanekiem".
	console.log(1);
	
	await waitForStep();
	console.log(2);
	```

	_Pola:_

	* `_drain` (flaga, jeśli ustawiona pozwalająca na natychmiastowe wykonanie kolejnych kroków),
	* `_interval` (uchwyt na generator interwały wywołań funkcji, która prosi o wykonanie kolejnego kroku),
	* `_reject` (funkcja do wywołania w przypadku błędu lub wymuszonego zakończenia),
	* `_resolve` (funkcja do wywołania dla wykonania kolejnego kroku)

	_Metody:_

	* `prepare` (przygotowuje instancje do działa, w tym opcjonalnie wymuszając zakończenie poprzedniego procesu; zwraca funkcje, która umożliwia tworzenie kolejnych "przystanków"),
	* `terminate` (wymusza zakończenie procesu),
	* `next` (prosi o wykonanie kolejnego kroku, jeśli proces jest w trakcie oczekiwania na taką prośbę),
	* `drain` (prosi o wykonywanie wszystkich kolejnych kroków, możliwie aż do zakończenia procesu)

* `NewtonInterpolationCalculator` - główna klasa zbierająca funkcjonalności kalkulatora, łącząca skrypt pozwalający na obliczenia z wyświecaniem wyników w dokumencie.

	_Pola:_

	* `container` (odwołanie do głównego kontenera/sekcji w strukturze DOM przechowującej wizualne części kalkulatora),
	* `_thead` (odwołanie do nagłówka tablicy wynikowej),
	* `_tbody` (odwołanie do ciała tablicy wynikowej),
	* `settings` (obiekt ustawień dla kalkulatora),
	* `_valuesForNumericExpressionsLookups` (pomocnicza tablica przechowująca pary (wartości zmiennoprzecinkowe) punktów (X/Y) interpolacyjnych, do relacyjnego obliczania kolejnych punktów z użyciem prostych wyrażeń numerycznych),
	* `_numericExpressionsFunctions` (mapa dodatkowych funkcji możliwych do użycia z poziomu prostych wyrażeń numerycznych, pozwala na np. odwołanie się do poprzednio obliczonych wartości punktów (`f`)),
	* `_numericExpressionsConstants` (mapa dodatkowych stałych możliwych do użycia z poziomu prostych wyrażeń numerycznych),
	* `solving` (flaga określająca czy proces rozwiązywania jest w trakcie działania),
	* `stepController` (przechowuje instancje klasy `StepController`),

	_Metody:_

	* `prepare` (przygotowuje kalkulator do działania, opcjonalnie z zmienionymi ustawieniami; na przygotowanie składa się m.in. przygotowanie tabeli pod daną ilość punktów (czyszczenie komórek tabeli; dodanie nowych lub usunięcie kilku, jeśli potrzeba; kontrolki do wprowadzania danych; aktualizowanie nagłówka tabeli; generowanie kolejnych wartości dla nowych komórek),
	* `hideResults` (czyści wyniki składowe z tablicy i wynikowe wielomiany),
	* `parsePointsFromInput` (pobiera wartości punktów (pary liczb zmiennoprzecinkowych) do interpolacji z kontrolek wprowadzania z tabeli),
	* `solve` (przeprowadza proces obliczenia interpolacji Newtona dla punktów danych w interfejsie kalkulatora; przeprowadza kolejne kroki odpowiednio aktualizując tablicę wyników składowych, tworzy odpowiednie wielomiany wynikowe (bez uproszczenia i z uproszczeniem) z wyników składowych, generuje link do serwisu GeoGebra dla wizualnej reprezentacji wyników),
	* `usePreset` (wypełnia dane wejściowe danymi przekazanego w argumencie przykładu; następnie zaczyna proces rozwiązywania, jeśli wybrano takie ustawienia kalkulatora),
	* `useRandom` (wypełnia dane wejściowe danymi losowymi (z funkcji `tryGenerateRandomPoints`, dla obecnie używanej liczby punktów); następnie zaczyna proces rozwiązywania, jeśli wybrano takie ustawienia kalkulatora),

	_Funkcje statyczne:_

	* `tryGenerateRandomPoints` (generuje losowy zbiór punktów do użycia z kalkulatorem, według wyznaczonych zasad (liczby punktów i powtórzeń); algorytm powtarza generowanie wielokrotnie w celu znalezienia bardziej interesujących (nie banalnych, ale i nie za trudnych) przykładów),



### Inne funkcje

* `saveSettings`/`loadSettings` - zapisywanie i odczytywanie ustawień przy użyciu Local Storage API.
* `dividedDifferencesGenerator`/`calculateDividedDifferences` - generator i funkcja wyczerpująca go dla kolejnych wartości tabeli pośrednich wyników (ilorazów różnicowych) dla algorytmu interpolacji metodą Newtona.
* `exploreDocumentStructure` - funkcja badająca rekurencyjnie strukturę dokumentu w poszukiwaniu sekcji i ich nagłówków.
* `_parseNumericExpressionToFloat` - główna funkcja interpretująca proste wyrażenia numeryczne możliwe do użycia w danych wejściowych kalkulatora (ładne użycie Odwrotnej Notacji Polskiej i tym samym stosu).
* `createFractionInput` - funkcja pomagająca tworzyć kontrolki do wprowadzania ułamków (pozycje punktów do interpolowania).



### Inne

* W treści w wzorze znajduje się duża klamra której wysokość najłatwiej ustalić przy użyciu JavaScriptu, by odpowiednio się wyświetlała na urządzeniach mobilnych itd.

	Zastosowano poniższy kawałek kodu:
	```js
	// W czasie załadowania tego skryptu, jest on ostatnim załadowanym, więc łatwo można odnieść się do miejsca w którym się on znajduje.
	const div = document.scripts[document.scripts.length - 1].parentElement;
	new ResizeObserver(() => {
		div.style.fontSize = div.parentElement.clientHeight - 1 + 'px';
	}).observe(div);
	```


