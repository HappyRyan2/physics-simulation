class PhysicsWorld {
	constructor(objects, gravitationalAcceleration) {
		this.objects = objects ?? [];
		this.gravitationalAcceleration = gravitationalAcceleration ?? 0;
	}

	applyGravity() {
		for(const obj of this.objects) {
			obj.applyForce(new Vector(0, this.gravitationalAcceleration));
		}
	}
	applyCollisions() {

	}

	update() {
		this.applyGravity();
		for(const obj of this.objects) {
			obj.updateVelocity();
			obj.updatePosition();
		}
		this.applyCollisions();
		for(const obj of this.objects) {
			obj.updateVelocity();
			obj.updatePosition();
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
