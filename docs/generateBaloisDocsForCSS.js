// Skrypt pomagający generować "dokumentacje" dla styli według wymagań zaliczenia.
// Nie wiem jak taka "dokumentacja" może być jakkolwiek pomocna, skoro jest nawet mniej czytelna niż kod (XD), ale jeśli takie jest wymaganie to postaram się je spełnić...

const fs = require('fs');

const path = process.argv[2];
const content = fs.readFileSync(path).toString()
	.replace(/\r\n/g, '\n')
	.replace(/\/\*[^\/]*\//g, '')
	.replace(/{[^\n]*/g, '')
	.replace(/[^\n]*}/g, '')
	.replace(/;[ \t]*\n/g, '\n')
	// .replace(/,[ \t]*\n/g, ', ')
	.replace(/\n\*/g, '\n(wszystko)')
	.replace(/:hover/gi, ' (po najechaniu kursorem)')
	.replace(/@media \(min-width: (\d+\w*)\)/gi, '(jeśli ekran ma co najmniej $1)')
	.replace(/@media \(max-width: (\d+\w*)\)/gi, '(jeśli ekran ma co najwyżej $1)')
	.replace(/(?:[ \t]*\n)+/g, '\n')
	.replace(/((?:\t| {2,})[^\n]*\n)(\S)/g, '$1\n$2')
;

fs.writeFileSync(path + '.txt', content);
