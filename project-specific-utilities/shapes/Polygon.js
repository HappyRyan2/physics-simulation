class Polygon extends Shape {
	constructor(vertices) {
		super();
		this.vertices = vertices;
	}

	display(c) {
		c.beginPath();
		c.moveTo(this.vertices[0].x, this.vertices[0].y);
		for(const vertex of this.vertices.slice(1)) {
			c.lineTo(vertex.x, vertex.y);
		}
		c.fill();
	}
}
