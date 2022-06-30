
/**
 * @typedef {{x: Fraction, y: Fraction}} Point
 */

/**
 * Generator for calculating divided differences for function passing given points.
 * @param {Point[]} points
 * @param {boolean} returnArray If true, last value returned by the generator is array of all results.
 * @returns {IterableIterator<Fraction>}
 */
const dividedDifferencesGenerator = function* (points, returnArray = false) {
	const result = new Array(points.length * (points.length - 1) / 2);
	// First column
	let i = 0;
	while (i < points.length - 1) {
		result[i] = points[i + 1].y.copy().subtract(points[i].y).divideBy(
			points[i + 1].x.copy().subtract(points[i].x)
		).simplify();
		yield result[i];
		i += 1;
	}
	// Next columns
	for (let j = 2; j < points.length; j++) {
		const a = points.length - j;
		for (let k = 0; k < a; k++) {
			result[i] = result[i - a].copy().subtract(result[i - a - 1]).divideBy(
				points[k + j].x.copy().subtract(points[k].x)
			).simplify();
			yield result[i];
			i += 1;
		}
	}
	if (returnArray) {
		return result;
	}
}

/**
 * Calculates divided differences for function passing given points.
 * @param {Point[]} points
 * @returns {Fraction[]}
 */
const calculateDividedDifferences = (points) => {
	const it = dividedDifferencesGenerator(points, true);
	let result = it.next();
	while (!result.done) {
		result = it.next();
	}
	return result.value;
}

class StepController {
	constructor () {}

	prepare(delay) {
		this.terminate();
		// TODO: detect double usage of the same controller?
		this._drain = false;
		
		if (typeof delay === 'number') {
			this._interval = setInterval(() => {
				this.next();
			}, delay);
		}

		return () => {
			return new Promise((resolve, reject) => {
				if (this._drain) {
					resolve()
				}
				else {
					this._reject = reject;
					this._resolve = resolve;
				}
			});
		}
	}

	async terminate() {
		clearInterval(this._interval);
		if (this._reject) {
			this._reject(new Error('solving process is being terminated'));
			this._reject = undefined;
		}
		return new Promise(resolve => setTimeout(resolve, 1));
	}

	next() {
		if (this._resolve) {
			this._resolve();
			this._resolve = undefined;
			this._reject = undefined;
		}
	}

	drain() {
		this._drain = true;
		this.next();
	}
}

/**
 * @typedef NewtonInterpolationCalculatorSettings
 * @property {number} [points]
 * @property {boolean} [showResults]
 * @property {boolean} [showDetails]
 * @property {number} [delay]
 * @property {boolean} [stepByStep]
 * @property {boolean} [roundInputs]
 * @property {number} [roundEpsilon]
 */

/**
 * ...
 */
class NewtonInterpolationCalculator {
	/**
	 * @param {HTMLElement} container 
	 * @param {NewtonInterpolationCalculatorSettings} settings 
	 */
	constructor(container, settings) {
		this.container = container;
		this._thead = container.querySelector('thead');
		this._tbody = container.querySelector('tbody');

		/**
		 * @type {NewtonInterpolationCalculatorSettings}
		 */
		this.settings = Object.assign({
			points: 4,
			showResults: true,
			showDetails: true,
			delay: 0,
			stepByStep: false,
			roundInputs: false,
			roundEpsilon: Math.pow(10, -9),
		}, settings);

		/**
		 * @type {Array<[number, number]>}
		 */
		this._valuesForNumericExpressionsLookups = [];
		/**
		 * @type {Record<string, Function>}
		 */
		this._numericExpressionsFunctions = {
			f: x => {
				const pair = this._valuesForNumericExpressionsLookups.find(p => p[0] == x);
				if (pair) {
					return pair[1];
				}
				else {
					console.warn(`Recursive function definition is invalid: Requesting f(${x}) which is not defined yet.`);
					return 0;
				}
			},
		};
		/**
		 * @type {Record<string, number>}
		 */
		this._numericExpressionsConstants = {};

		this.solving = false;
		this.stepController = new StepController();
	}

