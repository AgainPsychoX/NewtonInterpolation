
# Interpolacja metodą Newtona

Projekt to strona/aplikacja z informacjami i kalkulatorem do interpolacji metodą Newtona.

#### Cechy i możliwości

* teoria i informacje o interpolacji metodą Newtona (w tym wzory i tabele przygotowane w HTML),
* kalkulator generujący tabelę ilorazów różnicowych i wielomian wynikowy interpolacji,
	* wejścia pozwalające na numeryczne wyrażenia rozszerzone o stałe (np. pi) i funkcje (np. sinus).
	* tryb krok po kroku (oraz opóźnienia),
	* pokazywanie i ukrywanie szczegółów,
	* skalowanie i wypełnianie tabelek wyjściowych,
* ładowanie przykładów z pliku JSON,
* generator przykładów (wbudowany w kalkulator),
* generowany pasek nawigacji z linkami do fragmentów strony,
* zadowalająca responsywność (także na telefonach),
* tryb ciemny (przełączany po kliknięciu na ikonkę lampki w prawej stronie stopki).





## Struktura plików

* `index.html` - główny plik strony, używa pozostałe zasoby, zawiera treść i ramę aplikacji.
* `scripts/` - folder z skryptami JavaScript aplikacji. <small>_Wylistowane w kolejności ładowania:_</small>
	* `structurer.js` - zawiera funkcje pomocnicze generujące menu na podstawie treści strony (sekcje, artykuły i odpowiednie nagłówki).
	* `Fraction.js` - zawiera głównie klasę `Fraction` służącą do obsługi ułamków (obliczenia, wyświetlanie).
	* `Polynomial.js` - zawiera głównie klasę `Polynomial` służącą do obsługi wielomianów (obliczenia, wyświetlanie).
	* `fractionInput.js` - zawiera pomocnicze metody do wprowadzania ułamków (w tym: implementacja parsera wyrażeń numerycznych z stałymi i funkcjami używająca ONP).
	* `NewtonInterpolationCalculator.js` - zawiera metody do obliczeń interpolacji, kontroler kroków (dla trybu krok po kroku) oraz klasę kapsułkującą funkcjonalności kalkulatora, wraz z generatorem przykładów.
	* `index.js` - główny i ostatni ładowany skrypt JavaScript, instancjonujący klasę kalkulatora, dołączający obsługę kontrolek ustawień (opcje kalkulatora, krok po kroku, tryb ciemny), wczytujący przykłady (asynchroniczne ładowanie JSON).
* `styles/` - folder z stylami kaskadowymi CSS aplikacji. <small>_Wylistowane w kolejności ładowania:_</small>
	* `common.css` - plik stylów skupiający się na zmianie wbudowanych standardowych stylów i przygotowaniu stylów generalnej struktury strony.
	* `math.css` - zawiera głównie pomocne style do wyświetlania elementów związanych z matematyką (ułamki, wielomiany).
	* `index.css` - główny plik stylów dla strony, zawierające specyficzne dla głównego pliku HTML style.





## Uwagi

* Link do JSONa do załadowania danych przykładów jest zamieniony na osadzony link URI `data:`, który pozwala na symulowanie zapytania, zwracający pre-generowaną zawartość. Do generowania tego linku istnieje prosta podstrona `prepare-data.html` (patrz kod).

* Obsługiwane stałe i funkcje przy wprowadzaniu wyrażeń numerycznych to: `pi`, `e`, `sqrt`, `cbrt`, `abs`, `min`, `max`, `pow`, `floor`, `ceil`, `round`, `sin`, `cos`, `tan`, `log`, `sign`.

* Eksperymentalne alternatywne wyświetlanie tabeli pośrednich wyników w kalkulatorze można przełączyć dwukrotnie klikając na nagłówek tabeli. W tym trybie, w przypadku nadmiaru treści tabela nie używa paska przewijania, ale najpierw rośnie od środka strony. 

* Kod strony, skryptów i styli przygotowane przez Patryka Ludwikowskiego w ramach projektu z przedmiotu Technologie Internetowe (2 rok informatyki), rok studencki 2021/22 na Uniwersytecie Rzeszowskim.

	Wymagana "dokumentacja" na rzecz zaliczenia przedmiotu jest umieszczona w folderze `docs`.

* Treści przygotowane przez Patryka Ludwikowskiego oraz Dominika Machnika w ramach ćwiczeń z przedmiotu Metody Numeryczne (2 rok informatyki), rok studencki 2021/22 na Uniwersytecie Rzeszowskim.





## Todo

_Po angielsku, bo tak mi wygodniej myśleć. Nie wszystkie elementy TODO będą wykonane - zawiera się także luźne pomysły i uwagi._

+ docs
+ trigonometric examples and inputs
	- ~~allow to use decimals (i.e. `123.456`).~~ Done.
	- ~~numerical expression inputs with constants and functions (i.e. `pi*sqrt(3)/2`).~~ Done.
	- buttons to insert constants and functions? _Is it really necessary?_
	- ~~allow to use decimals/roots from presets.~~ Works.
	- option to make example generator make use of those.
+ more examples!
+ step by step: show where from values are used? colors/arrows?
+ could add some theory text about matrixes approach.
+ local examples: 'Save to examples' button (local storage?).
+ refactor: use ECMAScript modules and/or Typescript.
	- **Not likely**, since `.mjs` do not work with `file://`...
	- **Why bother** - it already works fine-ish with JavaScript and `@jsdoc`.
+ embed GeoGebra graphs instead linking?
	- **I opt against**, page will become too messy, especially more complicated graphs could lag.




