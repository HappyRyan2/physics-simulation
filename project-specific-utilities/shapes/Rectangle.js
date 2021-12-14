class Rectangle {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	get left() { return this.x; }
	set left(newValue) {
		this.width += (this.x - newValue);
		this.x = newValue;
	}
	get right() {
		return this.x + this.width;
	}
	set right(newValue) {
		this.width = newValue - this.x;
	}

	get top() { return this.y; }
	set top(newValue) {
		this.height += (this.y - newValue);
		this.y = newValue;
	}
	get bottom() {
		return this.y + this.height;
	}
	set bottom(newValue) {
		this.height = newValue - this.y;
	}

	static boundingBox(shapes) {
		const boundingBoxes = shapes.map(s => s instanceof Rectangle ? s : s.boundingBox());
		const left = boundingBoxes.min(b => b.left).left;
		const right = boundingBoxes.max(b => b.right).right;
		const top = boundingBoxes.min(b => b.top).top;
		const bottom = boundingBoxes.max(b => b.bottom).bottom;
		return new Rectangle(left, top, right - left, bottom - top);
	}

	intersects(rectangle, tolerance = 1e-10) {
		return (
			this.x + this.width >= rectangle.x - tolerance && this.x <= rectangle.x + rectangle.width + tolerance &&
			this.y + this.height >= rectangle.y - tolerance && this.y <= rectangle.y + rectangle.height + tolerance
		);
	}
	containsPoint(point) {
		return point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height;
	}

	display(c, outlineOnly = false) {
		c.fillRect(this.x, this.y, this.width, this.height);
	}

	translate(vector) {
		if(!(arguments[0] instanceof Vector)) {
			return this.translate(new Vector(...arguments));
		}
		return new Rectangle(this.x + vector.x, this.y + vector.y, this.width, this.height);
	}
}


testing.addUnit("Rectangle getters / setters", {
	"can get / set the left / top properties correctly": () => {
		const rectangle = new Rectangle(100, 200, 3, 4);

		rectangle.left = 50;
		expect(rectangle.width).toEqual(53);
		expect(rectangle.x).toEqual(50);
		expect(rectangle.left).toEqual(50);

		rectangle.top = 100;
		expect(rectangle.height).toEqual(104);
		expect(rectangle.y).toEqual(100);
		expect(rectangle.top).toEqual(100);
	},
	"can get / set the right / bottom properties correctly": () => {
		const rectangle = new Rectangle(100, 200, 3, 4);

		rectangle.right = 1000;
		expect(rectangle.width).toEqual(900);

		rectangle.bottom = 2000;
		expect(rectangle.height).toEqual(1800);
	}
});
