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
