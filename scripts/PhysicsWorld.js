class PhysicsWorld {
	constructor(objects, gravitationalAcceleration) {
		this.objects = objects ?? [];
		this.gravitationalAcceleration = gravitationalAcceleration ?? 0;
		this.paused = false;

		this.collisionInfo = []; // used for debugging
	}

	applyGravity() {
		for(const obj of this.objects) {
			if(!obj.antigravity) {
				obj.applyForce(new Vector(0, obj.inertialMass * this.gravitationalAcceleration));
			}
		}
	}
	applyCollisions() {
		this.collisionInfo = [];
		const newIntersections = [];
		for(let i = 0; i < this.objects.length; i ++) {
			const obj1 = this.objects[i];
			for(let j = i + 1; j < this.objects.length; j ++) {
				const obj2 = this.objects[j];
				const intersects = obj1.intersects(obj2);
				if(intersects) {
					if(DEBUG_SETTINGS.BREAK_ON_COLLISION && app.frameCount > 1) {
						this.display(app.canvasIO.ctx); // update screen with latest positions
						obj1.displayCollisionInfo(obj2);
						debugger;
					}
					if(DEBUG_SETTINGS.PAUSE_ON_COLLISION && app.frameCount > 1) {
						this.paused = true;
					}
					newIntersections.push([obj1, obj2]);
					if(DEBUG_SETTINGS.DISPLAY_COLLISION_INFO) {
						this.collisionInfo.push({
							obj1: obj1,
							obj2: obj2,
							intersection: obj1.intersection(obj2),
							normalVector: obj1.normalVector(obj2),
							tangentialVector: obj1.tangentialVector(obj2),
							forcePoint1: obj1.collisionForcePoint(obj2),
							forcePoint2: obj2.collisionForcePoint(obj1),
							force1: obj1.collisionForce(obj2),
							force2: obj2.collisionForce(obj1)
						});
					}
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
			obj.displayVelocity(c);
		}
		if(DEBUG_SETTINGS.DISPLAY_COLLISION_INFO) {
			for(const collision of this.collisionInfo) {
				this.displayCollisionInfo(c, collision);
			}
		}
	}
	displayCollisionInfo(c, collision) {
		const displayObj1 = collision.obj1.selected || collision.obj1.isMouseHovered() || this.objects.every(o => !o.isMouseHovered() && !o.selected);
		const displayObj2 = collision.obj2.selected || collision.obj2.isMouseHovered() || this.objects.every(o => !o.isMouseHovered() && !o.selected);
		const DOT_SIZE = 7;
		const FORCE_SCALE = 40;
		c.fillStyle = "red";
		c.strokeStyle = "red";
		c.lineWidth = 2;
		const tangentialLine = new Line(collision.intersection, collision.intersection.add(collision.tangentialVector));
		if(displayObj1 || displayObj2) {
			tangentialLine.display(c);
			c.fillCircle(collision.intersection.x, collision.intersection.y, DOT_SIZE);
		}

		c.fillStyle = "orange";
		c.strokeStyle = "orange";
		c.lineWidth = 3;
		c.font = "20px monospace";
		c.textBaseline = "middle";
		c.textAlign = "center";
		if(displayObj1) {
			utils.drawArrow(c, collision.force1.normalize().multiply(FORCE_SCALE), collision.forcePoint1);
			if(collision.obj1.selected || collision.obj1.isMouseHovered()) {
				const textLocation = collision.forcePoint1.add(new Vector(0, FORCE_SCALE));
				c.fillText(`|F| = ${collision.force1.magnitude.toPrecision(3)}`, textLocation.x, textLocation.y);
			}
		}
		if(displayObj2) {
			utils.drawArrow(c, collision.force2.normalize().multiply(FORCE_SCALE), collision.forcePoint2);
			if(collision.obj2.selected || collision.obj2.isMouseHovered()) {
				const textLocation = collision.forcePoint2.add(new Vector(0, FORCE_SCALE));
				c.fillText(`|F| = ${collision.force2.magnitude.toPrecision(3)}`, textLocation.x, textLocation.y);
			}
		}
	}
}
