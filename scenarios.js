const scenarios = [
	{
		name: "falling-ball",
		load: () => {
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: new Circle(0, 0, 1),
				})
			], 0.1);
		}
	},
	{
		name: "ball-collisions-different-elasticities",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(0, 100),
					velocity: new Vector(3, 0),
					elasticity: 1
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width, 100),
					velocity: new Vector(-3, 0),
					elasticity: 1
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(0, 250),
					velocity: new Vector(3, 0),
					elasticity: 0.5
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width, 250),
					velocity: new Vector(-3, 0),
					elasticity: 0.5
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(0, 400),
					velocity: new Vector(3, 0),
					elasticity: 0
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width, 400),
					velocity: new Vector(-3, 0),
					elasticity: 0
				}),
			]);
		}
	},
	{
		name: "bouncing-ball",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width / 2, height / 2)
				}),
				new PhysicsObject({
					shape: new Polygon([
						new Vector(-width / 2, -height * 1/16),
						new Vector(width / 2, -height * 1/16),
						new Vector(width / 2, height * 1/16),
						new Vector(-width / 2, height * 1/16),
					]),
					position: new Vector(width / 2, height * 15/16),
					antigravity: true
				})
			], 0.1);
		}
	}
];
scenarios[1].load();
