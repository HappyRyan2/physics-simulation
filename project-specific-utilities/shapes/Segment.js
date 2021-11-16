class Segment extends Shape {
	constructor() {
		super();
		if([...arguments].every(v => typeof v === "number")) {
			const [x1, y1, x2, y2] = arguments;
			this.endpoint1 = new Vector(x1, y1);
			this.endpoint2 = new Vector(x2, y2);
		}
		else if([...arguments].every(v => v instanceof Vector)) {
			[this.endpoint1, this.endpoint2] = arguments;
		}
		else if(arguments[0] instanceof Line) {
			const [line] = arguments;
			this.endpoint1 = new Vector(line.endpoint1);
			this.endpoint2 = new Vector(line.endpoint2);
		}
	}

	isVertical() {
		return this.endpoint1.x === this.endpoint2.x;
	}

	translate(vector) {
		if(!(vector instanceof Vector)) {
			return this.translate(new Vector(...arguments));
		}
		return new Segment(this.endpoint1.add(vector), this.endpoint2.add(vector));
	}
	rotate(angle) {
		const result = new Segment(new Vector(this.endpoint1), new Vector(this.endpoint2));
		result.endpoint1.angle += angle;
		result.endpoint2.angle += angle;
		return result;
	}
}

testing.addUnit("Segment constructor", {
	"can create a Segment from two endpoints": () => {
		const segment = new Segment(
			new Vector(1, 2),
			new Vector(3, 4)
		);
		expect(segment.endpoint1).toEqual(new Vector(1, 2));
		expect(segment.endpoint2).toEqual(new Vector(3, 4));
	},
	"can create a Segment from four numbers representing the x and y positions of the endpoints": () => {
		const segment = new Segment(1, 2, 3, 4);
		expect(segment.endpoint1).toEqual(new Vector(1, 2));
		expect(segment.endpoint2).toEqual(new Vector(3, 4));
	},
	"can create a Segment from a Line": () => {
		const line = new Line(1, 2, 3, 4);
		const segment = new Segment(line);
		expect(segment.endpoint1).toEqual(new Vector(1, 2));
		expect(segment.endpoint2).toEqual(new Vector(3, 4));
	}
});
testing.addUnit("Segment.translate()", {
	"correctly returns the line segment after the translation": () => {
		const segment = new Segment(0, 0, 1, 1);
		const translated = segment.translate(5, 0);
		expect(translated).toEqual(new Segment(5, 0, 6, 1));
	},
	"does not modify the original line segment": () => {
		const segment = new Segment(0, 0, 1, 1);
		const translated = segment.translate(5, 0);
		expect(segment).toEqual(new Segment(0, 0, 1, 1));
	}
});
testing.addUnit("Segment.rotate()", {
	"correctly returns the line segment after the rotation about the origin": () => {
		const segment = new Segment(0, 0, 1, -1);
		const rotated = segment.rotate(90);
		expect(rotated.endpoint1.x).toApproximatelyEqual(0);
		expect(rotated.endpoint1.y).toApproximatelyEqual(0);
		expect(rotated.endpoint2.x).toApproximatelyEqual(-1);
		expect(rotated.endpoint2.y).toApproximatelyEqual(-1);
	},
	"does not modify the original line segment": () => {
		const segment = new Segment(0, 0, 1, 1);
		const rotated = segment.rotate(90);
		expect(segment).toEqual(new Segment(0, 0, 1, 1));
	}
});
