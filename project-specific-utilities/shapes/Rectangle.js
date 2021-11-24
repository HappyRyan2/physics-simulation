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
