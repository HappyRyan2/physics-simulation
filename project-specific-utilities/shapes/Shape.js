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
	static circleIntersectsPolygon(circle, polygon) {
		return (
			polygon.containsPoint(circle.position) ||
			polygon.edges().some(e => Shape.circleIntersectsSegment(circle, e))
		);
	}
	static lineIntersectsLine(line1, line2) {
		return Shape.lineIntersection(line1, line2) !== null;
	}
	static lineIntersectsSegment(line, segment) {
		const intersection = Shape.lineIntersection(line, new Line(segment));
		if(intersection === Infinity) { return true; }
		else if(intersection === null) { return false; }
		else {
			return (
				(Math.min(segment.endpoint1.x, segment.endpoint2.x) <= intersection.x && intersection.x <= Math.max(segment.endpoint1.x, segment.endpoint2.x)) &&
				(Math.min(segment.endpoint1.y, segment.endpoint2.y) <= intersection.y && intersection.y <= Math.max(segment.endpoint1.y, segment.endpoint2.y))
			);
		}
	}
	static lineIntersectsPolygon(line, polygon) {
		if(polygon.containsPoint(line.endpoint1)) { return true; }
		return polygon.edges().some(e => Shape.lineIntersectsSegment(line, e));
	}
	static segmentIntersectsSegment(segment1, segment2) {
		const intersection = Shape.lineIntersection(new Line(segment1), new Line(segment2));
		if(intersection === null) { return false; }
		else if(intersection === Infinity) {
			return (
				Math.max(segment1.endpoint1.x, segment1.endpoint2.x) >= Math.min(segment2.endpoint1.x, segment2.endpoint2.x) &&
				Math.max(segment1.endpoint1.y, segment1.endpoint2.y) >= Math.min(segment2.endpoint1.y, segment2.endpoint2.y)
			);
		}
		else {
			return (
				(Math.min(segment1.endpoint1.x, segment1.endpoint2.x) <= intersection.x && intersection.x <= Math.max(segment1.endpoint1.x, segment1.endpoint2.x)) &&
				(Math.min(segment1.endpoint1.y, segment1.endpoint2.y) <= intersection.y && intersection.y <= Math.max(segment1.endpoint1.y, segment1.endpoint2.y)) &&
				(Math.min(segment2.endpoint1.x, segment2.endpoint2.x) <= intersection.x && intersection.x <= Math.max(segment2.endpoint1.x, segment2.endpoint2.x)) &&
				(Math.min(segment2.endpoint1.y, segment2.endpoint2.y) <= intersection.y && intersection.y <= Math.max(segment2.endpoint1.y, segment2.endpoint2.y))
			);
		}
	}

	static lineIntersection(line1, line2) {
		if(line1.isVertical() && line2.isVertical()) {
			return (line1.endpoint1.x === line2.endpoint1.x) ? Infinity : null;
		}
		else if(line1.isVertical() || line2.isVertical()) {
			const verticalLine = [line1, line2].find(v => v.isVertical());
			const otherLine = [line1, line2].find(v => !v.isVertical());
			return new Vector(
				verticalLine.endpoint1.x,
				otherLine.slope() * (verticalLine.endpoint1.x - otherLine.endpoint1.x) + otherLine.endpoint1.y
			);
		}

		const slope1 = line1.slope();
		const slope2 = line2.slope();
		if(slope1 === slope2) {
			return (line1.yIntercept() === line2.yIntercept()) ? Infinity : null;
		}
		const yIntercept1 = line1.yIntercept();
		const yIntercept2 = line2.yIntercept();
		const xIntersection = (yIntercept2 - yIntercept1) / (slope1 - slope2);
		const yIntersection = xIntersection * slope1 + yIntercept1;
		return new Vector(xIntersection, yIntersection);
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
testing.addUnit("Shape.circleIntersectsPolygon()", {
	"returns true when the circle and the polygon intersect": () => {
		const circle = new Circle(0, 0, 5);
		const polygon = new Polygon(
			1, -10,
			1, 10,
			10, 0
		);
		const intersect = Shape.circleIntersectsPolygon(circle, polygon);
		expect(intersect).toEqual(true);
	},
	"returns false when the circle and the polygon do not intersect": () => {
		const circle = new Circle(0, 0, 5);
		const polygon = new Polygon(
			-10, 10,
			10, 10,
			0, 20
		);
		const intersect = Shape.circleIntersectsPolygon(circle, polygon);
		expect(intersect).toEqual(false);
	},
	"returns true when the circle is contained within the polygon": () => {
		const circle = new Circle(0, 0, 2);
		const polygon = new Polygon(
			-10, 10,
			10, 10,
			10, -10,
			-10, -10
		);
		const intersect = Shape.circleIntersectsPolygon(circle, polygon);
		expect(intersect).toEqual(true);
	},
	"returns true when the polygon is contained within the circle": () => {
		const circle = new Circle(0, 0, 100);
		const polygon = new Polygon(
			-1, 10,
			1, 10,
			0, 11
		);
		const intersect = Shape.circleIntersectsPolygon(circle, polygon);
		expect(intersect).toEqual(true);
	}
});
testing.addUnit("Shape.lineIntersectsLine()", {
	"returns true when the lines intersect": () => {
		const line1 = new Line(0, 0, 10, 10);
		const line2 = new Line(0, 10, 10, 0);
		const intersect = Shape.lineIntersectsLine(line1, line2);
		expect(intersect).toEqual(true);
	},
	"returns false when the lines do not intersect": () => {
		const line1 = new Line(0, 10, 10, 20);
		const line2 = new Line(0, 0, 10, 10);
		const intersect = Shape.lineIntersectsLine(line1, line2);
		expect(intersect).toEqual(false);
	},
	"returns true when the lines have infinitely many intersections": () => {
		const line1 = new Line(0, 0, 1, 1);
		const line2 = new Line(2, 2, 3, 3);
		const intersect = Shape.lineIntersectsLine(line1, line2);
		expect(intersect).toEqual(true);
	},
});
testing.addUnit("Shape.lineIntersectsSegment()", {
	"returns true when the line intersects the segment": () => {
		const line = new Line(0, 0, 1, 1);
		const segment = new Segment(-5, -5, 5, 5);
		const intersect = Shape.lineIntersectsSegment(line, segment);
		expect(intersect).toEqual(true);
	},
	"returns false when the line does not intersect the segment": () => {
		const line = new Line(0, 0, 1, 1);
		const segment = new Segment(0, 1, 1, 2);
		const intersect = Shape.lineIntersectsSegment(line, segment);
		expect(intersect).toEqual(false);
	},
	"returns false when the intersection is on the line but not on the segment": () => {
		const line = new Line(0, 10, 10, 0);
		const segment = new Segment(0, 0, 1, 1);
		const intersect = Shape.lineIntersectsSegment(line, segment);
		expect(intersect).toEqual(false);
	}
});
testing.addUnit("Shape.lineIntersectsPolygon()", {
	"returns true when the line intersects the polygon": () => {
		const line = new Line(-5, -5, 5, 5);
		const polygon = new Polygon(0, -2, -1, 1, 1, 1);
		const intersect = Shape.lineIntersectsPolygon(line, polygon);
		expect(intersect).toEqual(true);
	},
	"returns false when the line does not intersect the polygon": () => {
		const line = new Line(-5, -5, 5, -5);
		const polygon = new Polygon(0, -2, -1, 1, 1, 1);
		const intersect = Shape.lineIntersectsPolygon(line, polygon);
		expect(intersect).toEqual(false);
	},
	"returns true when the line is contained within the polygon": () => {
		const line = new Line(-5, -5, 5, -5);
		const polygon = new Polygon(-100, -100, 100, -100, 100, 100, -100, 100);
		const intersect = Shape.lineIntersectsPolygon(line, polygon);
		expect(intersect).toEqual(true);
	}
});
testing.addUnit("Shape.segmentIntersectsSegment()", {
	"returns true when the line segments intersect": () => {
		const segment1 = new Segment(-5, -5, 5, 5);
		const segment2 = new Segment(-5, 5, 5, -5);
		const intersect = Shape.segmentIntersectsSegment(segment1, segment2);
		expect(intersect).toEqual(true);
	},
	"returns false when the line segments do not intersect": () => {
		const segment1 = new Segment(0, 0, 1, 1);
		const segment2 = new Segment(0, 1, 1, 2);
		const intersect = Shape.segmentIntersectsSegment(segment1, segment2);
		expect(intersect).toEqual(false);
	},
	"returns false when the lines intersect but the line segments do not": () => {
		const segment1 = new Segment(0, 0, 1, 1);
		const segment2 = new Segment(0, 10, 1, 10);
		const intersect = Shape.segmentIntersectsSegment(segment1, segment2);
		expect(intersect).toEqual(false);
	},
	"returns false when the lines overlap but the line segments do not": () => {
		const segment1 = new Segment(0, 0, 1, 0);
		const segment2 = new Segment(2, 0, 3, 0);
		const intersect = Shape.segmentIntersectsSegment(segment1, segment2);
		expect(intersect).toEqual(false);
	}
});

testing.addUnit("Shape.lineIntersection()", {
	"returns the intersection point for two lines that intersect": () => {
		const line1 = new Line(0, 0, 10, 10);
		const line2 = new Line(0, 10, 10, 0);
		const intersection = Shape.lineIntersection(line1, line2);
		expect(intersection).toEqual(new Vector(5, 5));
	},
	"returns null when the lines do not intersect": () => {
		const line1 = new Line(0, 0, 10, 10);
		const line2 = new Line(0, 10, 10, 20);
		const intersection = Shape.lineIntersection(line1, line2);
		expect(intersection).toEqual(null);
	},
	"returns Infinity when there are infinitely many intersections": () => {
		const line1 = new Line(0, 0, 5, 5);
		const line2 = new Line(5, 5, 10, 10);
		const intersection = Shape.lineIntersection(line1, line2);
		expect(intersection).toEqual(Infinity);
	},

	"returns null when the lines do not intersect and are vertical": () => {
		const line1 = new Line(0, 1, 0, 2);
		const line2 = new Line(1, 1, 1, 2);
		const intersection = Shape.lineIntersection(line1, line2);
		expect(intersection).toEqual(null);
	},
	"returns Infinity when there are infinitely many intersections and the lines are vertical": () => {
		const line1 = new Line(0, 1, 0, 2);
		const line2 = new Line(0, 3, 0, 4);
		const intersection = Shape.lineIntersection(line1, line2);
		expect(intersection).toEqual(Infinity);
	},
	"returns the intersection point when one of the lines is vertical": () => {
		const line1 = new Line(0, 1, 0, 2);
		const line2 = new Line(10, 20, 11, 21);
		const intersection = Shape.lineIntersection(line1, line2);
		expect(intersection).toEqual(new Vector(0, 10));
	}
});
