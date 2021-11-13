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
	}

	update() {
		this.position = this.position.add(this.velocity);
		this.velocity = this.velocity.add(this.acceleration);

		this.rotation += this.angularVelocity;
		this.angularVelocity += this.angularAcceleration;
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
}
