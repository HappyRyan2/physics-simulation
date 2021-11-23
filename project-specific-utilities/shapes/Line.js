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

	rationalSlope() {
		return new Rational(
			this.endpoint1.y - this.endpoint2.y,
			this.endpoint1.x - this.endpoint2.x
		);
	}
	rationalYIntercept() {
		return this.rationalSlope().multiply(new Rational(-1n, 1n)).multiply(new Rational(this.endpoint1.x)).add(new Rational(this.endpoint1.y));
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

	distanceFrom(point) {
		if(this.endpoint1.x === this.endpoint2.x) {
			return Math.dist(point.x, this.endpoint1.x);
		}
		if(this.endpoint1.y === this.endpoint2.y) {
			return Math.dist(point.y, this.endpoint1.y);
		}
		const perpendicularSlope = -1 / this.slope();
		const intersection = Shape.lineIntersection(
			this,
			new Line(point.x, point.y, point.x + 1, point.y + perpendicularSlope)
		);
		return intersection.subtract(point).magnitude;
	}

	display(c = app.canvasIO.ctx) {
		if(this.endpoint1.x === this.endpoint2.x) {
			const x = this.endpoint1.x;
			c.strokeLine(x, -LENGTH, x, LENGTH);
		}
		const LENGTH = 1e5;
		const MAX_SLOPE = 1e5;
		if(this.isVertical()) {
			c.strokeLine(this.endpoint1.x, -LENGTH, this.endpoint1.x, LENGTH);
		}
		else {
			const slope = Math.max(Math.min(-MAX_SLOPE, this.slope()), MAX_SLOPE);
			c.strokeLine(
				this.endpoint1.x - LENGTH, this.endpoint1.y - LENGTH * slope,
				this.endpoint1.x + LENGTH, this.endpoint1.y + LENGTH * slope
			);
		}
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
testing.addUnit("Line.distanceFrom()", {
	"correctly returns the distance between the line and the point": () => {
		const line = new Line(0, 0, 1, 1);
		const point = new Vector(1, -3);
		const distance = line.distanceFrom(point);
		expect(distance).toApproximatelyEqual(2 * Math.SQRT2);
	},
	"works for vertical lines": () => {
		const line = new Line(2, 0, 2, 1);
		const point = new Vector(-1, 5);
		const distance = line.distanceFrom(point);
		expect(distance).toApproximatelyEqual(3);
	},
	"works for horizontal lines": () => {
		const line = new Line(0, 0, 2, 0);
		const point = new Vector(-3, -4);
		const distance = line.distanceFrom(point);
		expect(distance).toEqual(4);
	}
});
