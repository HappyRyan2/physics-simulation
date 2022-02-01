class PhysicsWorld {
	static DEBUG_SETTINGS = {
		BREAK_ON_COLLISION: false,
		PAUSE_ON_COLLISION: false,
		DISPLAY_COLLISION_INFO: false,
		DISPLAY_VELOCITIES: false,

		UNNAMED_OBJECT_WARNING: false
	};

	constructor(objects, gravitationalAcceleration) {
		this.objects = objects ?? [];
		this.gravitationalAcceleration = gravitationalAcceleration ?? 0;
		this.paused = false;

		this.collisionInfo = []; // used for debugging

		this.recording = false;
		this.initialState = [];
		this.history = [];
		this.playingRecord = false;
		this.recordingFrame = 0;
	}
	static fromString(string) {
		const parsed = JSON.parse(string);
		const objects = parsed.initialState.objects;
		return new PhysicsWorld(
			objects.map(o => new PhysicsObject({
				shape: o.shape.vertices ? new Polygon(o.shape.vertices.map(v => new Vector(v))) : new Circle(o.shape.position.x, o.shape.position.y, o.shape.radius),
				position: new Vector(o.position),
				velocity: new Vector(o.velocity),
				rotation: o.rotation,
				angularVelocity: o.angularVelocity,
				inertialMass: o.inertialMass,
				gravitationalMass: o.gravitationalMass,
				rotationalInertia: o.rotationalInertia,
				elasticity: o.elasticity,
				antigravity: o.antigravity,
				immovable: o.immovable,
				selected: o.selected,
				name: o.name
			})),
			parsed.initialState.gravitationalAcceleration
		);
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
				obj1.cache = {};
				obj2.cache = {};
				const intersects = obj1.intersects(obj2);
				if(intersects) {
					newIntersections.push([obj1, obj2]);
				}
				if(intersects && obj1.shouldCollide(obj2)) {
					if(PhysicsWorld.DEBUG_SETTINGS.BREAK_ON_COLLISION && app.frameCount > 1) {
						this.display(app.canvasIO.ctx); // update screen with latest positions
						debugger;
					}
					if(PhysicsWorld.DEBUG_SETTINGS.PAUSE_ON_COLLISION && app.frameCount > 1) {
						this.paused = true;
					}
					if(PhysicsWorld.DEBUG_SETTINGS.DISPLAY_COLLISION_INFO) {
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

	updateVelocities() {
		for(const obj of this.objects) {
			obj.updateVelocity();
		}
	}
	updatePositions() {
		for(const obj of this.objects) {
			obj.updatePosition();
		}
	}
	update() {
		if(this.playingRecord) {
			for(const [i, obj] of this.objects.entries()) {
				const newPosition = this.history[this.recordingFrame][i];
				if(this.recordingFrame !== 0) {
					obj.velocity.x = newPosition.x - obj.position.x;
					obj.velocity.y = newPosition.y - obj.position.y;
				}
				obj.position.x = newPosition.x;
				obj.position.y = newPosition.y;
				obj.rotation = newPosition.rotation;
			}
			this.recordingFrame ++;
			if(this.recordingFrame >= this.history.length) {
				this.recordingFrame = 0;
			}
			return;
		}
		this.applyGravity();
		for(const obj of this.objects) {
			obj.updatePosition();
			obj.updateVelocity();
		}
		this.applyCollisions();
		for(const obj of this.objects) {
			obj.updateVelocity();
		}
		if(this.recording) {
			this.recordFrame();
		}
	}

	display(c) {
		c.fillStyle = "white";
		c.fillRect(0, 0, c.canvas.width, c.canvas.height);
		for(const obj of this.objects) {
			c.save();
			obj.display(c);
			c.restore();
			if(PhysicsWorld.DEBUG_SETTINGS.DISPLAY_VELOCITIES) {
				obj.displayVelocity(c);
			}
		}
		if(PhysicsWorld.DEBUG_SETTINGS.DISPLAY_COLLISION_INFO) {
			for(const collision of this.collisionInfo) {
				this.displayCollisionInfo(c, collision);
			}
		}
		if(this.playingRecord) {
			c.fillStyle = "black";
			c.textBaseline = "top";
			c.textAlign = "left";
			c.font = "20px monospace";
			c.fillText(`(recorded)`, 0, 20);
		}
	}
	displayCollisionInfo(c, collision) {
		const displayObj1 = collision.obj1.selected || this.objects.every(o => !o.isMouseHovered() && !o.selected);
		const displayObj2 = collision.obj2.selected || this.objects.every(o => !o.isMouseHovered() && !o.selected);
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

	beginRecording() {
		this.recording = true;
		this.initialState = {
			gravitationalAcceleration: this.gravitationalAcceleration,
			objects: this.objects.map(o => ({
				shape: o.shape,
				position: o.position,
				velocity: o.velocity,
				rotation: o.rotation,
				angularVelocity: o.angularVelocity,
				inertialMass: o.inertialMass,
				gravitationalMass: o.gravitationalMass,
				rotationalInertia: o.rotationalInertia,
				elasticity: o.elasticity,
				antigravity: o.antigravity,
				immovable: o.immovable,
				selected: o.selected,
				name: o.name
			}))
		};
	}
	recordFrame() {
		this.history.push(this.objects.map(o => ({
			x: o.position.x,
			y: o.position.y,
			r: o.rotation
		})));
	}
	historyString() {
		return JSON.stringify({
			initialState: this.initialState,
			history: this.history
		});
	}
	static playRecording(recordString) {
		if(SCENARIO_TEST_DATA[recordString]) {
			return this.playRecording(SCENARIO_TEST_DATA[recordString]);
		}
		const world = PhysicsWorld.fromString(recordString);
		const parsed = JSON.parse(recordString);
		world.initialState = parsed.initialState;
		world.history = parsed.history;
		world.playingRecord = true;
		return world;
	}
}


testing.addUnit("PhysicsWorld recording", {
	"can record a simulation": () => {
		const world = new PhysicsWorld([
			new PhysicsObject({
				shape: new Circle(0, 0, 1),
				position: new Vector(0, 0),
				velocity: new Vector(1, 0),
				name: "example-object"
			})
		]);
		world.beginRecording();
		for(let i = 0; i < 3; i ++) {
			world.update();
		}
		const string = world.historyString();
		expect(string).toEqual(`{"initialState":{"gravitationalAcceleration":0,"objects":[{"shape":{"position":{"x":0,"y":0},"radius":1},"position":{"x":0,"y":0},"velocity":{"x":1,"y":0},"rotation":0,"angularVelocity":0,"inertialMass":1,"gravitationalMass":1,"rotationalInertia":1,"elasticity":0.5,"antigravity":false,"immovable":false,"selected":false,"name":"example-object"}]},"history":[[{"x":1,"y":0,"r":0}],[{"x":2,"y":0,"r":0}],[{"x":3,"y":0,"r":0}]]}`);
	},
	"can load a simulation from a string": () => {
		const world = PhysicsWorld.fromString(`{"initialState":{"gravitationalAcceleration":1.23,"objects":[{"shape":{"position":{"x":0,"y":0},"radius":1},"position":{"x":0,"y":0},"velocity":{"x":1,"y":0},"rotation":0,"angularVelocity":0,"inertialMass":1,"gravitationalMass":1,"rotationalInertia":1,"elasticity":0.5,"antigravity":false,"immovable":false,"selected":false,"name":"example-object"}]},"history":[[{"x":1,"y":0,"r":0}],[{"x":2,"y":0,"r":0}],[{"x":3,"y":0,"r":0}]]}`);
		const [obj] = world.objects;
		expect(obj).toEqual(new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(0, 0),
			velocity: new Vector(1, 0),
			rotation: 0,
			angularVelocity: 0,
			inertialMass: 1,
			gravitationalMass: 1,
			rotationalInertia: 1,
			elasticity: 0.5,
			antigravity: false,
			immovable: false,
			name: "example-object"
		}));
		expect(world.gravitationalAcceleration).toEqual(1.23);
	}
});
