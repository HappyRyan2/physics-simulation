class Circle extends Shape {
	constructor() {
		super();
		if([...arguments].every(v => typeof v === "number")) {
			const [x, y, r] = arguments;
			this.position = new Vector(x, y);
			this.radius = r;
		}
		else if(arguments[0] instanceof Vector && typeof arguments[1] === "number") {
			const [position, radius] = arguments;
			this.position = position ?? new Vector(0, 0);
			this.radius = radius ?? 1;
		}
	}

	translate(vector) {
		if(!(vector instanceof Vector)) {
			return this.translate(new Vector(...arguments));
		}
		return new Circle(this.position.add(vector), this.radius);
	}
	rotate(angle) {
		const result = new Circle(new Vector(this.position), this.radius);
		result.position.angle += angle;
		return result;
	}

	display(c) {
		c.beginPath();
		c.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
		c.fill();
	}
}

testing.addUnit("Circle constructor", {
	"can create a Circle from an x-position, a y-position, and a radius": () => {
		const circle = new Circle(1, 2, 3);
		expect(circle.position).toEqual(new Vector(1, 2));
		expect(circle.radius).toEqual(3);
	},
	"can create a Circle from a position and a radius": () => {
		const circle = new Circle(new Vector(1, 2), 3);
		expect(circle.position).toEqual(new Vector(1, 2));
		expect(circle.radius).toEqual(3);
	}
});
testing.addUnit("Circle.translate()", {
	"correctly returns the circle after the translation": () => {
		const circle = new Circle(1, 2, 100);
		const translated = circle.translate(3, 4);
		expect(translated).toEqual(new Circle(1 + 3, 2 + 4, 100));
	},
	"does not modify the original Circle": () => {
		const circle = new Circle(1, 2, 100);
		const translated = circle.translate(3, 4);
		expect(circle).toEqual(new Circle(1, 2, 100));
	}
});
testing.addUnit("Circle.rotate()", {
	"correctly returns the circle after the rotation about the origin": () => {
		const circle = new Circle(1, 2, 5);
		const rotated = circle.rotate(90);
		expect(rotated).toEqual(new Circle(2, -1, 5));
	},
	"does not modify the original Circle": () => {
		const circle = new Circle(1, 2, 5);
		const rotated = circle.rotate(90);
		expect(circle).toEqual(new Circle(1, 2, 5));
	}
});
