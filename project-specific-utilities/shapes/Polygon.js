class Polygon extends Shape {
	constructor() {
		super();
		if([...arguments].every(v => typeof v === "number")) {
			this.vertices = [];
			for(let i = 0; i < arguments.length; i += 2) {
				this.vertices[i / 2] = new Vector(arguments[i], arguments[i + 1]);
			}
		}
		else if(arguments[0].every(v => v instanceof Vector)) {
			[this.vertices] = arguments;
		}
		else {
			throw new Error("Unsupported input format.");
		}
	}

	display(c, outlineOnly = false) {
		if(outlineOnly) { c.strokePoly(this.vertices); }
		else { c.fillPoly(this.vertices); }
	}

	edges() {
		return this.vertices.map((vertex, i) => {
			return new Segment(vertex, this.vertices[(i + 1) % this.vertices.length]);
		});
	}

	containsPoint(vector) {
		/* find a ray through the point that doesn't contain any of the vertices */
		const vertices = this.vertices.sort((v1, v2) => v2.subtract(vector).angle - v1.subtract(vector).angle);
		let line;
		for(let i = 0; i < vertices.length - 1; i ++) {
			const vertex = vertices[i];
			const next = vertices[i + 1];
			if(vertex.subtract(vector).angle !== next.subtract(vector).angle) {
				const angle = (vertex.angle + next.angle) / 2;
				const magnitude = vertices.max(v => v.subtract(vector).magnitude, null, "value") + 1;
				line = new Segment(vector, vector.add(new Vector({ angle, magnitude })));
			}
		}
		/* count the number of intersections between the ray and the edges of the polygon */
		let numIntersections = 0;
		for(const edge of this.edges()) {
			if(Shape.segmentIntersectsSegment(line, edge)) {
				numIntersections ++;
			}
		}
		return numIntersections % 2 === 1;
	}

	translate(vector) {
		if(!(vector instanceof Vector)) {
			return this.translate(new Vector(...arguments));
		}
		return new Polygon(this.vertices.map(v => v.add(vector)));
	}
	rotate(angle) {
		const polygon = new Polygon(this.vertices.map(v => new Vector(v)));
		for(const vertex of polygon.vertices) {
			vertex.angle += angle;
		}
		return polygon;
	}
	scale(scalar) {
		return new Polygon(this.vertices.map(vector => vector.multiply(scalar)));
	}

	closestEdge(point) {
		return this.edges().min(e => e.distanceFrom(point));
	}

	static regularPolygon(numSides) {
		let points = [];
		for(let i = 0; i < numSides; i ++) {
			const angle = (i * (2 * Math.PI) / numSides);
			points.push(new Vector(Math.cos(angle), Math.sin(angle)));
		}
		return new Polygon(points);
	}
}

