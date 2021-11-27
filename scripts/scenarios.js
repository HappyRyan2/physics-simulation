const scenarios = [
	{
		name: "falling-ball",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: new Circle(width / 2, height / 2, 50),
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
					elasticity: 0.1
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width, 400),
					velocity: new Vector(-3, 0),
					elasticity: 0.1
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
					velocity: new Vector(3, 0),
					selected: true
				})
			]);
		}
	},
	{
		name: "polygon-polygon-collision",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: Polygon.regularPolygon(3).scale(50).rotate(90),
					position: new Vector(width / 4, height / 4),
					angularVelocity: 0.1,
					velocity: new Vector(1, 1),
					elasticity: 0.5
				}),
				new PhysicsObject({
					shape: Polygon.regularPolygon(6).scale(100).rotate(90),
					position: new Vector(width / 2, height / 2),
					mass: 2,
					elasticity: 0.5
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
					shape: new Circle(0, 0, 50),
					position: new Vector(width / 2 - 150, height / 2),
					mass: 100
				}),
				new PhysicsObject({
					shape: new Polygon([
						new Vector(-width / 2, -height * 1/16),
						new Vector(width / 2, -height * 1/16),
						new Vector(width / 2, height * 1/16),
						new Vector(-width / 2, height * 1/16),
					]),
					position: new Vector(width / 2, height * 15/16),
					antigravity: true,
					immovable: true
				})
			], 0.1);
		}
	},
	{
		name: "falling-rectangle",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: new Polygon([
						new Vector(-width / 2, -height * 1/16),
						new Vector(width / 2, -height * 1/16),
						new Vector(width / 2, height * 1/16),
						new Vector(-width / 2, height * 1/16),
					]),
					position: new Vector(width / 2, height * 15/16),
					antigravity: true,
					immovable: true,
					elasticity: 0.1
				}),
				new PhysicsObject({
					shape: new Polygon(
						-50, -10,
						50, -10,
						50, 10,
						-50, 10
					),
					position: new Vector(width / 2, height / 2),
					elasticity: 0.1
				})
			], 0.1);
		}
	},
	{
		name: "slanted-falling-rectangle",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: new Polygon([
						new Vector(-width / 2, -height * 1/16),
						new Vector(width / 2, -height * 1/16),
						new Vector(width / 2, height * 1/16),
						new Vector(-width / 2, height * 1/16),
					]),
					position: new Vector(width / 2, height * 15/16),
					antigravity: true,
					immovable: true,
					elasticity: 0.1
				}),
				new PhysicsObject({
					shape: new Polygon(
						-50, -10,
						50, -10,
						50, 10,
						-50, 10
					).rotate(45),
					position: new Vector(width / 2, height / 2),
					elasticity: 0.1
				})
			], 0.1);
		}
	},
	{
		name: "rectangle-falls-on-slope",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			const FLOOR_SIZE = 150;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: new Polygon(-50, -10, 50, -10, 50, 10, -50, 10),
					position: new Vector(width / 2, 0),
					elasticity: 0.1,
					selected: true
				}),
				new PhysicsObject({
					shape: new Polygon(
						FLOOR_SIZE, FLOOR_SIZE,
						-FLOOR_SIZE, FLOOR_SIZE,
						-FLOOR_SIZE, 0,
						FLOOR_SIZE, -FLOOR_SIZE
					),
					position: new Vector(width / 2, height / 2),
					immovable: true,
					antigravity: true,
					elasticity: 0.1
				})
			], 0.1);
		}
	}
];
