class PhysicsWorld {
	constructor(objects, gravitationalAcceleration) {
		this.objects = objects ?? [];
		this.gravitationalAcceleration = gravitationalAcceleration ?? 0;
	}

	applyGravity() {
		for(const obj of this.objects) {
			if(!obj.antigravity) {
				obj.applyForce(new Vector(0, this.gravitationalAcceleration));
			}
		}
	}
	applyCollisions() {
		for(let i = 0; i < this.objects.length; i ++) {
			const obj1 = this.objects[i];
			for(let j = i + 1; j < this.objects.length; j ++) {
				const obj2 = this.objects[j];
				if(obj1.intersects(obj2)) {
					const force = obj1.collisionForce(obj2);
					obj1.applyForce(force);
					obj2.applyForce(force.multiply(-1));
				}
			}
		}
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
