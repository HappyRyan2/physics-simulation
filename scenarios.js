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
		name: "2d-collision",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(0, height * 1/4),
					velocity: new Vector(3, 0),
					elasticity: 0.5
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width / 2, height * 1/4 + 75),
					elasticity: 0.5
				}),
			]);
		}
	},
	{
		name: "2d-collision-with-rotation",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: new Polygon([
						new Vector(-50, 50),
						new Vector(50, 50),
						new Vector(0, -150),
					]),
					position: new Vector(width / 2, height / 2)
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(0, height / 2 - 100),
					velocity: new Vector(3, 0)
				})
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
scenarios[3].load();