	/**
	 * Prepares calculator to work with new settings.
	 * @param {NewtonInterpolationCalculatorSettings | undefined} settings
	 */
	prepare(settings = {}) {
		const oldPoints = this.settings.points;
		
		if (settings) {
			Object.assign(this.settings, settings);
		}

		// Reset values lookup bank
		this._valuesForNumericExpressionsLookups.length = this.settings.points;

		const rowsRequired = this.settings.points * 2 - 1;

		// Remove obsolete rows over cap
		while (rowsRequired < this._tbody.childElementCount) {
			this._tbody.lastElementChild.remove();
		}

		// Add rows if necessary
		while (this._tbody.childElementCount < rowsRequired) {
			const hasInputs = this._tbody.childElementCount % 2 == 0;
			const row = document.createElement('tr');

			if (hasInputs) {
				const constants = Object.assign({}, this._numericExpressionsConstants);
				const functions = Object.assign({}, this._numericExpressionsFunctions);

				// Index
				const i = Math.floor(this._tbody.childElementCount / 2);
				constants.i = i;
				{
					const td = document.createElement('td');
					td.innerText = i;
					row.appendChild(td);
				}

				// X == x_i
				{
					const td = document.createElement('td');
					const div = createFractionInput((fraction) => {
						constants.x = fraction.toDecimal();
						if (this.settings.showResults) {
							this.solve();
						}
					}, constants, functions);
					td.appendChild(div);
					row.appendChild(td);
				}

				// Y == f(x_i)
				{
					const td = document.createElement('td');
					td.appendChild(createFractionInput((fraction) => {
						this._valuesForNumericExpressionsLookups[i] = [constants.x, fraction.toDecimal()];
						if (this.settings.showResults) {
							this.solve();
						}
					}, constants, functions));
					row.appendChild(td);
				}
			}

			this._tbody.appendChild(row);
		}

		// Make sure all rows have valid number of cells
		// Note: There should be `this.settings.points + 3` columns (i, x_i, f(x_i), ...).
		for (const child of this._tbody.children) {
			while (this.settings.points + 2 < child.childElementCount) {
				child.lastElementChild.remove();
			}
			while (child.childElementCount < this.settings.points + 2) {
				const td = document.createElement('td');
				td.innerHTML = '&nbsp;';
				child.appendChild(td);
			}
		}

		// Update table headers
		this._thead.querySelectorAll('.colspan-by-points-count').forEach(th => {
			th.setAttribute('colspan', this.settings.points - 1);
		});
		this._thead.querySelectorAll('.th-count-by-points-count').forEach(tr => {
			while (this.settings.points - 1 < tr.childElementCount) {
				tr.lastElementChild.remove();
			}
			let i = tr.childElementCount;
			while (tr.childElementCount < this.settings.points - 1) {
				const th = document.createElement('th');
				th.innerText = `Rzędu ${++i}`;
				tr.appendChild(th);
			}
		});

		// Add some natural continuation, if adding more points
		if (oldPoints < this.settings.points) {
			const inputs = this._tbody.querySelectorAll('input');
			for (let i = oldPoints * 4; i < inputs.length; i += 4) {
				const index = (i / 4) >> 0;
				inputs[i + 0].value = inputs[i - 4 + 0].value + "+1";
				inputs[i + 1].value = inputs[i - 4 + 1].value;
				inputs[i + 2].value = inputs[i - 4 + 2].value + "+1";
				inputs[i + 3].value = inputs[i - 4 + 3].value;

				// Dispatch change event, so inputs can revalidate
				inputs[i + 0].dispatchEvent(new Event('change'));
				inputs[i + 1].dispatchEvent(new Event('change'));
				inputs[i + 2].dispatchEvent(new Event('change'));
				inputs[i + 3].dispatchEvent(new Event('change'));
			}
		}

		if (!this.settings.showResults) {
			this.hideResults();
		}
	}

	hideResults() {
		const rows = this._tbody.querySelectorAll('tr');
		const rowsCount = 2 * this.settings.points - 1;
		const cells = [...rows].map(r => r.querySelectorAll('td'));
		for (let r = 0; r < rowsCount; r++) {
			for (let c = 3; c < this.settings.points + 2; c++) {
				cells[r][c].replaceChildren();
			}
		}
		const polynomialRawOutput = this.container.querySelector('.polynomial.raw');
		const polynomialOutput = this.container.querySelector('.polynomial.simplified');
		for (const output of [polynomialRawOutput, polynomialOutput]) {
			output.replaceChildren();
		}
	}

