
### Struktura strony

Treści są skrócone dla łatwiejszego przybliżenia struktury. Osadzone w szablonie treści są przykładowe w celu zaprezentowania możliwości szablonu.

```pug
header
	.nice-container
		h1 Interpolacja metodą Newtona

nav
	.nice-container
		ul
			// Nawigacja jest generowana przez skrypt (`structurer.js`), według głównych nagłówków.

main
	article.nice-container

		// Ukryty nagłówek artykułu, żeby zaspokoić wymagania walidatorów HTML
		header(style="display: none;")
			h2 Interpolacja metodą Newtona
		
		section
			h2 Interpolacja
			p Bla blah...

		section
			h2 Konstrukcja inkrementalna
			
			h3 Prosta
			p Bla blah
			figure Wzór
			
			h3 Trzy punkty
			p Bla blah
			figure Wzór
			
			h3 Kolejne kroki
			p Bla blah
			figure Wzór

		section
			h2 Ilorazy różnicowe
			p Bla blah
			figure Wzór

			h3 Uogólnienie
			p Bla blah
			figure Wzór
			
			h3 Tabelka
			p Bla blah
			figure Tabelka
			p Bla blah
			figure Tabelka
			
			h3 Interpolacja
			p Bla blah
			figure Wzór

		section#examples
			h2 Przykłady
			ul
			.controls
				button(name='generateRandom') Generuj losowe
			p(style='color: gray; font-size: small; padding: 8px')
				| Kliknij na przykład, żeby pokazać w kalkulatorze poniżej.

		section#calculator
			h2 Kalkulator
			
			.controls
				label
					span Liczba znanych warto&sacute;ci:
					input(name='points' type='number' step='1' min='2' max='10' value='4' style='width: 40px;')
				label
					input(name='showResults' type='checkbox' checked='')
					span Pokaż rozwiązanie
				label
					input(name='showDetails' type='checkbox' checked='')
					span Pokaż szczegóły
				label
					input(name='stepByStep' type='checkbox' checked='')
					span Krok po kroku
				label
					span Opóźnienie (ms):
					input(name='delay' type='number' step='50' min='0' max='9950' value='0' style='width: 54px;')
				button(name='nextStep') Krok

			figure.expandable
				table.nice-table
					thead
						tr
							th.math(rowspan='2') i
							th.math(rowspan='2' style='width: 80px;')
								| x
								sub i
							th.math(rowspan='2' style='width: 80px;')
								| f(x
								sub i
								| )
							th.colspan-by-points-count(colspan='4') Ilorazy różnicowe
						tr.th-count-by-points-count
							th Rzędu 1
							th Rzędu 2
							th Rzędu 3
							th Rzędu 4
					tbody.math
						// Tabela jest aktualizowana przez skrypt.
			figure.expandable
				output.math.polynomial-grid.polynomial.raw(style='text-align: left;')
					// Tutaj będzie wyświetlony wielomian przed uproszczeniem
			figure
				output.polynomial.simplified(style='font-size: larger;')
					// Tutaj będzie wyświetlony wielomian po uproszczeniu
			p.link
				a(href='#' target='_blank') Sprawdź wykres na GeoGebra.org
					// Ten link będzie zaktualizowany 

		section#Bibliografia
			h2 Bibliografia
			ul
				li
					a(href='https://orionquest.github.io/Numacom/lectures/interpolation.pdf' target='_blank') Polynomial, Lagrange, and Newton Interpolation - Mridul Aanjaneya
				li
					a(href='https://en.wikipedia.org/wiki/Newton_polynomial' target='_blank') Newton polynomial - Wikipedia
				li
					a(href='https://pl.wikipedia.org/wiki/Interpolacja_(matematyka)' target='_blank') Interpolacja (matematyka) - Wikipedia
				li
					a(href='https://pl.wikipedia.org/wiki/Iloraz_r%C3%B3%C5%BCnicowy' target='_blank') Iloraz różnicowy - Wikipedia
				li
					a(href='https://pl.wikipedia.org/wiki/Interpolacyjne_metody_r%C3%B3%C5%BCnicowe' target='_blank') Interpolacyjne metody różnicowe - Wikipedia
				li
					a(href='https://www.youtube.com/watch?v=hcsBjizQ9X8' target='_blank')
						| Newton&apos;s Divided Differences Interpolation Polynomial Example - AF Math &amp; Engineering, YouTube
				li
					a(href='https://pythonnumericalmethods.berkeley.edu/notebooks/chapter17.05-Newtons-Polynomial-Interpolation.html' target='_blank') Newton&rsquo;s Polynomial Interpolation - Python Numerical Methods, Berkeley.edu

footer
	.nice-container(style='display: flex;')
		address
			| Przygotowane przez 
			a(href='mailto:patryk.ludwikowski.7@gmail.com') Patryka Ludwikowskiego
			wbr
			| oraz 
			a(href='mailto:dominik120801@gmail.com') Dominika Machnika
			wbr
			| w ramach 
			wbr
			|  ćwiczeń z Metod Numerycznych, 
			wbr
			br.conditional-1200
			| rok studencki 2021/22 
			wbr
			| na 
			a(href='https://ur.edu.pl/') Uniwersytecie Rzeszowskim
			| .
		
		// Kod &#x1F4A1; to używana ikonka 💡 z znaków UTF-8.
		div#darkMode(style='float: right; font-size: 3em; padding: 8px;') &#x1F4A1;
```


