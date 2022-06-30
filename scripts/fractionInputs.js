
const _round = (number, digits = 6) => {
	const exp = Math.pow(10, digits);
	return Math.round(number * exp) / exp;
}
const _roundWrap = (f, digits = 6) => {
	return (...args) => _round(f(...args), digits);
}

const _numericExpressionsConstants = {
	"π": Math.PI,
	"pi": Math.PI,
	"e": Math.E,
};
const _numericExpressionsFunctions = {
	"sqrt": Math.sqrt,
	"√": Math.sqrt,
	"cbrt": Math.cbrt,
	"∛": Math.cbrt,
	"abs": (a, b) => Math.abs(a, b),
	"min": (a, b) => Math.min(a, b),
	"max": (a, b) => Math.max(a, b),
	"pow": (a, b) => Math.pow(a, b),
	"floor": Math.floor,
	"ceil": Math.ceil,
	"round": Math.round,
	"sin": Math.sin,
	"cos": Math.cos,
	"tan": Math.tan,
	"log": Math.log,
	"sign": Math.sign,
};

const _operatorsToPriority = {
	'+': 1, 
	'-': 1,
	'*': 2,
	'/': 2,
	'%': 2,
	'^': 3,
};

/**
 * Note: Does not support all correct math expressions.
 * @param {string} text 
 * @param {Record<string, number>} constants
 * @param {Record<string, Function>} functions
 * @returns {number}
 */
const _parseNumericExpressionToFloat = (text, constants = {}, functions = {}) => {
	text = text.replace(/\s+/g, '').toLowerCase();

	let onp = [];
	{
		let previousWasValue = false;
		let sign = 1;
		const stackValues = [];
		const stackPriorities = [];

		let i = 0;
		while (i < text.length) {
			let o = text.charCodeAt(i);

			// number: `-?[0-9]+`
			if (o == 45) {
				sign = -1;
				o = text.charCodeAt(++i);
			}
			else {
				sign = 1;
			}
			if (48 <= o && o <= 57) {
				let j = i;
				while (j < text.length) {
					o = text.charCodeAt(++j);
					if (o != 46 && o < 48 || 57 < o) {
						break;
					}
				}
				if (previousWasValue) {
					stackValues.push('+');
					stackPriorities.push(_operatorsToPriority['+']);
				}
				onp.push(parseFloat(text.substring(i, j) * sign));
				i = j;
				previousWasValue = true;
				continue;
			}
			if (sign == -1) {
				sign = 1;
				o = text.charCodeAt(--i);
			}

			// bracket opening: `(`
			if (o == 40) {
				if (previousWasValue) {
					stackValues.push('*');
					stackPriorities.push(_operatorsToPriority['*']);
				}
				stackValues.push('(');
				stackPriorities.push(0);
				i += 1;
				previousWasValue = false;
				continue;
			}

			// bracket ending: `)`
			if (o == 41) {
				let k = stackValues.length - 1;
				let found = false;
				while (0 <= k) {
					if (stackValues[k--] == '(') {
						found = true;
						stackValues.pop();
						stackPriorities.pop();
						break;
					}
					onp.push(stackValues.pop());
					stackPriorities.pop();
				}
				if (!found) {
					throw new Error('Missing brackets while parsing math expression to RPN');
				}
				if (typeof stackValues[k] == 'function') {
					onp.push(stackValues.pop());
					stackPriorities.pop();
				}
				i += 1;
				previousWasValue = true;
				continue;
			}

			// ignore comma
			if (o == 44) {
				previousWasValue = false;
				i += 1;
				continue;
			}

			// operator: `[+\-*/%]`
			const c = text.charAt(i);
			const priority = _operatorsToPriority[c];
			if (priority) {
				let k = stackValues.length;
				while (0 <= --k) {
					if (priority < stackPriorities[k]) {
						onp.push(stackValues.pop());
						stackPriorities.pop();
					}
				}
				stackValues.push(c);
				stackPriorities.push(priority);
				i += 1;
				previousWasValue = false;
				continue;
			}

			// function, constant or variable: `[^0-9()]*`
			{
				if (previousWasValue) {
					stackValues.push('*');
					stackPriorities.push(_operatorsToPriority['*']);
				}

				let j = i + 1;
				while (j < text.length) {
					o = text.charCodeAt(j);
					if ((48 <= o && o <= 57) || o == 40 || o == 41) {
						break;
					}
					if (_operatorsToPriority[text.charAt(j)]) {
						break;
					}
					j += 1;
				}
				const str = text.substring(i, j);
				if (functions[str]) {
					stackValues.push(functions[str]);
					stackPriorities.push(1024);
					previousWasValue = false;
				}
				else if (typeof constants[str] != 'undefined') {
					onp.push(constants[str]);
					previousWasValue = true;
				}
				else if (_numericExpressionsFunctions[str]) {
					stackValues.push(_numericExpressionsFunctions[str]);
					stackPriorities.push(1024);
					previousWasValue = false;
				}
				else if (_numericExpressionsConstants[str]) {
					onp.push(_numericExpressionsConstants[str]);
					previousWasValue = true;
				}
				else {
					throw new Error(`Unknown function or constant name while parsing math expression to RPN: '${str}'`);
				}
				i = j;
			}
		}

		let k = stackValues.length;
		while (0 <= --k) {
			onp.push(stackValues.pop());
		}
	}

	const stack = [];
	for (let i = 0; i < onp.length; i++) {
		const e = onp[i];
		if (typeof e == 'number') {
			stack.push(e);
		}
		else if (typeof e == 'string') {
			const a = stack.pop();
			const b = stack.pop();
			switch (e) {
				case '+': stack.push(b + a); break;
				case '-': stack.push(b - a); break;
				case '*': stack.push(b * a); break;
				case '/': stack.push(b / a); break;
				case '%': stack.push(b % a); break;
				case '^': stack.push(Math.pow(b, a)); break;
			}
		}
		else if (typeof e == 'function') {
			const args = stack.splice(stack.length - e.length, e.length);
			stack.push(e(...args));
		}
	}

	return stack.reduce((prev, curr) => prev + curr);
}