	/**
	 * Parses and validates points from inputs in the table.
	 * @returns {Point[]}
	 */
	parsePointsFromInputs() {
		const inputs = this._tbody.querySelectorAll('input');
		const points = new Array(inputs.length / 4);

		for (let i = 0; i < inputs.length; i += 4) {
			const index = (i / 4) >> 0;
			for (let j = 0; j < 4; j++) {
				if (inputs[i + j].classList.contains('error')) {
					throw new Error('some inputs contain errors');
				}
			}
			points[index] = {
				x: inputs[i + 0].fraction,
				y: inputs[i + 2].fraction,
			};
		}

		for (let i = 1; i < points.length; i++) {
			const tdCurrent = inputs[i * 4].closest('td');
			const tdPrevious = inputs[(i - 1) * 4].closest('td');
			if (points[i - 1].x.toDecimal() >= points[i].x.toDecimal()) {
				tdCurrent.classList.toggle('error', true);
				tdCurrent.title = `Poprzedni argument jest większy lub równy!`;
				tdPrevious.classList.toggle('warning', true);
				tdPrevious.title = `Następny argument jest mniejszy lub równy!`;
				throw new Error('arguments are not sorted');
			}
			else {
				tdCurrent.classList.toggle('error', false);
				tdPrevious.classList.toggle('warning', false);
			}
		}

		return points;
	}

	/**
	 * @typedef SolveOptions
	 * @property {string} [compareContext]
	 * @property {boolean} [roundInputs]
	 * @property {number} [roundEpsilon]
	 * @property {Function<Promise<void>> | number} [delay]
	 */

