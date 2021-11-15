class Shape {
	static circleIntersectsCircle(circle1, circle2) {
		const distance = circle1.position.subtract(circle2.position).magnitude;
		return (distance <= circle1.radius + circle2.radius);
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
