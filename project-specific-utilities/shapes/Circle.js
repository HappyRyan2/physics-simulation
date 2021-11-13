class Circle extends Shape {
	constructor(position, radius) {
		this.position = position ?? new Vector(0, 0);
		this.radius = radius ?? 1;
	}
}
