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
		const newIntersections = [];
		for(let i = 0; i < this.objects.length; i ++) {
			const obj1 = this.objects[i];
			for(let j = i + 1; j < this.objects.length; j ++) {
				const obj2 = this.objects[j];
				const intersects = obj1.intersects(obj2);
				if(obj1.shouldCollide(obj2, intersects)) {
					const force = obj1.collisionForce(obj2);
					obj1.applyForce(force);
					obj2.applyForce(force.multiply(-1));
				}
				if(intersects) {
					newIntersections.push([obj1, obj2]);
				}
			}
		}
		for(const obj of this.objects) {
			obj.overlappedObjects = [];
		}
		for(const [obj1, obj2] of newIntersections) {
			obj1.overlappedObjects.push(obj2);
			obj2.overlappedObjects.push(obj1);
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