const assertFloat = (a, b, s, e = 0.0000001) => console.assert(Math.abs(a - b) < e, s || `${a} =/= ${b}`);
const assertParseNumericExpressionToFloat = (e, v, c) => {
	const a = _parseNumericExpressionToFloat(e, c);
	assertFloat(a, v, `'${e}' should evaluate to ${v} but equals ${a}`);
};
assertParseNumericExpressionToFloat(' 2 + 3 ', 5);
assertParseNumericExpressionToFloat('-2-5', -7);
assertParseNumericExpressionToFloat('2+3*4', 14);
assertParseNumericExpressionToFloat('-2(-4-1)', 10);
assertParseNumericExpressionToFloat(' -45 + 18 sqrt(e) ', -15.3230171);
assertParseNumericExpressionToFloat('sin(i-3)', Math.sin(4-3), {i: 4});
assertParseNumericExpressionToFloat('max(-7, 6)', 6);

/**
 * @callback FractionInputOnChange
 * @param {Fraction} fraction
 * @param {'numerator' | 'denominator'} source
 * @param {HTMLInputElement} numeratorInput
 * @param {HTMLInputElement} denominatorInput
 * @param {Event} event
 */

/**
 * Creates fraction input - two numeric expression bounded together, including Fraction API.
 * @param {FractionInputOnChange} onChange 
 * @param {Record<string, number>} constants
 * @param {Record<string, Function>} functions
 * @returns {DocumentFragment}
 */
const createFractionInput = (onChange, constants = {}, functions = {}) => {
	onChange ||= () => {};
	const div = document.createElement('div');
	div.classList.add('fraction');

	const fraction = new Fraction(0);
	const numeratorInput = document.createElement('input');
	const denominatorInput = document.createElement('input');

	for (const input of [numeratorInput, denominatorInput]) {
		input.type = 'text';
		input.inputMode = 'numeric';
		input.addEventListener('input', function () {
			this.style.minWidth = 2 + this.value.length + 'ch';
		})
		input.fraction = fraction;
		div.appendChild(input);
	}

	numeratorInput.addEventListener('change', (ev) => {
		try {
			const value = _parseNumericExpressionToFloat(numeratorInput.value, constants, functions);
			numeratorInput.title = value;
			numeratorInput.classList.toggle('error', false);
			numeratorInput.fraction.numerator = value;
			onChange(fraction, 'numerator', numeratorInput, denominatorInput, ev);
		}
		catch (e) {
			numeratorInput.classList.toggle('error', true);
			numeratorInput.title = e.message;
		}
	});
	denominatorInput.addEventListener('change', (ev) => {
		try {
			const value = _parseNumericExpressionToFloat(denominatorInput.value, constants, functions);
			if (value == 0) {
				denominatorInput.classList.toggle('error', true);
				denominatorInput.title = `Mianownik nie może być równy zero!`;
			}
			else {
				denominatorInput.title = value;
				denominatorInput.classList.toggle('error', false);
				denominatorInput.fraction.denominator = value;
				onChange(fraction, 'denominator', numeratorInput, denominatorInput, ev);
			}
		}
		catch (e) {
			denominatorInput.classList.toggle('error', true);
			denominatorInput.title = e.message;
		}
	});

	return div;
}
