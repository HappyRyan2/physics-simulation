class Polygon extends Shape {
	constructor() {
		super();
		if([...arguments].every(v => typeof v === "number")) {
			this.vertices = [];
			for(let i = 0; i < arguments.length; i += 2) {
				this.vertices[i / 2] = new Vector(arguments[i], arguments[i + 1]);
			}
		}
		else if(arguments[0].every(v => v instanceof Vector)) {
			[this.vertices] = arguments;
		}
		else {
			throw new Error("Unsupported input format.");
		}
	}

	display(c) {
		c.beginPath();
		c.moveTo(this.vertices[0].x, this.vertices[0].y);
		for(const vertex of this.vertices.slice(1)) {
			c.lineTo(vertex.x, vertex.y);
		}
		c.fill();
	}
}

testing.addUnit("Polygon constructor", {
	"can create a Polygon from an array of Vectors": () => {
		const vertices = [
			new Vector(0, 0),
			new Vector(1, 0),
			new Vector(0, 1)
		];
		const polygon = new Polygon(vertices);
		expect(polygon.vertices).toEqual(vertices);
	},
	"can create a Polygon from the x and y values of the vertices": () => {
		const polygon = new Polygon(1, 2, 3, 4, 5, 6);
		expect(polygon.vertices).toEqual([
			new Vector(1, 2),
			new Vector(3, 4),
			new Vector(5, 6)
		]);
	}
});
