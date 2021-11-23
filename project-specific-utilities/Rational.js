class Rational {
	constructor() {
		if(typeof arguments[0] === "number" && typeof arguments[1] === "number") {
			let [numerator, denominator] = arguments;
			while(numerator % 1 !== 0 || denominator % 1 !== 0) {
				numerator *= 10;
				denominator *= 10;
			}
			this.numerator = BigInt(numerator);
			this.denominator = BigInt(denominator);
		}
		else if(typeof arguments[0] === "bigint" && typeof arguments[1] === "bigint") {
			const [numerator, denominator] = arguments;
			this.numerator = numerator;
			this.denominator = denominator;
		}
		else if(typeof arguments[0] === "number") {
			const [number] = arguments;
			let numerator = number;
			let denominator = 1n;
			while(numerator % 1 !== 0) {
				denominator *= 10n;
				numerator *= 10;
			}
			this.numerator = BigInt(numerator);
			this.denominator = BigInt(denominator);
		}
		this.simplify();
	}

	multiply(rational) {
		return new Rational(
			this.numerator * rational.numerator,
			this.denominator * rational.denominator
		).simplify();
	}
	divide(rational) {
		return new Rational(
			this.numerator * rational.denominator,
			this.denominator * rational.numerator
		).simplify();
	}
	add(rational) {
		return new Rational(
			this.numerator * rational.denominator + this.denominator * rational.numerator,
			this.denominator * rational.denominator
		).simplify();
	}
	subtract(rational) {
		return new Rational(
			this.numerator * rational.denominator - this.denominator * rational.numerator,
			this.denominator * rational.denominator
		).simplify();
	}

	equals(rational) {
		return this.numerator * rational.denominator == this.denominator * rational.numerator;
	}

	toNumber() {
		return Number(this.numerator) / Number(this.denominator);
	}

	simplify() {
		if(this.numerator == 0n) {
			this.denominator = 1n;
			return this;
		}
		const gcd = Math.gcd(this.numerator, this.denominator);
		this.numerator /= gcd;
		this.denominator /= gcd;
		return this;
	}
}

testing.addUnit("Rational constructor", {
	"can create a simplified rational from a numerator and a denominator": () => {
		const rational = new Rational(3, 2);
		expect(rational.numerator).toStrictlyEqual(3n);
		expect(rational.denominator).toStrictlyEqual(2n);
	},
	"can create a simplified rational from a Number": () => {
		const rational = new Rational(1.2);
		expect(rational.numerator).toStrictlyEqual(6n);
		expect(rational.denominator).toStrictlyEqual(5n);
	},
	"can create a rational number from a non-integer numerator and denominator": () => {
		const rational = new Rational(1.2, 2.4);
		expect(rational).toEqual(new Rational(1, 2));
	}
});
testing.addUnit("Rational.simplify()", {
	"can simplify rational numbers": () => {
		const rational = new Rational(12, 36);
		expect(rational.numerator).toEqual(1);
		expect(rational.denominator).toEqual(3);
	},
	"works when the rational number is negative": () => {
		const rational = new Rational(-12, 36);
		expect(rational.numerator).toEqual(-1);
		expect(rational.denominator).toEqual(3);
	},
	"works when the numerator is zero": () => {
		const rational = new Rational(0, 123);
		expect(rational.numerator).toEqual(0);
		expect(rational.denominator).toEqual(1);
	}
});
testing.addUnit("Rational.multiply()", {
	"can multiply two rational numbers and simplify the result": () => {
		const r1 = new Rational(10, 3);
		const r2 = new Rational(3, 50);
		const product = r1.multiply(r2);
		expect(product).toEqual(new Rational(1, 5));
	}
});
testing.addUnit("Rational.divide()", {
	"can divide two rational numbers and simplify the result": () => {
		const r1 = new Rational(20, 3);
		const r2 = new Rational(70, 3);
		const quotient = r1.divide(r2);
		expect(quotient).toEqual(new Rational(2, 7));
	}
});
testing.addUnit("Rational.add()", {
	"can add two rational numbers and simplify the result": () => {
		const r1 = new Rational(1, 3);
		const r2 = new Rational(1, 6);
		const sum = r1.add(r2);
		expect(sum).toEqual(new Rational(1, 2));
	}
});
testing.addUnit("Rational.subtract()", {
	"can subtract two rational numbers and simplify the result": () => {
		const r1 = new Rational(1, 2);
		const r2 = new Rational(1, 3);
		const difference = r1.subtract(r2);
		expect(difference).toEqual(new Rational(1, 6));
	}
});
testing.run("Rational.simplify()");