	/**
	 * Calculates next values and outputs for inputs of current state.
	 * @param {SolveOptions} options 
	 */
	async solve(options = {}) {
		if (this.solving) {
			throw new Error('already solving something!');
		}
		this.solving = true;
		this.container.classList.toggle('solving', true);

		try {
			options = Object.assign({
				compareContext: undefined,
			}, options);

			const stepDelay = (
				this.settings.stepByStep ? this.stepController.prepare() :
				this.settings.delay ? this.stepController.prepare(this.settings.delay) :
				() => new Promise(r => window.requestAnimationFrame(r)) // Useful when debugging
			);

			const rows = this._tbody.querySelectorAll('tr');
			const rowsCount = 2 * this.settings.points - 1;
			const cells = [...rows].map(r => r.querySelectorAll('td'));
			const polynomialRawOutput = this.container.querySelector('.polynomial.raw');
			const polynomialOutput = this.container.querySelector('.polynomial.simplified');

			console.debug(`Clearing the table and outputs`);
			for (let r = 0; r < rowsCount; r++) {
				for (let c = 3; c < this.settings.points + 2; c++) {
					cells[r][c].replaceChildren();
					cells[r][c].classList.toggle('current', false);
				}
			}
			for (const output of [polynomialRawOutput, polynomialOutput]) {
				output.replaceChildren();
			}

			console.debug(`Parsing inputs from table`);
			const points = this.parsePointsFromInputs();
			if (this.settings.roundInputs) {
				points[0].x.simplify().round(this.settings.roundEpsilon);
				points[0].y.simplify().round(this.settings.roundEpsilon);
			}
			else {
				points[0].x.simplify();
				points[0].y.simplify();
			}
			for (let i = 1; i < points.length; i++) {
				if (this.settings.roundInputs) {
					points[i].x.simplify().round(this.settings.roundEpsilon);
					points[i].y.simplify().round(this.settings.roundEpsilon);
				}
				else {
					points[i].x.simplify();
					points[i].y.simplify();
				}
			}

			console.debug(`Calculating divided differences`);
			const result = calculateDividedDifferences(points);

			console.debug(`Putting results into the table`);
			{
				const printCell = async (r, c, ya, yb, xa, xb, v) => {
					cells[r][c].classList.toggle('current', true);
					await stepDelay();
					if (this.settings.showDetails) {
						const { fragment, element, top, bottom } = Fraction.prepareHTMLElement();
						top.appendChild(ya.toHTMLFragment());
						top.appendChild(document.createTextNode(' - '));
						top.appendChild(yb.toHTMLFragment({sign: 'safe'}));
						bottom.appendChild(xa.toHTMLFragment());
						bottom.appendChild(document.createTextNode(' - '));
						bottom.appendChild(xb.toHTMLFragment({sign: 'safe'}));
						cells[r][c].appendChild(fragment);
						cells[r][c].appendChild(document.createElement('wbr'));
						cells[r][c].appendChild(document.createTextNode(' = '));
						await stepDelay();
					}
					cells[r][c].appendChild(v.toHTMLFragment());
					await stepDelay();
					cells[r][c].classList.toggle('current', false);
				}

				// First column
				let ri = 0;
				{
					const c = 3;
					while (ri < points.length - 1) {
						const r = ri * 2 + 1;
						await printCell(
							r, c, 
							points[ri + 1].y, points[ri].y, 
							points[ri + 1].x, points[ri].x, 
							result[ri]
						);
						ri += 1;
					}
				}
				// Next columns
				for (let j = 2; j < points.length; j++) {
					const c = j + 2;
					const a = points.length - j;
					for (let k = 0; k < a; k++) {
						const r = k * 2 + j;
						await printCell(
							r, c, 
							result[ri - a], result[ri - a - 1], 
							points[k + j].x, points[k].x, 
							result[ri]
						);
						ri += 1;
					}
				}
			}

			// Show polynomial in output fields
			console.debug(`Preparing polynomial output`);
			{
				const parts = [];
				let i = 0;
				for (let j = 1; j < points.length; j++) {
					const a = points.length - j;
					parts.push(result[i]);
					for (let k = 0; k < a; k++) {
						i++;
					}
				}

				let polynomial = new Polynomial([points[0].y.copy()]);

				const createDiv = (inner, ...rest) => {
					const div = document.createElement('div');
					if (typeof inner === 'string') {
						div.innerText = inner;
					}
					else {
						div.replaceChildren(inner, ...rest);
					}
					return div;
				}
				const firstPolynomialRawOutputDiv = createDiv('W(x)');
				polynomialRawOutput.replaceChildren(
					firstPolynomialRawOutputDiv,
					createDiv('='),
					createDiv(points[0].y.simplify().toHTMLFragment()),
				)
				const newtonPolynomialFragment = document.createDocumentFragment();
				let newtonPolynomial = new Polynomial([1]);
				for (let i = 0; i < this.settings.points - 1; i++) {
					await stepDelay();

					const x_i = points[i].x.simplify().copy();
					if (x_i.isNegative) {
						newtonPolynomialFragment.appendChild(document.createTextNode('(x + '));
					}
					else {
						newtonPolynomialFragment.appendChild(document.createTextNode('(x - '));
					}
					newtonPolynomialFragment.appendChild(x_i.toHTMLFragment({sign: false}));
					newtonPolynomialFragment.appendChild(document.createTextNode(')'));
					x_i.negate();
					newtonPolynomial = newtonPolynomial.multipliedBy(new Polynomial([x_i, 1]));

					const value = parts[i].simplify();
					if (value.isNegative) {
						polynomialRawOutput.appendChild(createDiv(' - '));
					}
					else {
						polynomialRawOutput.appendChild(createDiv(' + '));
					}
					polynomialRawOutput.appendChild(createDiv(
						value.toHTMLFragment({sign: false}),
						newtonPolynomialFragment.cloneNode(true)
					));
					polynomial.add(newtonPolynomial.multipliedBy(value));

					firstPolynomialRawOutputDiv.style.gridRow = `1 / ${i + 3}`;
				}

				await stepDelay();
				polynomialOutput.replaceChildren(
					document.createTextNode('W(x) = '), 
					polynomial.toHTMLFragment(),
				);

				await stepDelay();
				polynomial.round(this.settings.roundEpsilon);
				polynomialOutput.replaceChildren(
					document.createTextNode('W(x) = '), 
					polynomial.toHTMLFragment({maxDenominator: Infinity}),
				);

				let query = 'W(x)=' + polynomial.toString().replace(/ /g, '') + ';';
				if (options.compareContext) {
					query += options.compareContext + ';';
				}
				for (let i = 0; i < this.settings.points; i++) {
					const [x, y] = [points[i].x, points[i].y].map(v => v.toDecimal().toFixed(6).replace(/(\.[1-9]+)?\.?0*$/, '$1'));
					query += `A_${i}=(${x},${y});`;
				}
				console.debug(`Generated query for GeoGebra graphic calculator: ${query}`);
				const url = `https://www.geogebra.org/graphing?command=${encodeURIComponent(query)}`;
				this.container.querySelector('p.link a').href = url;
			}

			// TODO: show checking W(x_i) == f(x_i) ?

			console.debug(`Done`);
		}
		finally {
			this.solving = false;
			this.container.classList.toggle('solving', false);
		}
	};

	/**
	 * @typedef {number | string} NumericalExpression
	 * @typedef {[NumericalExpression, NumericalExpression]} FractionDefinition
	 * @typedef {NumericalExpression | FractionDefinition} PointDefinitionArgument
	 * @typedef {{x: PointDefinitionArgument, y: PointDefinitionArgument }} PointDefinition
	 * @typedef {{name?: string, points: PointDefinition[], function?: string, compareContext?: string}} ExampleDefinition
	 */

