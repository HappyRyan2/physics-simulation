class PhysicsWorld {
	constructor(objects) {
		this.objects = objects ?? [];
	}

	update() {
		for(const obj of this.objects) {
			obj.update();
		}
	}

	display(c) {
		c.fillStyle = "white";
		c.fillRect(0, 0, c.canvas.width, c.canvas.height);
		for(const obj of this.objects) {
			c.save();
			obj.display(c);
			c.restore();
		}
	}
}
