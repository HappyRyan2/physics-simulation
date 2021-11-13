class PhysicsObject {
	constructor(shape) {
		this.shape = shape;
		this.position = new Vector();
		this.velocity = new Vector();
		this.acceleration = new Vector();
		this.rotation = 0;
		this.angularVelocity = 0;
		this.angularAcceleration = 0;
	}

	update() {
		this.position = this.position.add(this.velocity);
		this.velocity = this.velocity.add(this.acceleration);

		this.rotation += this.angularVelocity;
		this.angularVelocity += this.angularAcceleration;
	}
}
