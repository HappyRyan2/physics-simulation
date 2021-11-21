class PhysicsObject {
	constructor(properties) {
		this.shape = properties.shape ?? new Circle();
		this.position = properties.position ?? new Vector();
		this.velocity = properties.velocity ?? new Vector();
		this.acceleration = properties.acceleration ?? new Vector();
		this.rotation = properties.rotation ?? 0;
		this.angularVelocity = properties.angularVelocity ?? 0;
		this.angularAcceleration = properties.angularAcceleration ?? 0;
		this.inertialMass = properties.inertialMass ?? properties.mass ?? 1;
		this.gravitationalMass = properties.gravitationalMass ?? properties.mass ?? 1;
		this.rotationalInertia = properties.rotationalInertia ?? properties.mass ?? 1; // TODO: add calculations for rotational inertia
		this.elasticity = properties.elasticity ?? 0;
		this.antigravity = properties.antigravity ?? false;

		this.overlappedObjects = [];
	}

	static ROTATION_CONSTANT = 2e-4;

	updateVelocity() {
		this.velocity = this.velocity.add(this.acceleration);
		this.angularVelocity += this.angularAcceleration;
		this.acceleration = new Vector();
		this.angularAcceleration = 0;
	}
	updatePosition() {
		this.position = this.position.add(this.velocity);
		this.rotation += this.angularVelocity;
	}

	update() {
		this.updateVelocity();
		this.updatePosition();
	}
	display(c) {
		c.fillStyle = "black";
		c.translate(this.position.x, this.position.y);
		c.rotate(this.rotation);
		this.shape.display(c);
	}

	applyForce(force, position = this.position) {
		this.acceleration = this.acceleration.add(force.divide(this.inertialMass));
		const TO_RADIANS = Math.PI / 180;
		let torque = force.magnitude;
		torque *= position.subtract(this.position).magnitude;
		torque *= Math.sin(TO_RADIANS * (force.angle - position.angle));
		torque *= PhysicsObject.ROTATION_CONSTANT;
		this.angularAcceleration += (torque / this.rotationalInertia);
	}

	transformedShape() {
		const TO_DEGREES = 180 / Math.PI;
		return this.shape.rotate(-this.rotation * TO_DEGREES).translate(this.position);
	}

	intersects(physicsObject) {
		const shape1 = this.transformedShape();
		const shape2 = physicsObject.transformedShape();
		return shape1.intersects(shape2);
	}
	movingToward(physicsObject) {
		const distance = this.position.subtract(physicsObject.position).magnitude;
		const nextDistance = this.position.add(this.velocity).subtract(physicsObject.position.add(physicsObject.velocity)).magnitude;
		return nextDistance <= distance;
	}
	shouldCollide(physicsObject, intersects = this.intersects(physicsObject)) {
		if(!intersects) { return false; }
		if(this.overlappedObjects.includes(physicsObject)) {
			return this.movingToward(physicsObject);
		}
		return true;
	}
	intersection(physicsObject) {
		const shape1 = this.transformedShape();
		const shape2 = physicsObject.transformedShape();
		if(shape1 instanceof Circle && shape2 instanceof Circle) {
			return shape1.position.add(shape2.position).divide(2);
		}
		else if((shape1 instanceof Circle && shape2 instanceof Polygon) || (shape1 instanceof Polygon && shape2 instanceof Circle)) {
			const circle = [shape1, shape2].find(s => s instanceof Circle);
			const polygon = [shape1, shape2].find(s => s instanceof Polygon);
			const intersections = Shape.circlePolygonIntersections(circle, polygon);
			return intersections.reduce((a, b) => a.add(b)).divide(intersections.length);
		}
		else if(shape1 instanceof Polygon && shape2 instanceof Polygon) {
			const intersections = Shape.polygonIntersections(shape1, shape2);
			return intersections.reduce((a, b) => a.add(b)).divide(intersections.length);
		}
	}
	normalVector(physicsObject, intersection = this.intersection(physicsObject)) {
		const shape1 = this.transformedShape();
		const shape2 = physicsObject.transformedShape();
		if(shape1 instanceof Circle && shape2 instanceof Circle) {
			return shape1.position.subtract(shape2.position);
		}
		else {
			const polygon = [shape1, shape2].find(s => s instanceof Polygon);
			const edge = polygon.closestEdge(intersection);
			const result = edge.endpoint1.subtract(edge.endpoint2);
			result.angle += 90;
			return result;
		}
		return [intersection, normalVector];
	}
	checkForCollisions(physicsObject, intersects = this.intersects(physicsObject)) {
		if(this.shouldCollide(physicsObject, intersects)) {
			const force = this.collisionForce(physicsObject);
			this.applyForce(force, this.intersection(physicsObject));
			physicsObject.applyForce(force.multiply(-1), this.intersection(physicsObject));
		}
	}


	collisionForce(physicsObject) {
		const restitutionCoef = (this.elasticity + physicsObject.elasticity) / 2;

		const intersection = this.intersection(physicsObject);
		const normalVector = this.normalVector(physicsObject, intersection);

		const normalForce = PhysicsObject.collisionForce1D(
			this.velocity.scalarProjection(normalVector),
			physicsObject.velocity.scalarProjection(normalVector),
			this.inertialMass, physicsObject.inertialMass,
			restitutionCoef
		);
		normalForce.angle += normalVector.angle;
		return normalForce;
	}
	static collisionForce1D(velocity1, velocity2, mass1, mass2, restitutionCoef) {
		const resultVelocity = (mass1 * velocity1 + mass2 * velocity2 + mass2 * restitutionCoef * (velocity2 - velocity1)) / (mass1 + mass2);
		const changeInVelocity = velocity1 - resultVelocity;
		const forceMagnitude = changeInVelocity * mass1;
		return new Vector({ angle: 180, magnitude: forceMagnitude });
	}
}

