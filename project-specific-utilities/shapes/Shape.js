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
