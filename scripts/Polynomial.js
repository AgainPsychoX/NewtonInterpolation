
class Polynomial {
	constructor(numbers, degree) {
		/**
		 * @type {Fraction[]}
		 */
		this.coefficients = numbers;
		for (let i = 0; i < numbers.length; i++) {
			if (typeof this.coefficients[i] == 'number') {
				this.coefficients[i] = new Fraction(this.coefficients[i], 1);
			}
		}
		this.degree = degree || this._getDegree();
	}

	_getDegree() {
		for (let i = this.coefficients.length - 1; 0 < i; i++) {
			if (this.coefficients[i]) {
				return i;
			}
		}
		return 0;
	}

	copy() {
		return new Polynomial([...this.coefficients].map(f => f.copy()), this.degree);
	}

	/**
	 * Adds other polynomial to current one.
	 * @param {Polynomial} other 
	 */
	add(other) {
		for (let i = this.coefficients.length; i < other.coefficients.length; i++) {
			this.coefficients[i] = new Fraction(0, 1);
		}
		for (let i = 0; i < other.coefficients.length; i++) {
			this.coefficients[i].add(other.coefficients[i]).simplify();
		}
		this.degree = this._getDegree();
		return this;
	}

	/**
	 * Multiplies current polynomial with other and returns result.
	 * @param {Polynomial} other 
	 */
	multipliedBy(other) {
		if (other instanceof Fraction) {
			return new Polynomial([...this.coefficients].map(x => x.copy().multiply(other)), this.degree);
		}
		else {
			const length = this.coefficients.length + other.coefficients.length - 1;
			const array = new Array(length);
			for (let i = 0; i < length; i++) {
				array[i] = new Fraction(0, 1);
			}
			for (let i = 0; i < this.coefficients.length; i++) {
				for (let j = 0; j < other.coefficients.length; j++) {
					array[i + j].add(this.coefficients[i].copy().multiply(other.coefficients[j]));
				}
			}
			for (let i = 0; i < length; i++) {
				array[i].simplify();
			}
			return new Polynomial(array);
		}
	}

	round(epsilon, maxDenominator) {
		for (let i = 0; i < this.coefficients.length; i++) {
			this.coefficients[i].round(epsilon, maxDenominator);
		}
		return this;
	}

	equals(other) {
		if (this.degree != other.degree) {
			return false;
		}
		for (let i = 0; i <= other.degree; i++) {
			if (this.coefficients[i] != other.coefficients[i]) {
				return false;
			}
		}
		return true;
	}

	toString(options = {}) {
		options = Object.assign({
			factorName: 'x',
		}, options)
		let str = '';
		for (let i = this.degree; 0 <= i; i--) {
			if (this.coefficients[i].numerator == 0) {
				continue;
			}
			str += this.coefficients[i].isNegative ? ' - ' : ' + ';
			if (i == 0) {
				str += this.coefficients[i].toString({sign: false});
			}
			else {
				if (!this.coefficients[i].equals(1)) {
					str += this.coefficients[i].toString({sign: false});
				}
				str += options.factorName;
				if (i != 1) {
					str += '^' + i;
				}
			}
		}
		if (str.startsWith(' + ')) {
			str = str.substring(3);
		}
		return str;
	}

	toHTMLFragment(options = {}) {
		options = Object.assign({
			forceFraction: false,
			digits: 6,
			maxDenominator: undefined,
		}, options);
		const fragment = document.createDocumentFragment();
		for (let i = this.degree; 0 <= i; i--) {
			if (this.coefficients[i].numerator == 0) {
				continue;
			}
			if (this.coefficients[i].isNegative) {
				fragment.appendChild(document.createTextNode(' - '));
			}
			else {
				fragment.appendChild(document.createTextNode(' + '));
			}
			if (i == 0) {
				fragment.appendChild(this.coefficients[i].toHTMLFragment({sign: false, ...options}));
			}
			else {
				if (!this.coefficients[i].equals(1)) {
					fragment.appendChild(this.coefficients[i].toHTMLFragment({sign: false, ...options}));
				}
				fragment.appendChild(document.createTextNode('x'));
				if (i != 1) {
					const sup = document.createElement('sup');
					const decor = document.createElement('span');
					decor.innerText = '^';
					sup.appendChild(decor);
					sup.appendChild(document.createTextNode(i));
					fragment.appendChild(sup);
				}
			}
		}
		if (fragment.firstChild.textContent == ' + ') {
			fragment.firstChild.remove();
		}
		return fragment;
	}
}
