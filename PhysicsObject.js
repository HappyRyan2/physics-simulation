class PhysicsObject {
	constructor(shape, mass) {
		this.shape = shape;
		this.position = new Vector();
		this.velocity = new Vector();
		this.acceleration = new Vector();
		this.rotation = 0;
		this.angularVelocity = 0;
		this.angularAcceleration = 0;
		this.inertialMass = mass;
		this.gravitationalMass = mass;
		this.rotationalInertia = mass; // TODO: add calculations for rotational inertia
		this.elasticity = 0.5;
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
		const obj1 = new PhysicsObject(new Circle(0, 0, 1), 1);
		obj1.elasticity = 1;
		obj1.position = new Vector(-1, 0);
		obj1.velocity = new Vector(1, 0);
		const obj2 = new PhysicsObject(new Circle(0, 0, 1), 1);
		obj2.elasticity = 1;
		obj2.position = new Vector(1, 0);

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-1);
		expect(collisionForce.y).toApproximatelyEqual(0);
	},
	"works for moving equal-mass objects colliding elastically in one dimension": () => {
		const obj1 = new PhysicsObject(new Circle(0, 0, 1), 1);
		obj1.elasticity = 1;
		obj1.position = new Vector(-1, 0);
		obj1.velocity = new Vector(1, 0);
		const obj2 = new PhysicsObject(new Circle(0, 0, 1), 1);
		obj2.elasticity = 1;
		obj2.position = new Vector(1, 0);
		obj2.velocity = new Vector(-1, 0);

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-2);
		expect(collisionForce.y).toApproximatelyEqual(0);
	},
	"works for equal-mass objects colliding non-elastically in one dimension": () => {
		const obj1 = new PhysicsObject(new Circle(0, 0, 1), 1);
		obj1.elasticity = 0.5;
		obj1.position = new Vector(-1, 0);
		obj1.velocity = new Vector(1, 0);
		const obj2 = new PhysicsObject(new Circle(0, 0, 1), 1);
		obj2.elasticity = 0.5;
		obj2.position = new Vector(1, 0);
		obj2.velocity = new Vector(-1, 0);

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-1.5);
		expect(collisionForce.y).toApproximatelyEqual(0);
	},
	"works for non-unit-mass objects colliding elastically in one dimension": () => {
		const obj1 = new PhysicsObject(new Circle(0, 0, 1), 15);
		obj1.elasticity = 1;
		obj1.position = new Vector(-1, 0);
		obj1.velocity = new Vector(1, 0);
		const obj2 = new PhysicsObject(new Circle(0, 0, 1), 15);
		obj2.elasticity = 1;
		obj2.position = new Vector(1, 0);
		obj2.velocity = new Vector(-1, 0);

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-30, 1e-10);
		expect(collisionForce.y).toApproximatelyEqual(0, 1e-10);
	},
	"works for unequal-mass objects colliding elastically in one dimension": () => {
		const obj1 = new PhysicsObject(new Circle(0, 0, 1), 2);
		obj1.elasticity = 1;
		obj1.position = new Vector(-1, 0);
		obj1.velocity = new Vector(1, 0);
		const obj2 = new PhysicsObject(new Circle(0, 0, 1), 1);
		obj2.elasticity = 1;
		obj2.position = new Vector(1, 0);
		obj2.velocity = new Vector(-1, 0);

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-8/3);
		expect(collisionForce.y).toApproximatelyEqual(0);
	},
	"works for equal-mass objects colliding elastically in two dimensions": () => {
		const obj1 = new PhysicsObject(new Circle(0, 0, Math.SQRT_2), 1);
		obj1.elasticity = 1;
		obj1.position = new Vector(-1, -1);
		obj1.velocity = new Vector(1, 1);
		const obj2 = new PhysicsObject(new Circle(0, 0, Math.SQRT_2), 1);
		obj2.elasticity = 1;
		obj2.position = new Vector(1, 1);
		obj2.velocity = new Vector(-1, -1);

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-2);
		expect(collisionForce.y).toApproximatelyEqual(-2);
	},
	"works for unequal-mass objects colliding elastically in two dimensions": () => {
		const obj1 = new PhysicsObject(new Circle(0, 0, Math.SQRT_2), 2);
		obj1.elasticity = 1;
		obj1.position = new Vector(-1, -1);
		obj1.velocity = new Vector(1, 1);
		const obj2 = new PhysicsObject(new Circle(0, 0, Math.SQRT_2), 1);
		obj2.elasticity = 1;
		obj2.position = new Vector(1, 1);
		obj2.velocity = new Vector(-1, -1);

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-8/3);
		expect(collisionForce.y).toApproximatelyEqual(-8/3);
	},
	"works for equal-mass objects colliding non-elastically in two dimensions": () => {
		const obj1 = new PhysicsObject(new Circle(0, 0, Math.SQRT_2), 1);
		obj1.elasticity = 0;
		obj1.position = new Vector(-1, -1);
		obj1.velocity = new Vector(1, 1);
		const obj2 = new PhysicsObject(new Circle(0, 0, Math.SQRT_2), 1);
		obj2.elasticity = 0;
		obj2.position = new Vector(1, 1);
		obj2.velocity = new Vector(-1, -1);

		const collisionForce = obj1.collisionForce(obj2);
		expect(collisionForce.x).toApproximatelyEqual(-1);
		expect(collisionForce.y).toApproximatelyEqual(-1);
	}
});