	/**
	 * Loads inputs preset.
	 * @param {ExamplePreset} example 
	 */
	async usePreset(example) {
		if (this.solving) {
			await this.stepController.terminate();
		}

		this.settings.points = example.points.length;
		this.prepare();

		// Prevent solving on each change event
		const oldShowResults = this.settings.showResults;
		this.settings.showResults = false;

		const inputs = this._tbody.querySelectorAll('input');
		// Each row have 2 cells (x_i, f(x_i)), each with 2 inputs (fraction numerator and denominator)
		for (let i = 0; i < inputs.length; i += 4) {
			const index = (i / 4) >> 0;
			if (Array.isArray(example.points[index].x)) {
				inputs[i + 0].value = example.points[index].x[0];
				inputs[i + 1].value = example.points[index].x[1];
			}
			else {
				inputs[i + 0].value = example.points[index].x;
				inputs[i + 1].value = 1;
			}
			if (Array.isArray(example.points[index].y)) {
				inputs[i + 2].value = example.points[index].y[0];
				inputs[i + 3].value = example.points[index].y[1];
			}
			else {
				if (typeof example.points[index].y == 'undefined') {
					inputs[i + 2].value = example.function || 'x';
					inputs[i + 3].value = 1;
				}
				else {
					inputs[i + 2].value = example.points[index].y;
					inputs[i + 3].value = 1;
				}
			}

			// Dispatch change event, so inputs can revalidate
			inputs[i + 0].dispatchEvent(new Event('change'));
			inputs[i + 1].dispatchEvent(new Event('change'));
			inputs[i + 2].dispatchEvent(new Event('change'));
			inputs[i + 3].dispatchEvent(new Event('change'));
		}

		// Revert solving prevention and actually solve
		this.settings.showResults = oldShowResults;
		if (this.settings.showResults) {
			this.solve({
				compareContext: example.compareContext || (example.function && `U(x)=${example.function}`),
			});
		}
	}

	async useRandom() {
		const points = await NewtonInterpolationCalculator.tryGenerateRandomPoints({
			points: this.settings.points,
			retries: Math.floor(Math.pow(17, 1 + Math.log(this.settings.points))),
		});
		if (!points) {
			throw new Error('failed generating points');
		}

		if (this.solving) {
			await this.stepController.terminate();
		}

		// Prevent solving on each change event
		const oldShowResults = this.settings.showResults;
		this.settings.showResults = false;

		const inputs = this._tbody.querySelectorAll('input');
		for (let i = 0; i < inputs.length; i += 4) {
			const index = (i / 4) >> 0;
			inputs[i + 0].value = points[index].x.numerator;
			inputs[i + 1].value = points[index].x.denominator;
			inputs[i + 2].value = points[index].y.numerator;
			inputs[i + 3].value = points[index].y.denominator;

			// Dispatch change event, so inputs can revalidate
			inputs[i + 0].dispatchEvent(new Event('change'));
			inputs[i + 1].dispatchEvent(new Event('change'));
			inputs[i + 2].dispatchEvent(new Event('change'));
			inputs[i + 3].dispatchEvent(new Event('change'));
		}

		// Revert solving prevention and actually solve
		this.settings.showResults = oldShowResults;
		if (this.settings.showResults) {
			this.solve();
		}
	}

	/**
	 * Generates set of points to be used with the calculator.
	 * @param {{points: number, retries?: number}} rules 
	 * @returns {{x: Fraction, y: Fraction}[]}
	 */
	static async tryGenerateRandomPoints(rules) {
		const retries = rules.retries || 100;
		let retriesLeft = retries;
		let bestPoints = undefined;
		let bestScore = -Infinity;
		let scores = [];
		const startTime = performance.now();
		while (retriesLeft--) {
			const points = new Array(rules.points);
			let x = Math.floor(Math.random() * 10 - 7);
			for (let i = 0; i < points.length; i++) {
				points[i] = {
					x: new Fraction(x, 1),
					y: new Fraction(Math.floor(Math.random() * 20 - 10), 1)
				};
				x += Math.floor(Math.random() * 10 + 1)
			}
			let score = 0;
			for (const value of dividedDifferencesGenerator(points)) {
				if (value.denominator == 1) {
					score += 1000;
				}
				score -= Math.abs(value.numerator) + value.denominator * 7;
			}
			scores.push(score);
			if (bestScore < score) {
				bestScore = score;
				bestPoints = points;
			}
		}
		const endTime = performance.now();
		console.debug(`Generated random set with score ${bestScore} in ${endTime - startTime}ms (${scores.length} attempts)`);
		//console.debug(scores.sort());
		return bestPoints;
	}
}
