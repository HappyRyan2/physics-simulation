class PhysicsWorld {
	static BREAK_ON_COLLISION = false;

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
				if(intersects) {
					if(PhysicsWorld.BREAK_ON_COLLISION && app.frameCount > 1) {
						this.display(app.canvasIO.ctx); // update screen with latest positions
						obj1.displayCollisionInfo(obj2);
						debugger;
					}
					newIntersections.push([obj1, obj2]);
				}
				obj1.checkForCollisions(obj2, intersects);
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
			obj.updatePosition();
			obj.updateVelocity();
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
