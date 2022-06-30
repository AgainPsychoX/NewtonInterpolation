
/**
 * Returns greatest common divider for two given numbers.
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
const gcd = (a, b) => {
	while (b != 0) {
		const t = b;
		b = a % b;
		a = t;
	}
	return a;
}

class Fraction {
	static template = Fraction._prepareHTMLElementTemplate();

	static _prepareHTMLElementTemplate() {
		const fragment = document.createDocumentFragment();
		const element = document.createElement('span');
		element.classList.add('fraction');
		let _;
		element.appendChild((_ = document.createElement('span'), _.innerText = '(', _));
		element.appendChild((_ = document.createElement('span'), _));
		element.appendChild((_ = document.createElement('span'), _.innerText = '/', _));
		element.appendChild((_ = document.createElement('span'), _));
		element.appendChild((_ = document.createElement('span'), _.innerText = ')', _));
		fragment.appendChild(element);
		return fragment;
	}
	
	constructor(numerator, denominator = 1) {
		/**
		 * @type {number}
		 */
		this.numerator = numerator;
		/**
		 * @type {number}
		 */
		this.denominator = denominator;
		if (!denominator) {
			throw new RangeError(`denominator cannot be zero`);
		}
		if (isNaN(numerator)) {
			throw new RangeError(`numerator is not a number`);
		}
	}

	copy() {
		return new Fraction(this.numerator, this.denominator);
	}

	negate() {
		this.numerator *= -1;
		return this;
	}
	get isNegative() {
		return (this.numerator < 0) ^ (this.denominator < 0);
	}

	get isInteger() {
		return this.denominator == 1 || (this.numerator % this.denominator == 0);
	}

	add(other) {
		if (other instanceof Fraction) {
			if (this.denominator == other.denominator) {
				this.numerator += other.numerator;
			}
			else {
				this.numerator *= other.denominator 
				this.numerator += other.numerator * this.denominator;
				this.denominator *= other.denominator;
			}
		}
		else {
			this.numerator += this.denominator * other;
		}
		return this;
	}
	subtract(other) {
		if (other instanceof Fraction) {
			other.numerator *= -1;
			this.add(other);
			other.numerator *= -1;
		}
		else {
			this.numerator -= this.denominator * other;
		}
		return this;
	}

	multiply(other) {
		if (other instanceof Fraction) {
			this.numerator *= other.numerator;
			this.denominator *= other.denominator;
		}
		else {
			this.numerator *= other;
		}
		return this;
	}
	divideBy(other) {
		if (other instanceof Fraction) {
			this.numerator *= other.denominator;
			this.denominator *= other.numerator;
		}
		else {
			this.denominator *= other;
		}
		return this;
	}

	/**
	 * Simplifies the fraction by dividing numerator and denominator by their
	 * greatest common divider.
	 */
	simplify() {
		if (this.denominator < 0) {
			this.numerator *= -1;
			this.denominator *= -1;
		}
		const a = gcd(Math.abs(this.numerator), this.denominator);
		this.numerator /= a;
		this.denominator /= a;
		return this;
	}

	round(epsilon = Math.pow(10, -6), maxDenominator = undefined) {
		if (this.numerator == 0) {
			return this;
		}
		maxDenominator ||= 1 - Math.log10(epsilon);
		if (this.denominator <= maxDenominator) {
			return this;
		}
		const x = this.numerator / this.denominator;
		const a = Math.abs(x);
		let n = 0;
		let d = 1;
		let r;
		while (true) {
			r = n / d;
			if (Math.abs((r - a)  / a) < epsilon) {
				break;
			}
			if (r < a) {
				n++;
			}
			else {
				d++;
			}
		}
		this.numerator = x < 0 ? -n : n;
		this.denominator = d;
		return this;
	}

	/**
	 * Creates new fraction object from decimal number, optionally rounding.
	 * @param {number} decimal 
	 * @param {number | boolean} digits 
	 */
	static fromDecimal(decimal, digits = false) {
		if (digits) {
			const exp = Math.pow(10, digits);
			decimal = Math.round(decimal * exp) / exp;
		}
		return new Fraction(decimal).simplify();
	}

	toDecimal() {
		return this.numerator / this.denominator;
	}

	equals(other, epsilon = Number.EPSILON) {
		if (typeof other != 'number') {
			other = other.toDecimal();
		}
		return Math.abs(this.toDecimal() - other) < epsilon;
	}

	/**
	 * @param {FractionData} data 
	 * @returns 
	 */
	static fromData(data) {
		return new Fraction(data[0], data[1]);
	}
	/**
	 * @returns {FractionData}
	 */
	toData() {
		return [this.numerator, this.denominator];
	}

	toHTMLFragment(options = {}) {
		options = Object.assign({
			sign: true,
			forceFraction: false,
			digits: 6,
		}, options);
		options.maxDenominator ||= Math.pow(10, options.digits);
		this.simplify();
		const isNegative = this.numerator < 0;
		const { fragment, element, top, bottom } = Fraction.prepareHTMLElement();
		if (options.maxDenominator < this.denominator && !options.forceFraction) {
			let decimal = this.toDecimal();
			element.title = decimal;
			if (options.digits) {
				decimal = decimal.toFixed(options.digits).replace(/(\.[1-9]+)?\.?0*$/, '$1');
			}
			top.innerText = (!options.sign && decimal < 0) ? -decimal : decimal;
			element.classList.add('decimal');
		}
		else {
			element.title = this.toDecimal();
			top.innerText = (!options.sign && isNegative) ? -this.numerator : this.numerator;
			bottom.innerText = this.denominator;
			if (this.isInteger && !options.forceFraction) {
				element.classList.add('decimal');
			}
		}
		if (options.sign == 'safe' && isNegative) {
			element.classList.add('brackets');
		}
		return fragment;
	}

	toString(options = {}) {
		options = Object.assign({
			sign: true,
			forceFraction: false,
			digits: 6,
			safe: false,
		}, options);
		this.simplify();

		let numerator = (!options.sign && this.numerator < 0) ? -this.numerator : this.numerator;
		let denominator = this.denominator;
		if (options.digits) {
			numerator = numerator.toFixed(options.digits).replace(/(\.[1-9]+)?\.?0*$/, '$1');
			denominator = denominator.toFixed(options.digits).replace(/(\.[1-9]+)?\.?0*$/, '$1');
		}
		
		if (this.isInteger && !options.forceFraction) {
			if (numerator.startsWith('-') && (options.safe || options.sign == 'safe')) {
				return `(${numerator})`;
			}
			else {
				return numerator;
			}
		}
		else {
			if (options.safe) {
				return `(${numerator} / ${denominator})`;
			}
			else {
				return `${numerator} / ${denominator}`;
			}
		}
	}

	static prepareHTMLElement() {
		const fragment = Fraction.template.cloneNode(true);
		const element = fragment.firstElementChild;
		const top = element.querySelector('span:nth-child(2)');
		const bottom = element.querySelector('span:nth-child(4)');
		return { fragment, element, top, bottom };
	}
}
