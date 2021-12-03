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
		this.elasticity = properties.elasticity ?? 0.5;
		this.antigravity = properties.antigravity ?? false;
		this.immovable = properties.immovable ?? false;
		this.selected = properties.selected ?? false;

		this.overlappedObjects = [];
	}

	static ROTATION_CONSTANT = 2e-4;

	updateVelocity() {
		if(!this.immovable) {
			this.velocity = this.velocity.add(this.acceleration);
			this.angularVelocity += this.angularAcceleration;
		}
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
		c.strokeStyle = "black";
		c.fillStyle = "black";
		c.translate(this.position.x, this.position.y);
		c.rotate(this.rotation);
		c.lineWidth = 3;
		this.shape.display(c, !this.selected);
	}
	displayVelocity(c) {
		const VELOCITY_ARROW_COLOR = "rgb(0, 158, 250)";
		const ARROW_LENGTH = 40;
		if(this.selected || !app.physicsWorld.objects.some(o => o.selected || o.isMouseHovered())) {
			c.lineWidth = 3;
			c.strokeStyle = VELOCITY_ARROW_COLOR;
			c.fillStyle = VELOCITY_ARROW_COLOR;
			utils.drawArrow(c, this.velocity.normalize().multiply(ARROW_LENGTH), this.position, "tail");
		}
		if(this.selected) {
			const textLocation = this.position.add(new Vector(0, -ARROW_LENGTH));
			c.textAlign = "center";
			c.textBaseline = "middle";
			c.fillText(`|V| = ${this.velocity.magnitude.toPrecision(3)}`, textLocation.x, textLocation.y);
		}
		if(this.isMouseHovered()) {
			const mousePos = app.canvasIO.mouse;
			const velocity = this.velocityOfPoint(mousePos);
			c.strokeStyle = VELOCITY_ARROW_COLOR;
			c.lineWidth = 1;
			utils.drawArrow(c, velocity.multiply(ARROW_LENGTH).divide(this.velocity.magnitude), mousePos, "tail");
		}
	}

	applyForce(force, position = this.position) {
		if(force.magnitude === 0) { return; }
		this.acceleration = this.acceleration.add(force.divide(this.inertialMass));
		const TO_RADIANS = Math.PI / 180;
		const perpendicularVector = new Vector(force);
		perpendicularVector.angle += 90;
		let torque = force.magnitude;
		torque *= position.subtract(this.position).magnitude;
		torque *= Math.sin(TO_RADIANS * (position.subtract(this.position).angle - force.angle));
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
	movingToward(physicsObject, intersection = this.intersection(physicsObject), normalVector = this.normalVector(physicsObject)) {
		const TO_RADIANS = Math.PI / 180;
		const tangentialVector = this.tangentialVector(physicsObject, intersection, normalVector);
		const tangentialLine = new Line(intersection, intersection.add(tangentialVector));
		const distance1 = tangentialLine.signedDistance(intersection, physicsObject.position);
		const nextPosition = intersection.rotateAbout(this.position.x, this.position.y, this.angularVelocity * TO_RADIANS).add(this.velocity);
		const nextTangentialLine = new Line(
			tangentialLine.endpoint1.add(physicsObject.velocity),
			tangentialLine.endpoint2.add(physicsObject.velocity)
		);
		const distance2 = nextTangentialLine.signedDistance(nextPosition, physicsObject.position.add(physicsObject.velocity));
		return distance2 <= distance1;
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
	tangentialVector(physicsObject, intersection = this.intersection(physicsObject), normalVector = this.normalVector(physicsObject, intersection)) {
		return normalVector.rotateAbout(0, 0, 90);
	}
	normalVector(physicsObject, intersection = this.intersection(physicsObject)) {
		const shape1 = this.transformedShape();
		const shape2 = physicsObject.transformedShape();
		if(shape1 instanceof Circle && shape2 instanceof Circle) {
			return shape1.position.subtract(shape2.position).normalize();
		}
		else if((shape1 instanceof Circle && shape2 instanceof Polygon) || (shape1 instanceof Polygon && shape2 instanceof Circle)) {
			const circle = [shape1, shape2].find(s => s instanceof Circle);
			return intersection.subtract(circle.position).normalize();
		}
		else {
			const polygon = (
				[shape1, shape2]
				.filter(v => v instanceof Polygon)
				.max(poly => poly.vertices.min(vertex => vertex.subtract(intersection).magnitude, null, "value"))
			);
			const edge = polygon.closestEdge(intersection);
			const result = edge.endpoint1.subtract(edge.endpoint2);
			result.angle += 90;
			return result.normalize();
		}
		return [intersection, normalVector];
	}
	checkForCollisions(physicsObject, intersects = this.intersects(physicsObject)) {
		if(this.shouldCollide(physicsObject, intersects)) {
			const force = this.collisionForce(physicsObject);
			const force2 = physicsObject.collisionForce(this);
			const point1 = this.collisionForcePoint(physicsObject);
			const point2 = physicsObject.collisionForcePoint(this);
			this.applyForce(force, point1);
			physicsObject.applyForce(force2, point2);
		}
	}
	collisionForcePoint(physicsObject, normalVector = this.normalVector(physicsObject), intersection = this.intersection(physicsObject)) {
		if(this.shape instanceof Circle) {
			return (
				this.intersection(physicsObject).subtract(this.position)
				.normalize()
				.multiply(this.shape.radius)
				.add(this.position)
			);
		}
		else if(this.shape instanceof Polygon) {
			const tangentialVector = normalVector.rotateAbout(0, 0, 90);
			const tangentialLine = new Line(intersection, intersection.add(tangentialVector));
			const shape = this.transformedShape();
			const vertices = shape.vertices.filter((v, i) =>
				physicsObject.transformedShape().containsPoint(shape.vertices[i]) &&
				!(new Segment(shape.vertices[i], physicsObject.position).intersects(tangentialLine))
			);
			if(vertices.length === 0) {
				return this.intersection(physicsObject);
			}
			else {
				const weights = vertices.map(v => tangentialLine.distanceFrom(v));
				return utils.weightedVectorAverage(vertices, weights);
			}
		}
	}

	velocityOfPoint(point) {
		const TO_DEGREES = 180 / Math.PI;
		const originalPoint = new Vector(point);
		point = point.subtract(this.position);
		point.angle -= this.angularVelocity * TO_DEGREES;
		point = point.add(this.position);
		return point.subtract(originalPoint).add(this.velocity);
	}

	static MIN_COLLISION_VELOCITY = 0.2;
	collisionForce(physicsObject) {
		if(this.immovable) {
			return physicsObject.collisionForce(this).multiply(-1);
		}
		const restitutionCoef = (this.elasticity + physicsObject.elasticity) / 2;

		const intersection = this.intersection(physicsObject);
		const normalVector = this.normalVector(physicsObject, intersection);

		const LARGE_NUMBER = 1e6;
		let resultVelocity = PhysicsObject.velocityAfterCollision(
			this.velocityOfPoint(intersection).scalarProjection(normalVector),
			physicsObject.velocityOfPoint(intersection).scalarProjection(normalVector),
			this.immovable ? Math.max(this.inertialMass, physicsObject.inertialMass) * LARGE_NUMBER : this.inertialMass,
			physicsObject.immovable ? Math.max(this.inertialMass, physicsObject.inertialMass) * LARGE_NUMBER : physicsObject.inertialMass,
			restitutionCoef
		);
		let resultVelocity2 = PhysicsObject.velocityAfterCollision(
			physicsObject.velocityOfPoint(intersection).scalarProjection(normalVector),
			this.velocityOfPoint(intersection).scalarProjection(normalVector),
			physicsObject.immovable ? Math.max(this.inertialMass, physicsObject.inertialMass) * LARGE_NUMBER : physicsObject.inertialMass,
			this.immovable ? Math.max(this.inertialMass, physicsObject.inertialMass) * LARGE_NUMBER : this.inertialMass,
			restitutionCoef
		);
		const velocityDifference = resultVelocity - resultVelocity2;
		if(Math.abs(velocityDifference) < PhysicsObject.MIN_COLLISION_VELOCITY) {
			if(velocityDifference === 0) {
				resultVelocity = PhysicsObject.MIN_COLLISION_VELOCITY / 2;
			}
			resultVelocity *= PhysicsObject.MIN_COLLISION_VELOCITY / (resultVelocity + resultVelocity2);
		}
		const forcePoint = this.collisionForcePoint(physicsObject, normalVector, intersection);
		const magnitude = PhysicsObject.collisionForceFromVelocity(this, normalVector, forcePoint, resultVelocity);
		return normalVector.multiply(magnitude);
	}
	static velocityAfterCollision(velocity1, velocity2, mass1, mass2, restitutionCoef) {
		return (mass1 * velocity1 + mass2 * velocity2 + mass2 * restitutionCoef * (velocity2 - velocity1)) / (mass1 + mass2);
	}
	static collisionForce1D(velocity1, velocity2, mass1, mass2, restitutionCoef) {
		const resultVelocity = (mass1 * velocity1 + mass2 * velocity2 + mass2 * restitutionCoef * (velocity2 - velocity1)) / (mass1 + mass2);
		const changeInVelocity = velocity1 - resultVelocity;
		const forceMagnitude = changeInVelocity * mass1;
		return new Vector({ angle: 180, magnitude: forceMagnitude });
	}

	static collisionForceFromVelocity(physicsObject, normalVector, point, finalVelocity) {
		const { x: nX, y: nY } = normalVector;
		const { x: pX, y: pY } = physicsObject.position;
		const { x: vX, y: vY } = physicsObject.velocity;
		const w = physicsObject.angularVelocity;
		const { x: iX, y: iY } = point;
		const m = physicsObject.inertialMass;
		const iR = physicsObject.rotationalInertia;
		const r = physicsObject.position.distanceFrom(point);
		const theta = normalVector.angle - (point.subtract(physicsObject.position).angle);
		const sinTheta = Math.sin(theta * Math.PI / 180);
		const vF = finalVelocity;
		const rC = PhysicsObject.ROTATION_CONSTANT;

		const result1 = (vF - nX * vX - nY * vY - w * (nX * pY - nX * iY + nY * iX - nY * pX)) / ((1 / m) + r * sinTheta * rC * (nX * pY - nX * iY + nY * iX - nY * pX) / iR);
		const result2 = (vF - nX * vX - nY * vY - w * (nX * pY - nX * iY + nY * iX - nY * pX)) / ((1 / m) - r * sinTheta * rC * (nX * pY - nX * iY + nY * iX - nY * pX) / iR);
		return [result1, result2].min(magnitude => {
			const obj = physicsObject.clone();
			const force = new Vector({ angle: normalVector.angle, magnitude: magnitude });
			obj.applyForce(force, point);
			obj.updateVelocity();
			return Math.dist(finalVelocity, obj.velocityOfPoint(point).scalarProjection(normalVector));
		});
	}

	boundingBox() {
		return this.transformedShape().boundingBox();
	}

	isMouseHovered(io = app.canvasIO) {
		return this.transformedShape().containsPoint(io.mouse);
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
		expect(collisionForce.x).toApproximatelyEqual(-1 - (PhysicsObject.MIN_COLLISION_VELOCITY / Math.SQRT2));
		expect(collisionForce.y).toApproximatelyEqual(-1 - (PhysicsObject.MIN_COLLISION_VELOCITY / Math.SQRT2));
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
			shape: new Polygon(4, 0, 6, 1, 6, -1)
		});
		const normalVector = circle.normalVector(polygon);
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
testing.addUnit("PhysicsObject.velocityOfPoint()", {
	"returns the object's translational velocity when the angular velocity is zero": () => {
		const obj = new PhysicsObject({
			shape: new Circle(0, 0, 3),
			position: new Vector(5, 10),
			velocity: new Vector(123, 456)
		});
		const velocity = obj.velocityOfPoint(new Vector(4, 11));
		expect(velocity).toEqual(new Vector(123, 456));
	},
	"works when the angular velocity is nonzero": () => {
		const obj = new PhysicsObject({
			shape: new Circle(0, 0, 3),
			position: new Vector(5, 10),
			velocity: new Vector(123, 456),
			angularVelocity: Math.PI / 2 // 90 degrees per frame, clockwise
		});
		const velocity = obj.velocityOfPoint(new Vector(8, 10));
		expect(velocity).toEqual(new Vector(123 - 3, 456 + 3));
	}
});
testing.addUnit("PhysicsObject.collisionForcePoint()", {
	"correctly calculates the point when the object is a circle": () => {
		const circle = new PhysicsObject({ shape: new Circle(0, 0, 1) });
		const polygon = new PhysicsObject({
			shape: new Polygon(
				2, -1,
				-1, 2,
				0, 3,
				3, 0
			)
		});
		const point = circle.collisionForcePoint(polygon);
		expect(point.x).toApproximatelyEqual(Math.SQRT2 / 2);
		expect(point.y).toApproximatelyEqual(Math.SQRT2 / 2);
	},
	"correctly calculates the point when the object is a polygon": () => {
		const circle = new PhysicsObject({ shape: new Circle(0, 0, 2) });
		const polygon = new PhysicsObject({
			shape: new Polygon(
				1, 1,
				3, 1,
				3, 3,
				1, 3
			)
		});
		const point = polygon.collisionForcePoint(circle);
		expect(point.x).toApproximatelyEqual(1);
		expect(point.y).toApproximatelyEqual(1);
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
