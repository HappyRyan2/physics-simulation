class Line extends Shape {
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
		else if(arguments[0] instanceof Segment) {
			const [segment] = arguments;
			this.endpoint1 = new Vector(segment.endpoint1);
			this.endpoint2 = new Vector(segment.endpoint2);
		}
	}

	slope() {
		return (this.endpoint1.y - this.endpoint2.y) / (this.endpoint1.x - this.endpoint2.x);
	}
	yIntercept() {
		return (-this.slope() * this.endpoint1.x) + this.endpoint1.y;
	}

	isVertical() {
		return this.endpoint1.x === this.endpoint2.x;
	}

	translate(vector) {
		if(!(vector instanceof Vector)) {
			return this.translate(new Vector(...arguments));
		}
		return new Line(this.endpoint1.add(vector), this.endpoint2.add(vector));
	}
	rotate(angle) {
		const result = new Line(new Vector(this.endpoint1), new Vector(this.endpoint2));
		result.endpoint1.angle += angle;
		result.endpoint2.angle += angle;
		return result;
	}

	angle() {
		return this.endpoint2.subtract(this.endpoint1).angle;
	}
}

testing.addUnit("Line constructor", {
	"can create a line from two endpoints": () => {
		const line = new Line(
			new Vector(1, 2),
			new Vector(3, 4)
		);
		expect(line.endpoint1).toEqual(new Vector(1, 2));
		expect(line.endpoint2).toEqual(new Vector(3, 4));
	},
	"can create a line from four numbers representing the x and y positions of the endpoints": () => {
		const line = new Line(1, 2, 3, 4);
		expect(line.endpoint1).toEqual(new Vector(1, 2));
		expect(line.endpoint2).toEqual(new Vector(3, 4));
	},
	"can create a Line from a Segment": () => {
		const segment = new Segment(1, 2, 3, 4);
		const line = new Line(segment);
		expect(line.endpoint1).toEqual(new Vector(1, 2));
		expect(line.endpoint2).toEqual(new Vector(3, 4));
	}
});
testing.addUnit("Line.slope()", {
	"correctly calculates the slope of the line": () => {
		const line = new Line(5, 6, 105, 106);
		const slope = line.slope();
		expect(slope).toEqual(1);
	}
});
testing.addUnit("Line.yIntercept()", {
	"correctly calculates the y-intercept of the line": () => {
		const line = new Line(5, 6, 105, 106);
		const intercept = line.yIntercept();
		expect(intercept).toEqual(1);
	}
});
testing.addUnit("Line.translate()", {
	"correctly returns the line after the translation": () => {
		const line = new Line(0, 0, 1, 1);
		const translated = line.translate(5, 0);
		expect(translated).toEqual(new Line(5, 0, 6, 1));
	},
	"does not modify the original line": () => {
		const line = new Line(0, 0, 1, 1);
		const translated = line.translate(5, 0);
		expect(line).toEqual(new Line(0, 0, 1, 1));
	}
});
testing.addUnit("Line.rotate()", {
	"correctly returns the line after the rotation about the origin": () => {
		const line = new Line(0, 0, 1, -1);
		const rotated = line.rotate(90);
		expect(rotated.endpoint1.x).toApproximatelyEqual(0);
		expect(rotated.endpoint1.y).toApproximatelyEqual(0);
		expect(rotated.endpoint2.x).toApproximatelyEqual(-1);
		expect(rotated.endpoint2.y).toApproximatelyEqual(-1);
	},
	"does not modify the original line": () => {
		const line = new Line(0, 0, 1, 1);
		const rotated = line.rotate(90);
		expect(line).toEqual(new Line(0, 0, 1, 1));
	}
});
testing.addUnit("Line.angle()", {
	"correctly returns the angle of a 0-degree line": () => {
		const line = new Line(0, 0, 1, 0);
		const angle = line.angle();
		expect(angle).toApproximatelyEqual(0);
	},
	"correctly returns the angle of a 45-degree line": () => {
		const line = new Line(0, 0, 1, -1);
		const angle = line.angle();
		expect(angle).toApproximatelyEqual(45);
	}
});
