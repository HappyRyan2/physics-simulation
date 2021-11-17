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
		this.rotationalInertia = properties.rotationalInertia ?? properties.mass; // TODO: add calculations for rotational inertia
		this.elasticity = properties.elasticity ?? 0;
	}

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
		this.angularAcceleration += (torque / this.rotationalInertia);
	}

	intersects(physicsObject) {
		const shape1 = this.shape.rotate(this.rotation).translate(this.position);
		const shape2 = physicsObject.shape.rotate(physicsObject.rotation).translate(physicsObject.position);
		return shape1.intersects(shape2);
	}


	collisionForce(physicsObject) {
		const restitutionCoef = (this.elasticity + physicsObject.elasticity) / 2;

		/* approximate the point of collision as being halfway between the centers */
		const pointOfIntersection = this.position.add(physicsObject.position).divide(2);
		const tangentialVector = physicsObject.position.subtract(this.position);
		tangentialVector.angle += 90;
		const normalVector = physicsObject.position.subtract(this.position);

		const tangentialForce = PhysicsObject.collisionForce1D(
			this.velocity.scalarProjection(tangentialVector),
			physicsObject.velocity.scalarProjection(tangentialVector),
			this.inertialMass, physicsObject.inertialMass,
			restitutionCoef
		);
		const normalForce = PhysicsObject.collisionForce1D(
			this.velocity.scalarProjection(normalVector),
			physicsObject.velocity.scalarProjection(normalVector),
			this.inertialMass, physicsObject.inertialMass,
			restitutionCoef
		);
		tangentialForce.angle += tangentialVector.angle;
		normalForce.angle += normalVector.angle;
		return tangentialForce.add(normalForce);
	}
	static collisionForce1D(velocity1, velocity2, mass1, mass2, restitutionCoef) {
		const resultVelocity = (mass1 * velocity1 + mass2 * velocity2 + mass2 * restitutionCoef * (velocity2 - velocity1)) / (mass1 + mass2);
		const changeInVelocity = velocity1 - resultVelocity;
		const forceMagnitude = changeInVelocity * mass1;
		return new Vector({ angle: 180, magnitude: forceMagnitude });
	}
}


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
			shape: new Circle(0, 0, Math.SQRT_2),
			position: new Vector(-1, -1),
			velocity: new Vector(1, 1),
			elasticity: 1
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT_2),
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
			shape: new Circle(0, 0, Math.SQRT_2),
			position: new Vector(-1, -1),
			velocity: new Vector(1, 1),
			mass: 2,
			elasticity: 1,

		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT_2),
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
			shape: new Circle(0, 0, Math.SQRT_2),
			position: new Vector(1, -1),
			velocity: new Vector(1, 1),
			elasticity: 0
		});
		const obj2 = new PhysicsObject({
			shape: new Circle(0, 0, Math.SQRT_2),
			position: new Vector(1, 1),
			velocity: new Vector(-1, -1),
			elasticity: 0
		});

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-1);
		expect(collisionForce.y).toApproximatelyEqual(-1);
	}
});
