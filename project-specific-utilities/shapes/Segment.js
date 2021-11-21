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

	distanceFrom(point) {
		if(this.endpoint1.x === this.endpoint2.x) {
			if(
				Math.min(this.endpoint1.y, this.endpoint2.y) <= point.y &&
				point.y <= Math.max(this.endpoint1.y, this.endpoint2.y)
			) {
				return Math.dist(point.x, this.endpoint1.x);
			}
			else {
				return Math.min(
					this.endpoint1.subtract(point).magnitude,
					this.endpoint2.subtract(point).magnitude
				);
			}
		}
		if(this.endpoint1.y === this.endpoint2.y) {
			if(
				Math.min(this.endpoint1.x, this.endpoint2.x) <= point.x &&
				point.x <= Math.max(this.endpoint1.x, this.endpoint2.x)
			) {
				return Math.dist(point.y, this.endpoint1.y);
			}
			else {
				return Math.min(
					this.endpoint1.subtract(point).magnitude,
					this.endpoint2.subtract(point).magnitude
				);
			}
		}

		const perpendicularSlope = -1 / new Line(this).slope();
		const intersection = Shape.lineIntersection(
			new Line(this),
			new Line(point.x, point.y, point.x + 1, point.y + perpendicularSlope)
		);
		if(
			(Math.min(this.endpoint1.x, this.endpoint2.x) <= intersection.x && intersection.x <= Math.max(this.endpoint1.x, this.endpoint2.x)) &&
			(Math.min(this.endpoint1.y, this.endpoint2.y) <= intersection.y && intersection.y <= Math.max(this.endpoint1.y, this.endpoint2.y))
		) {
			return intersection.subtract(point).magnitude;
		}
		return Math.min(
			this.endpoint1.subtract(point).magnitude,
			this.endpoint2.subtract(point).magnitude
		);
	}

	display(c = app.canvasIO.ctx) {
		const ENDPOINT_RADIUS = 5;
		c.fillCircle(this.endpoint1.x, this.endpoint1.y, ENDPOINT_RADIUS);
		c.fillCircle(this.endpoint2.x, this.endpoint2.y, ENDPOINT_RADIUS);
		c.strokeLine(this.endpoint1, this.endpoint2);
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
testing.addUnit("Segment.distanceFrom()", {
	"works when the minimal distance is on the segment": () => {
		const segment = new Segment(0, 0, 2, 2);
		const point = new Vector(0, 2);
		const distance = segment.distanceFrom(point);
		expect(distance).toEqual(Math.SQRT2);
	},
	"works when the minimal distance is not on the segment": () => {
		const segment = new Segment(0, 0, 2, 2);
		const point = new Vector(4, 4);
		const distance = segment.distanceFrom(point);
		expect(distance).toEqual(2 * Math.SQRT2);
	},
	"works when the line is vertical and the minimal distance is on the segment": () => {
		const segment = new Segment(0, 0, 0, 2);
		const point = new Vector(4, 1);
		const distance = segment.distanceFrom(point);
		expect(distance).toEqual(4);
	},
	"works when the line is vertical and the minimal distance is not on the segment": () => {
		const segment = new Segment(0, 0, 0, 2);
		const point = new Vector(3, -4);
		const distance = segment.distanceFrom(point);
		expect(distance).toEqual(5);
	},
	"works when the line is horizontal and the minimal distance is on the segment": () => {
		const segment = new Segment(0, 0, 2, 0);
		const point = new Vector(1, -17);
		const distance = segment.distanceFrom(point);
		expect(distance).toEqual(17);
	},
	"works when the line is horizontal and the minimal distance is not on the segment": () => {
		const segment = new Segment(0, 0, 2, 0);
		const point = new Vector(-3, -4);
		const distance = segment.distanceFrom(point);
		expect(distance).toEqual(5);
	}
});
