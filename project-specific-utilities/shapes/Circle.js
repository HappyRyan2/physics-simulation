class Circle extends Shape {
	constructor(position, radius) {
		super();
		this.position = position ?? new Vector(0, 0);
		this.radius = radius ?? 1;
	}

	display(c) {
		c.beginPath();
		c.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
		c.fill();
	}
}
