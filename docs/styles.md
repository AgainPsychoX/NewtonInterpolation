
### Podział

Używane style podzielone mogą być na kategorie: 

* ogólne (plik `common.css`) - określające ogólne podstawowe zmiany wyglądu i funkcjonalności elementów; będące stylem szablonu strony,
* matematyczne (`math.css`; ) - określające style związane z wyświetlaniem wyrażeń matematycznych (w tym: wyrażenia, specjalne operatory, ułamki, wielomiany),
* i specyficzne dla tego konkretnego dokumentu (`index.css`).



### Uwaga

Style są "dokładniej udokumentowane" jak w [przykładowej "dokumentacji"](https://docs.google.com/document/d/1AuCjY3qDDV8E4m0Chl_63oq6ayzv-dTN/edit) w plikach `.css.txt` w folderze `docs/styles`.




### Kolory

Kolory strony:

* podstawowy: `dodgerblue`
* podstawowy wyróżniony (jaśniejszy): `skyblue`
* podstawowy tła (ciemniejszy): `royalblue`
* podstawowy subtelny (biały): `#DFEFFF`
* podstawowy subtelny (ciemny): `royalblue`




### Style ogólne

#### Style treści

* Całość strony ma standardowo modeł pudełkowy z uwzględnieniem obramowań, wyłączone marginesy i używa czcionki `Segoe UI`.

* Linki standardowo nie mają podkreślenia, ale są wyróżnione kolorem podstawowym, a po najechaniu - jego nieco wyróżnioną odmianą.

* Nagłówki, akapity i listy standardowo mają mały margines z wszystkich stron, poza górą, i są wyjustowane.

* Każda sekcja czy artykuł ma odstęp od dołu.

* Treści samodzielne (`figure`) mają standardowo być wycentrowana z małymi marginesami z góry i dołu. 

	* Zawartość (w tym podpis treści, `figcaption`) powinna mieć (osobny) mały margines z góry i dołu (pomocne w wyświetlaniu wielu elementów w jednym bloku).

	* W przypadku obrazów i grafik, powinny zajmować nie więcej niż całą szerokość dostępnego miejsca, i nie więcej niż połowa wysokości ekranu. Jeśli potrzeba, obraz powinien być skalowany.

	* W przypadku tabel, podobnie - poza minimalną szerokością, która powinna wynosić 2/3 dostępnego miejsca.

	* W przypadku tekstu (np. wyrażeń matematycznych lub cytatów) tekst powinien być standardowo wycentrowany.

	* W przypadku nadmiaru treści względem szerokości miejsca w poziomie, jest ona ukryta i wyświetlany jest pasek przewijania.

* Kontrolki z klasą `.error` mają czerwone obramowanie.

#### Style układu

* Całość wyświetlanego dokumentu musi być co najmniej wysokości widoku (okna).

* Nagłówek strony powinien zawierać nagłówek pierwszego stopnia, wydzielone przy użyciu tła, np. o kolorze podstawowym lub ciemniejszym, przy zachowaniu dobrego kontrastu dla tekstu.

* Nawigacja powinna być zbudowana z nieuporządkowanej listy linków lub przycisków, rozciągającej się w poziomie, wypełniającej wygodnie dostępną szerokość.

	* Elementy nawigacji (linki lub przyciski) powinny być podświetlone przy najechaniu i powinny mieć odpowiednie grubości by ułatwić kliknięcie.

	* Nawigacja jest oddzielona od treści przerywaną linią, jasną odmianą koloru podstawowego.

* Stopka strony powinna być wyświetlona na dole strony. Także w przypadku niewystarczającej ilości treści na stonie (bez paska przewijania).

* Standardowo treść stopki powinna być wycentrowana.

#### Style pomocnicze

* Klasa `.nice-container` pomaga wyświetlać treść w wygodnej szerokości wycentrowanej na ekranie (jeśli odpowiednio szeroki; responsywność).

* Klasa `.nice-table` pomaga wyświetlać treść w tabelach: 

	* Tabela i jej komórki posiadają jednolite obramowania,
	* Podświetlenie nagłówka tabeli kolorem podstawowym subtelnym,
	* Naprzemienne subtelne podświetlanie wierszy tabeli.



### Style matematyczne

* Klasa `.math` pomaga wyświetlać wyrażenia matematyczne, używając pochylonego stylu czcionki oraz większych odstępów między literami.

	* Wewnątrz znacznika treści samodzielnej, standardowo użyta jest większa czcionka by zwrócić uwagę i zwiększyć czytelność.

* Klasy `.big-math-operator` i `.big-math-operator` pomaga wyświetlać duże operatory matematyczne (suma, iloraz) oraz ich zawartość (wyrażenie, które obejmują).

* Klasy `.fraction` pomaga wyświetlać ułamki.

	* Licznik i mianownik są wyświetlane wycentrowanym mniejszym tekstem, są ułożone w kolumnę i oddzielone kreską.
	* Standardowo użyty jest tryb wyświetlania w lini.
	* Odpowiednie dzieci elementu wyświetlającego ułamek są ukryte, ale możliwe w zaznaczeniu (`(`, `/`, `)` - w celu ułatwienia kopiowania).
	* Wraz z klasą `.decimal`, tylko licznik powinien być wyświetlany.
	* Wraz z klasą `.brackets`, dodatkowo nawiasy powinny być wyświetlane.

* Klasa `.math-font` jak i paragrafy i znaczniki `<span>` klasy `.math` powinny używać alternatywnej czcionki dla wyrażeń matematycznych: `Georgia, math, 'Times New Roman', Times, serif`.

* Klasa `.polynomial` pomaga wyświetlać wielomiany.

	* Ukrywa się, ale umożliwia w zaznaczeniu przy kopiowaniu dekoracje indeksu górnego (`<span>` zawierający `^` wewnątrz `<sup>`).




### Style specyficzne dla konkretnego dokumentu

* Element adresu (`<address>`) wewnątrz stopki wyśrodkowuje i pochyla tekst. Zmienia grubość na nieco lżejszą i zwiększa nieco odstępy między literami. Wyłącza także zawijanie tekstu na spacjach, na rzecz ręcznego zarządzania przerwaniami (`<wbr>`).

* Klasa pomocnicza `.conditional-1200` wyświetla element (wg. zazwyczaj `<br>`) jeśli szerokość wyświetlania (okna) jest co najmniej `1200px`. Służy to ładniejszemu podziału na linie w pewnych przypadkach.

* Za załadowanej liście przykładów wyświetla się odpowiedni dla linków kursor, żeby zachęcić do kliknięcia (i tym samym, załadowania przykładu).

Wewnątrz sekcji kalkulatora (`#calculator`):

* Kontrolki (kalkulatora) są płynnie ułożone i mają wygodne odstępy i marginesy.

* Komórki tabeli w kalkulatorze są mają minimalną ustawioną szerokość i wyłączone zawijanie tekstu - tabela może być szersza niż ekran, w tym przypadku pojawi się pasek do przewijania.

* Miejsca do wprowadzania w tabeli (wprowadzanie punktów do interpolacji, każda składowa X i Y ma 2 pola: licznik i mianownik) są odpowiednio lekko wyróżnione; ich treść jest wycentrowana i mają większą minimalną szerokość.

* Komórki oznaczone klasami `.current`, `.warning` i `.error` mają odpowiednio niebieskie, pomarańczowe i czerwone cieniowanie w celu wyróżnienia.

* Klasa `.link` ma ustawione centrowanie i jest niewidoczna, jeśli sekcja kalkulatora ma klasę `.solving` (ukrywanie pustego bloku z linkiem w trakcie obliczeń).