testing.addUnit("Polygon constructor", {
	"can create a Polygon from an array of Vectors": () => {
		const vertices = [
			new Vector(0, 0),
			new Vector(1, 0),
			new Vector(0, 1)
		];
		const polygon = new Polygon(vertices);
		expect(polygon.vertices).toEqual(vertices);
	},
	"can create a Polygon from the x and y values of the vertices": () => {
		const polygon = new Polygon(1, 2, 3, 4, 5, 6);
		expect(polygon.vertices).toEqual([
			new Vector(1, 2),
			new Vector(3, 4),
			new Vector(5, 6)
		]);
	}
});
testing.addUnit("Polygon.edges()", {
	"correctly returns the edges of the polygon": () => {
		const polygon = new Polygon(
			-1, -1,
			1, -1,
			0, 1
		);
		const edges = polygon.edges();
		expect(edges).toEqual([
			new Segment(-1, -1, 1, -1),
			new Segment(1, -1, 0, 1),
			new Segment(0, 1, -1, -1)
		]);
	}
});
testing.addUnit("Polygon.containsPoint()", {
	"returns true when the point is inside the polygon": () => {
		const polygon = new Polygon(
			-1, -1,
			1, -1,
			0, 1
		);
		const point = new Vector(0, 0);
		expect(polygon.containsPoint(point)).toEqual(true);
	},
	"returns false when the point is outside the polygon": () => {
		const polygon = new Polygon(
			-1, -1,
			1, -1,
			0, 1
		);
		const point = new Vector(0, 2);
		expect(polygon.containsPoint(point)).toEqual(false);
	},
	"returns the correct answer even when the ray would hit a vertex": () => {
		const polygon = new Polygon(
			0, -1,
			1, 0,
			0, 1,
			-1, 0
		);
		const point = new Vector(0, 0);
		expect(polygon.containsPoint(point)).toEqual(true);
	}
});
testing.addUnit("Polygon.translate()", {
	"correctly returns the polygon after the translation": () => {
		const polygon = new Polygon(-1, -1, 1, -1, 0, 2);
		const translated = polygon.translate(100, 100);
		expect(translated).toEqual(new Polygon(99, 99, 101, 99, 100, 102));
	},
	"does not modify the original polygon": () => {
		const polygon = new Polygon(-1, -1, 1, -1, 0, 2);
		const translated = polygon.translate(100, 100);
		expect(polygon).toEqual(new Polygon(-1, -1, 1, -1, 0, 2));
	},
});
testing.addUnit("Polygon.rotate()", {
	"correctly returns the polygon after the rotation": () => {
		const polygon = new Polygon(-1, -1, 1, -1, 0, 2);
		const rotated = polygon.rotate(90);
		expect(rotated.vertices[0].x).toApproximatelyEqual(-1);
		expect(rotated.vertices[0].y).toApproximatelyEqual(1);
		expect(rotated.vertices[1].x).toApproximatelyEqual(-1);
		expect(rotated.vertices[1].y).toApproximatelyEqual(-1);
		expect(rotated.vertices[2].x).toApproximatelyEqual(2);
		expect(rotated.vertices[2].y).toApproximatelyEqual(0);
	},
	"does not modify the original polygon": () => {
		const polygon = new Polygon(-1, -1, 1, -1, 0, 2);
		const rotated = polygon.rotate(90);
		expect(polygon).toEqual(new Polygon(-1, -1, 1, -1, 0, 2));
	}
});
testing.addUnit("Polygon.scale()", {
	"correctly scales the polygon": () => {
		const polygon = new Polygon(1, 2, 3, 4, 5, 6);
		const scaled = polygon.scale(100);
		expect(scaled.vertices).toEqual([
			new Vector(100, 200),
			new Vector(300, 400),
			new Vector(500, 600)
		]);
	},
	"does not modify the original polygon": () => {
		const polygon = new Polygon(1, 2, 3, 4, 5, 6);
		const scaled = polygon.scale(100);
		expect(polygon.vertices).toEqual([
			new Vector(1, 2),
			new Vector(3, 4),
			new Vector(5, 6)
		]);
	}
});
testing.addUnit("Polygon.closestEdge()", {
	"correctly returns the closest edge of the polygon": () => {
		const polygon = new Polygon([
			new Vector(1, 1),
			new Vector(3, 1),
			new Vector(3, 3),
			new Vector(1, 3)
		]);
		const point = new Vector(5, 2);
		const edge = polygon.closestEdge(point);
		expect(edge).toEqual(polygon.edges()[1]);
	}
});
testing.addUnit("Polygon.regularPolygon()", {
	"can generate an equilateral triangle": () => {
		const polygon = Polygon.regularPolygon(3);
		expect(polygon.vertices[0].x).toApproximatelyEqual(1);
		expect(polygon.vertices[0].y).toApproximatelyEqual(0);
		expect(polygon.vertices[1].x).toApproximatelyEqual(-1/2);
		expect(polygon.vertices[1].y).toApproximatelyEqual(Math.sqrt(3) / 2);
		expect(polygon.vertices[2].x).toApproximatelyEqual(-1/2);
		expect(polygon.vertices[2].y).toApproximatelyEqual(-Math.sqrt(3) / 2);
	}
});
