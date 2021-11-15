class Shape {
	static circleIntersectsCircle(circle1, circle2) {
		const distance = circle1.position.subtract(circle2.position).magnitude;
		return (distance <= circle1.radius + circle2.radius);
	}
	static circleIntersectsLine(circle, line) {
		if(line.endpoint1.x === line.endpoint2.x) {
			return Math.dist(line.endpoint1.x, circle.endpoint1.x) <= circle.radius;
		}
		const slope = line.slope();
		const intercept = line.yIntercept();
		const radius = circle.radius;
		return ((2 * slope * intercept) ** 2 - 4 * (slope ** 2 + 1) * (intercept ** 2 - radius ** 2)) >= 0;
	}
	static circleIntersectsSegment(circle, segment) {
		if(segment.endpoint1.x === segment.endpoint2.x) {
			if(Math.dist(segment.endpoint1.x, circle.position.x) > circle.radius) {
				return false;
			}
			const x = segment.endpoint1.x;
			const y1 = segment.endpoint1.y;
			const y2 = segment.endpoint2.y;
			const circleY1 = circle.position.y + Math.sqrt(circle.radius ** 2 - x ** 2);
			const circleY2 = circle.position.y - Math.sqrt(circle.radius ** 2 - x ** 2);
			return !(
				(y1 > circleY1 && y2 > circleY1) ||
				(y1 < circleY2 && y2 < circleY2)
			);
		}
		const radius = circle.radius;
		if(segment.endpoint1.subtract(circle.position).magnitude <= radius) {
			return true;
		}
		const slope = new Line(segment).slope();
		const intercept = new Line(segment).yIntercept();
		const discriminant = (2 * slope * intercept) ** 2 - 4 * (slope ** 2 + 1) * (intercept ** 2 - radius ** 2);
		if(discriminant < 0) {
			return false;
		}
		const xIntersection1 = ((-2 * slope * intercept) + Math.sqrt(discriminant)) / (2 * (slope ** 2 + 1));
		const xIntersection2 = ((-2 * slope * intercept) - Math.sqrt(discriminant)) / (2 * (slope ** 2 + 1));
		const minX = Math.min(segment.endpoint1.x, segment.endpoint2.x);
		const maxX = Math.max(segment.endpoint1.x, segment.endpoint2.x);
		return (
			(minX <= xIntersection1 && xIntersection1 <= maxX) ||
			(minX <= xIntersection2 && xIntersection2 <= maxX)
		);
	}
}


testing.addUnit("Shape.circleIntersectsCircle()", {
	"returns true when the circles intersect": () => {
		const circle1 = new Circle(10, 11, 5);
		const circle2 = new Circle(11, 12, 3);
		const intersect = Shape.circleIntersectsCircle(circle1, circle2);
		expect(intersect).toEqual(true);
	},
	"returns false when the circles do not intersect": () => {
		const circle1 = new Circle(10, 11, 3);
		const circle2 = new Circle(20, 15, 4);
		const intersect = Shape.circleIntersectsCircle(circle1, circle2);
		expect(intersect).toEqual(false);
	}
});
testing.addUnit("Shape.circleIntersectsLine()", {
	"returns true when the circle and the line intersect": () => {
		const circle = new Circle(0, 0, 5);
		const line = new Line(0, 1, 1, 2);
		const intersects = Shape.circleIntersectsLine(circle, line);
		expect(intersects).toEqual(true);
	},
	"returns false when the circle and the line do not intersect": () => {
		const circle = new Circle(0, 0, 5);
		const line = new Line(0, 10, 1, 11);
		const intersects = Shape.circleIntersectsLine(circle, line);
		expect(intersects).toEqual(false);
	}
});
testing.addUnit("Shape.circleIntersectsSegment()", {
	"returns true when the circle and the line segment intersect": () => {
		const circle = new Circle(0, 0, 5);
		const segment = new Segment(1, 1, 5, 5);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(true);
	},
	"returns false when the circle and the segment do not intersect": () => {
		const circle = new Circle(0, 0, 5);
		const segment = new Segment(0, 100, 1, 101);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(false);
	},
	"returns false when the line intersects the circle but the segment does not": () => {
		const circle = new Circle(0, 0, 5);
		const segment = new Segment(100, 100, 110, 110);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(false);
	},
	"returns true when the line segment is contained within the circle": () => {
		const circle = new Circle(0, 0, 5);
		const segment = new Segment(-1, -1, 1, 1);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(true);
	},

	"returns true when the circle and the line segment intersect and the line segment is vertical": () => {
		const circle = new Circle(0, 0, 5);
		const segment = new Segment(3, -5, 3, 0);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(true);
	},
	"returns false when the circle and the line segment do not intersect and the line is vertical": () => {
		const circle = new Circle(0, 0, 5);
		const segment = new Segment(10, 0, 10, 1);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(false);
	},
	"returns false when the line intersects the circle but the segment does not and the line segment is vertical": () => {
		const circle = new Circle(0, 0, 5);
		const segment = new Segment(0, 100, 0, 110);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(false);
	},
	"returns true when the line segment is vertical and is contained within the circle": () => {
		const circle = new Circle(0, 0, 5);
		const segment = new Segment(0, 0, 0, 1);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(true);
	}
});
