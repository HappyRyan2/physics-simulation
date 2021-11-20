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
		const discriminant = (2 * slope * intercept - 2 * slope * circle.position.y - 2 * circle.position.x) ** 2 - 4 * (1 + slope ** 2) * (intercept ** 2 + circle.position.x ** 2 + circle.position.y ** 2 - radius ** 2 - 2 * intercept * circle.position.y);
		return discriminant >= 0;
	}
	static circleIntersectsSegment(circle, segment) {
		const intersections = Shape.circleSegmentIntersections(circle, segment);
		return (
			intersections.length !== 0 ||
			circle.position.subtract(segment.endpoint1).magnitude <= circle.radius
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
	static lineIntersectsSegment(line, segment, tolerance = 1e-10) {
		const intersection = Shape.lineIntersection(line, new Line(segment));
		if(intersection === Infinity) { return true; }
		else if(intersection === null) { return false; }
		else {
			return (
				(Math.min(segment.endpoint1.x, segment.endpoint2.x) - intersection.x <= tolerance && intersection.x - Math.max(segment.endpoint1.x, segment.endpoint2.x) <= tolerance) &&
				(Math.min(segment.endpoint1.y, segment.endpoint2.y) - intersection.y <= tolerance && intersection.y - Math.max(segment.endpoint1.y, segment.endpoint2.y) <= tolerance)
			);
		}
	}
	static lineIntersectsPolygon(line, polygon) {
		if(polygon.containsPoint(line.endpoint1)) { return true; }
		return polygon.edges().some(e => Shape.lineIntersectsSegment(line, e));
	}
	static polygonIntersectsSegment(polygon, segment) {
		if(polygon.containsPoint(segment.endpoint1)) { return true; }
		return polygon.edges().some(e => Shape.segmentIntersectsSegment(e, segment));
	}
	static polygonIntersectsPolygon(polygon1, polygon2) {
		if(polygon1.containsPoint(polygon2.vertices[0]) || polygon2.containsPoint(polygon1.vertices[0])) {
			return true;
		}
		for(const e1 of polygon1.edges()) {
			for(const e2 of polygon2.edges()) {
				if(Shape.segmentIntersectsSegment(e1, e2)) { return true; }
			}
		}
		return false;
	}
	static segmentIntersectsSegment(segment1, segment2, tolerance = 1e-10) {
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
				(Math.min(segment1.endpoint1.x, segment1.endpoint2.x) - intersection.x <= tolerance && intersection.x - Math.max(segment1.endpoint1.x, segment1.endpoint2.x) <= tolerance) &&
				(Math.min(segment1.endpoint1.y, segment1.endpoint2.y) - intersection.y <= tolerance && intersection.y - Math.max(segment1.endpoint1.y, segment1.endpoint2.y) <= tolerance) &&
				(Math.min(segment2.endpoint1.x, segment2.endpoint2.x) - intersection.x <= tolerance && intersection.x - Math.max(segment2.endpoint1.x, segment2.endpoint2.x) <= tolerance) &&
				(Math.min(segment2.endpoint1.y, segment2.endpoint2.y) - intersection.y <= tolerance && intersection.y - Math.max(segment2.endpoint1.y, segment2.endpoint2.y) <= tolerance)
			);
		}
	}
	intersects(shape) {
		if(!(shape instanceof Shape)) {
			throw new Error("Shape.intersects() expected a Shape object.");
		}
		const functions = [
			[Circle, Circle, Shape.circleIntersectsCircle],
			[Circle, Line, Shape.circleIntersectsLine],
			[Circle, Segment, Shape.circleIntersectsSegment],
			[Circle, Polygon, Shape.circleIntersectsPolygon],
			[Line, Line, Shape.lineIntersectsLine],
			[Line, Segment, Shape.lineIntersectsSegment],
			[Line, Polygon, Shape.lineIntersectsPolygon],
			[Polygon, Segment, Shape.lineIntersectsSegment],
			[Polygon, Polygon, Shape.polygonIntersectsPolygon],
			[Segment, Segment, Shape.segmentIntersectsSegment]
		];
		const [, , f1] = functions.find(([t1, t2]) => this instanceof t1 && shape instanceof t2) ?? [];
		if(f1) { return f1(this, shape); }
		const [, , f2] = functions.find(([t1, t2]) => this instanceof t2 && shape instanceof t1) ?? [];
		return f2(shape, this);
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
	static segmentIntersection(segment1, segment2, tolerance = 1e-10) {
		const intersection = Shape.lineIntersection(new Line(segment1), new Line(segment2));
		if(intersection === null) { return null; }
		else if(intersection === Infinity) {
			return (
				Math.max(segment1.endpoint1.x, segment1.endpoint2.x) >= Math.min(segment2.endpoint1.x, segment2.endpoint2.x) &&
				Math.max(segment1.endpoint1.y, segment1.endpoint2.y) >= Math.min(segment2.endpoint1.y, segment2.endpoint2.y)
			) ? intersection : null;
		}
		else {
			return (
				(Math.min(segment1.endpoint1.x, segment1.endpoint2.x) - intersection.x <= tolerance && intersection.x - Math.max(segment1.endpoint1.x, segment1.endpoint2.x) <= tolerance) &&
				(Math.min(segment1.endpoint1.y, segment1.endpoint2.y) - intersection.y <= tolerance && intersection.y - Math.max(segment1.endpoint1.y, segment1.endpoint2.y) <= tolerance) &&
				(Math.min(segment2.endpoint1.x, segment2.endpoint2.x) - intersection.x <= tolerance && intersection.x - Math.max(segment2.endpoint1.x, segment2.endpoint2.x) <= tolerance) &&
				(Math.min(segment2.endpoint1.y, segment2.endpoint2.y) - intersection.y <= tolerance && intersection.y - Math.max(segment2.endpoint1.y, segment2.endpoint2.y) <= tolerance)
			) ? intersection : null;
		}
	}

	static circleLineIntersections(circle, line) {
		if(line.endpoint1.x === line.endpoint2.x) {
			const lineX = line.endpoint1.x;
			if(circle.position.x - circle.radius <= lineX && lineX <= circle.position.x + circle.radius) {
				const yDist = Math.sqrt(circle.radius ** 2 - (circle.position.x - lineX) ** 2);
				return [
					new Vector(lineX, circle.position.y + yDist),
					new Vector(lineX, circle.position.y - yDist),
				];
			}
			else { return []; }
		}
		const slope = line.slope();
		const intercept = line.yIntercept();
		const radius = circle.radius;
		const coefA = 1 + slope ** 2;
		const coefB = (2 * slope * intercept - 2 * slope * circle.position.y - 2 * circle.position.x);
		const coefC = (intercept ** 2 + circle.position.x ** 2 + circle.position.y ** 2 - radius ** 2 - 2 * intercept * circle.position.y);
		const discriminant = (coefB ** 2) - (4 * coefA * coefC);
		if(discriminant < 0) { return []; }
		else if(discriminant === 0) {
			const x = -coefB / (2 * coefA);
			const y = slope * x + intercept;
			return [ new Vector(x, y) ];
		}
		else {
			const x1 = (-coefB + Math.sqrt(discriminant)) / (2 * coefA);
			const x2 = (-coefB - Math.sqrt(discriminant)) / (2 * coefA);
			const y1 = slope * x1 + intercept;
			const y2 = slope * x2 + intercept;
			return [ new Vector(x1, y1), new Vector(x2, y2) ];
		}
	}
	static circleSegmentIntersections(circle, segment, tolerance = 1e-10) {
		const intersections = Shape.circleLineIntersections(circle, new Line(segment));

		const left = Math.min(segment.endpoint1.x, segment.endpoint2.x);
		const right = Math.max(segment.endpoint1.x, segment.endpoint2.x);
		const top = Math.min(segment.endpoint1.y, segment.endpoint2.y);
		const bottom = Math.max(segment.endpoint1.y, segment.endpoint2.y);

		return intersections.filter(({ x, y }) => (
			(left - x <= tolerance && x - right <= tolerance) &&
			(top - y <= tolerance && y - bottom <= tolerance)
		));
	}
	static circlePolygonIntersections(circle, polygon) {
		let intersections = [];
		for(const edge of polygon.edges()) {
			for(const intersection of Shape.circleSegmentIntersections(circle, edge)) {
				if(!intersections.some(e => e.equals(intersection))) {
					intersections.push(intersection);
				}
			}
		}
		return intersections;
	}
	static polygonIntersections(polygon1, polygon2) {
		const intersections = [];
		for(const edge1 of polygon1.edges()) {
			for(const edge2 of polygon2.edges()) {
				const intersection = Shape.segmentIntersection(edge1, edge2);
				if(intersection instanceof Vector && !intersections.some(e => e.equals(intersection))) {
					intersections.push(intersection);
				}
			}
		}
		return intersections;
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
	},

	"returns false when the circle and the line do not intersect and the circle is not centered at the origin": () => {
		const circle = new Circle(50, 0, 5);
		const line = new Line(1, -1, 0, 100);
		const intersect = Shape.circleIntersectsLine(circle, line);
		expect(intersect).toEqual(false);
	},
	"returns true when the circle and the line intersect and the circle is not centered at the origin": () => {
		const circle = new Circle(50, 0, 5);
		const line = new Line(0, 2, 100, 2);
		const intersect = Shape.circleIntersectsLine(circle, line);
		expect(intersect).toEqual(true);
	},

	"works when the slope and the y-intercept of the line are not equal": () => {
		// regression test
		const circle = new Circle(10, 10, 5);
		const line = new Line(0, 14, 20, 14);
		const intersect = Shape.circleIntersectsLine(circle, line);
		expect(intersect).toEqual(true);
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
	},

	"returns false when the circle and the segment do not intersect and the circle is not centered at the origin": () => {
		const circle = new Circle(50, 0, 5);
		const segment = new Segment(1, -1, 0, 100);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(false);
	},
	"returns true when the circle and the segment intersect and the circle is not centered at the origin": () => {
		const circle = new Circle(50, 0, 5);
		const segment = new Segment(0, 2, 100, 2);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(true);
	},
	"returns true when the circle and the segment intersect and the circle is not centered at the origin - test case 2": () => {
		const circle = new Circle(309, 261, 50);
		const segment = new Segment(315.5, 411, 365.5, 211);
		const intersect = Shape.circleIntersectsSegment(circle, segment);
		expect(intersect).toEqual(true);
	},

	"works when the slope and the y-intercept of the line are not equal": () => {
		// regression test
		const circle = new Circle(10, 10, 5);
		const segment = new Segment(0, 14, 20, 14);
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
	},
	"correctly handles inputs that result in floating-point inaccuracies": () => {
		const circle = new Circle(222, 261, 50);
		const polygon = new Polygon(315.5, 411, 415.5, 411, 365.5, 211);
		const intersect = Shape.circleIntersectsPolygon(circle, polygon);
		expect(intersect).toEqual(false);
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
	},
	"can use a tolerance value when checking if the intersection is in the valid range": () => {
		const line = new Line(0, 3, 4, 3);
		const segment = new Segment(0, 0, 2, 2);
		const intersect1 = Shape.lineIntersectsSegment(line, segment);
		const intersect2 = Shape.lineIntersectsSegment(line, segment, 2);
		expect(intersect1).toEqual(false);
		expect(intersect2).toEqual(true);
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
	},
	"can use a tolerance value when checking if the intersection is in the valid range": () => {
		const segment1 = new Segment(0, 0, 2, 2);
		const segment2 = new Segment(0, 3, 4, 3);
		const intersect1 = Shape.segmentIntersectsSegment(segment1, segment2);
		const intersect2 = Shape.segmentIntersectsSegment(segment1, segment2, 2);
		expect(intersect1).toEqual(false);
		expect(intersect2).toEqual(true);
	}
});
testing.addUnit("Shape.polygonIntersectsSegment()", {
	"returns true when the polygon intersects the line segment": () => {
		const polygon = new Polygon(-1, -1, 1, -1, 0, 2);
		const segment = new Segment(-5, -5, 5, 5);
		const intersect = Shape.polygonIntersectsSegment(polygon, segment);
		expect(intersect).toEqual(true);
	},
	"returns false when the polygon does not intersect the line segment": () => {
		const polygon = new Polygon(-1, -1, 1, -1, 0, 2);
		const segment = new Segment(-5, -5, 5, -5);
		const intersect = Shape.polygonIntersectsSegment(polygon, segment);
		expect(intersect).toEqual(false);
	},
	"returns false when the polygon intersects the line but not the line segment": () => {
		const polygon = new Polygon(-1, -1, 1, -1, 0, 2);
		const segment = new Segment(-5, -5, -4, -4);
		const intersect = Shape.polygonIntersectsSegment(polygon, segment);
		expect(intersect).toEqual(false);
	},
	"returns true when the segment is contained within the polygon": () => {
		const polygon = new Polygon(-100, -100, 100, -100, 0, 200);
		const segment = new Segment(-5, -5, -4, -4);
		const intersect = Shape.polygonIntersectsSegment(polygon, segment);
		expect(intersect).toEqual(true);
	}
});
testing.addUnit("Shape.polygonIntersectsPolygon()", {
	"returns true when the polygons intersect": () => {
		const polygon1 = new Polygon(-1, -1, 1, -1, 0, 2);
		const polygon2 = new Polygon(1, 0, 1, -2, 3, -2, 3, 0);
		const intersect = Shape.polygonIntersectsPolygon(polygon1, polygon2);
		expect(intersect).toEqual(true);
	},
	"returns false when the polygons do not intersect": () => {
		const polygon1 = new Polygon(-1, -1, 1, -1, 0, 2);
		const polygon2 = new Polygon(3, 0, 3, -2, 5, -2, 5, 0);
		const intersect = Shape.polygonIntersectsPolygon(polygon1, polygon2);
		expect(intersect).toEqual(false);
	},
	"returns true when one polygon is contained within the other": () => {
		const polygon1 = new Polygon(-100, -100, 100, -100, 100, 100, -100, 100);
		const polygon2 = new Polygon(-1, -1, 1, -1, 0, 2);
		const intersect = Shape.polygonIntersectsPolygon(polygon1, polygon2);
		expect(intersect).toEqual(true);
	}
});
testing.addUnit("Shape.intersects()", {
	"returns true when the shapes intersect": () => {
		const circle = new Circle(0, 0, 5);
		const polygon = new Polygon(1, -10, 1, 10, 10, 0);
		const intersect1 = circle.intersects(polygon);
		const intersect2 = polygon.intersects(circle);
		expect(intersect1).toEqual(true);
		expect(intersect2).toEqual(true);
	},
	"returns false when the shapes do not intersect": () => {
		const line = new Line(0, 0, 1, 1);
		const segment = new Segment(0, 1, 1, 2);
		const intersect1 = line.intersects(segment);
		const intersect2 = segment.intersects(line);
		expect(intersect1).toEqual(false);
		expect(intersect2).toEqual(false);
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
testing.addUnit("Circle.circleLineIntersections()", {
	"correctly returns the points of intersection": () => {
		const circle = new Circle(3, 2, 5);
		const line = new Line(4, 4, 8, 8);
		const intersections = Shape.circleLineIntersections(circle, line);
		expect(intersections).toEqual([ new Vector(6, 6), new Vector(-1, -1) ]);
	},
	"returns an empty array when the circle and the line do not intersect": () => {
		const circle = new Circle(3, 2, 5);
		const line = new Line(0, 8, 1, 9);
		const intersections = Shape.circleLineIntersections(circle, line);
		expect(intersections).toEqual([]);
	},
	"correctly returns the points of intersection for vertical lines": () => {
		const circle = new Circle(0, 0, 13);
		const line = new Line(5, 0, 5, 1);
		const intersections = Shape.circleLineIntersections(circle, line);
		expect(intersections).toEqual([ new Vector(5, 12), new Vector(5, -12) ]);
	},
	"returns an empty array for vertical lines that do not intersect the circle": () => {
		const circle = new Circle(0, 0, 13);
		const line = new Line(100, 1, 100, 2);
		const intersections = Shape.circleLineIntersections(circle, line);
		expect(intersections).toEqual([  ]);
	}
});
testing.addUnit("Shape.circleSegmentIntersections()", {
	"correctly returns the points of intersection": () => {
		const circle = new Circle(3, 2, 5);
		const segment = new Segment(4, 4, 8, 8);
		const intersections = Shape.circleSegmentIntersections(circle, segment);
		expect(intersections).toEqual([ new Vector(6, 6) ]);
	}
});
testing.addUnit("Shape.circlePolygonIntersections()", {
	"correctly returns the points of intersection": () => {
		const circle = new Circle(3, 2, 5);
		const polygon = new Polygon(6, 2, 6, 8, 10, 8, 10, 2);
		const intersections = Shape.circlePolygonIntersections(circle, polygon);
		expect(intersections).toEqual([ new Vector(6, 6), new Vector(8, 2) ]);
	}
});
testing.addUnit("Shape.segmentIntersection()", {
	"correctly returns the intersection of the line segments": () => {
		const segment1 = new Segment(0, 0, 3, 3);
		const segment2 = new Segment(0, 2, 2, 0);
		const intersection = Shape.segmentIntersection(segment1, segment2);
		expect(intersection).toEqual(new Vector(1, 1));
	},
	"returns an empty array when there are no intersections": () => {
		const segment1 = new Segment(0, 0, 1, 1);
		const segment2 = new Segment(0, 3, 3, 0);
		const intersection = Shape.segmentIntersection(segment1, segment2);
		expect(intersection).toEqual(null);
	}
});
testing.addUnit("Shape.polygonIntersections()", {
	"correctly returns the intersections of the polygons": () => {
		const polygon1 = new Polygon([
			new Vector(0, 0),
			new Vector(0, 2),
			new Vector(2, 2),
			new Vector(2, 0)
		]);
		const polygon2 = new Polygon([
			new Vector(1, 1),
			new Vector(1, 3),
			new Vector(3, 3),
			new Vector(3, 1)
		]);
		const intersections = Shape.polygonIntersections(polygon1, polygon2);
		expect(intersections).toEqual([
			new Vector(1, 2),
			new Vector(2, 1)
		]);
	}
});