testing.addUnit("PhysicsObject.intersects()", {
	"returns true when the objects intersect": () => {
		const obj1 = new PhysicsObject({ shape: new Circle(0, 0, 5) });
		const obj2 = new PhysicsObject({ shape: new Polygon(
			1, -10,
			1, 10,
			10, 0
		) });
		const intersect = obj1.intersects(obj2);
		expect(intersect).toEqual(true);
	},
	"returns false when the objects do not intersect": () => {
		const obj1 = new PhysicsObject({ shape: new Circle(20, 0, 5) });
		const obj2 = new PhysicsObject({ shape: new Polygon(
			1, -10,
			1, 10,
			10, 0
		) });
		const intersect = obj1.intersects(obj2);
		expect(intersect).toEqual(false);
	},
	"works when the intersecting objects have nonzero position": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(20, 0, 5),
			position: new Vector(-20, 0)
		});
		const obj2 = new PhysicsObject({ shape: new Polygon(
			1, -1,
			-1, -1,
			0, 1
		) });
		const intersect = obj1.intersects(obj2);
		expect(intersect).toEqual(true);
	},
	"works when the intersecting objects have nonzero rotation": () => {
		const obj1 = new PhysicsObject({ shape: new Circle(50, 0, 5) });
		const obj2 = new PhysicsObject({
			shape: new Polygon(
				1, -1,
				-1, -1,
				0, 100
			),
			rotation: -Math.PI / 2
		});
		const intersect = obj1.intersects(obj2);
		expect(intersect).toEqual(true);
	}
});
testing.addUnit("PhysicsObject.collisionForce()", {
	"works for equal-mass objects colliding elastically in one dimension": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(-1, 0),
			velocity: new Vector(1, 0),
			elasticity: 1
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(1, 0),
			elasticity: 1
		});

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-1);
		expect(collisionForce.y).toApproximatelyEqual(0);
	},
	"works for moving equal-mass objects colliding elastically in one dimension": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(-1, 0),
			velocity: new Vector(1, 0),
			elasticity: 1
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(1, 0),
			velocity: new Vector(-1, 0),
			elasticity: 1
		});

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-2);
		expect(collisionForce.y).toApproximatelyEqual(0);
	},
	"works for equal-mass objects colliding non-elastically in one dimension": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(-1, 0),
			velocity: new Vector(1, 0),
			elasticity: 0.5
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(1, 0),
			velocity: new Vector(-1, 0),
			elasticity: 0.5
		});

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-1.5);
		expect(collisionForce.y).toApproximatelyEqual(0);
	},
	"works for non-unit-mass objects colliding elastically in one dimension": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(-1, 0),
			velocity: new Vector(1, 0),
			mass: 15,
			elasticity: 1
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(1, 0),
			velocity: new Vector(-1, 0),
			mass: 15,
			elasticity: 1
		});

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-30, 1e-10);
		expect(collisionForce.y).toApproximatelyEqual(0, 1e-10);
	},
	"works for unequal-mass objects colliding elastically in one dimension": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(-1, 0),
			velocity: new Vector(1, 0),
			mass: 2,
			elasticity: 1
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(1, 0),
			velocity: new Vector(-1, 0),
			elasticity: 1
		});

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-8/3);
		expect(collisionForce.y).toApproximatelyEqual(0);
	},
	"works for equal-mass objects colliding elastically in two dimensions": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT2),
			position: new Vector(-1, -1),
			velocity: new Vector(1, 1),
			elasticity: 1
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT2),
			position: new Vector(1, 1),
			velocity: new Vector(-1, -1),
			elasticity: 1
		});

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-2);
		expect(collisionForce.y).toApproximatelyEqual(-2);
	},
	"works for unequal-mass objects colliding elastically in two dimensions": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT2),
			position: new Vector(-1, -1),
			velocity: new Vector(1, 1),
			mass: 2,
			elasticity: 1,

		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT2),
			position: new Vector(1, 1),
			velocity: new Vector(-1, -1),
			elasticity: 1
		});

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-8/3);
		expect(collisionForce.y).toApproximatelyEqual(-8/3);
	},
	"works for equal-mass objects colliding non-elastically in two dimensions": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT2),
			position: new Vector(-1, -1),
			velocity: new Vector(1, 1),
			elasticity: 0
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT2),
			position: new Vector(1, 1),
			velocity: new Vector(-1, -1),
			elasticity: 0
		});

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-1);
		expect(collisionForce.y).toApproximatelyEqual(-1);
	},
	"works for equal-mass objects colliding at an angle": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(-1, 0),
			velocity: new Vector(1, -1),
			elasticity: 1
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, 1),
			position: new Vector(1, 0),
			velocity: new Vector(0, 0),
			elasticity: 1
		});

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-1);
		expect(collisionForce.y).toApproximatelyEqual(0);
	}
});
testing.addUnit("PhysicsObject.intersection()", {
	"returns the correct result for two circles": () => {
		const circle1 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT2),
			position: new Vector(-1, -1)
		});
		const circle2 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT2),
			position: new Vector(1, 1)
		});
		const intersection = circle1.intersection(circle2);
		expect(intersection).toEqual(new Vector(0, 0));
	},
	"returns the correct result for a circle and a polygon": () => {
		const circle = new PhysicsObject({ shape: new Circle(0, 0, 5) });
		const polygon = new PhysicsObject({
			shape: new Polygon(1, 0, 6, 5, 6, -5)
		});
		const intersection = circle.intersection(polygon);
		expect(intersection).toEqual(new Vector(4, 0));
	},
	"returns the correct result for two polygons": () => {
		const polygon1 = new PhysicsObject({
			shape: new Polygon(-4, -4, 4, -4, 4, 4, -4, 4)
		});
		const polygon2 = new PhysicsObject({
			shape: new Polygon(3, -3, 7, -3, 7, 3, 3, 3)
		});
		const intersection = polygon1.intersection(polygon2);
		expect(intersection.x).toApproximatelyEqual(4);
		expect(intersection.y).toApproximatelyEqual(0);
	}
});
testing.addUnit("PhysicsObject.normalVector()", {
	"returns the correct result for two circles": () => {
		const circle1 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT2),
			position: new Vector(-1, -1)
		});
		const circle2 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT2),
			position: new Vector(1, 1)
		});
		const normalVector = circle1.normalVector(circle2, new Vector(0, 0));
		expect(normalVector.angle).toEqual(135); // 135 / -45
	},
	"returns the correct result for a circle and a polygon": () => {
		const circle = new PhysicsObject({ shape: new Circle(0, 0, 5) });
		const polygon = new PhysicsObject({
			shape: new Polygon(1, 0, 6, 5, 6, -5)
		});
		const normalVector = circle.normalVector(polygon, new Vector(4, 0));
		expect(normalVector.angle).toEqual(0); // 0 / -180
	},
	"returns the correct result for two polygons": () => {
		const polygon1 = new PhysicsObject({
			shape: new Polygon(-4, -4, 4, -4, 4, 4, -4, 4)
		});
		const polygon2 = new PhysicsObject({
			shape: new Polygon(3, -3, 7, -3, 7, 3, 3, 3)
		});
		const normalVector = polygon1.normalVector(polygon2, new Vector(4, 0));
		expect(normalVector.angle).toEqual(180); // 0 / 180 / -180
	}
});
testing.addUnit("PhysicsObject collisions", {
	"correctly simulates semi-elastic collisions between equal-mass objects moving in opposite directions": () => {
		const obj1 = new PhysicsObject({
			shape: new Circle(0, 0, 2),
			position: new Vector(-9, 0),
			velocity: new Vector(2, 0),
			elasticity: 0.5
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, 2),
			position: new Vector(9, 0),
			velocity: new Vector(-2, 0),
			elasticity: 0.5
		});
		const world = new PhysicsWorld([obj1, obj2]);

		for(let i = 0; i < 10; i ++) {
			world.update();
		}

		expect(obj1.position.x).toBeNegative();
		expect(obj1.position.y).toApproximatelyEqual(0, 1e-10);
		expect(obj1.velocity.x).toApproximatelyEqual(-1);
		expect(obj1.velocity.y).toApproximatelyEqual(0);

		expect(obj2.position.x).toBePositive();
		expect(obj2.position.y).toApproximatelyEqual(0, 1e-10);
		expect(obj2.velocity.x).toApproximatelyEqual(1);
		expect(obj2.velocity.y).toApproximatelyEqual(0);
	}
});
