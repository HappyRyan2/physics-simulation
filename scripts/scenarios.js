const scenarios = [
	{
		name: "falling-ball",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => {
			return new PhysicsWorld([
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width / 2, height / 2),
					name: "falling-circle"
				})
			], 0.1);
		}
	},
	{
		name: "ball-collisions-different-elasticities",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => {
			return new PhysicsWorld([
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(0, 100),
					velocity: new Vector(4, 0),
					elasticity: 1,
					name: "top-left-circle"
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width, 100),
					velocity: new Vector(-4, 0),
					elasticity: 1,
					name: "top-right-circle"
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(0, 250),
					velocity: new Vector(4, 0),
					elasticity: 0.5,
					name: "middle-left-circle"
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width, 250),
					velocity: new Vector(-4, 0),
					elasticity: 0.5,
					name: "middle-right-circle"
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(0, 400),
					velocity: new Vector(4, 0),
					elasticity: 0.1,
					name: "bottom-left-circle"
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width, 400),
					velocity: new Vector(-4, 0),
					elasticity: 0.1,
					name: "bottom-right-circle"
				}),
			]);
		}
	},
	{
		name: "2d-collision",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => {
			return new PhysicsWorld([
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(0, height * 1/4),
					velocity: new Vector(3, 0),
					elasticity: 0.5,
					name: "top-left-moving-circle"
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width / 2, height * 1/4 + 75),
					elasticity: 0.5,
					name: "bottom-right-unmoving-circle"
				}),
			]);
		}
	},
	{
		name: "2d-collision-with-rotation",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => {
			return new PhysicsWorld([
				new PhysicsObject({
					shape: new Polygon([
						new Vector(-50, 50),
						new Vector(50, 50),
						new Vector(0, -150),
					]),
					position: new Vector(width / 2, height / 2),
					name: "initially-unmoving-triangle"
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(0, height / 2 - 100),
					velocity: new Vector(3, 0),
					selected: true,
					name: "small-moving-circle"
				})
			]);
		}
	},
	{
		name: "polygon-polygon-collision",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => {
			return new PhysicsWorld([
				new PhysicsObject({
					shape: Polygon.regularPolygon(3).scale(50).rotate(90),
					position: new Vector(width / 4, height / 4),
					angularVelocity: 0.1,
					velocity: new Vector(1, 1),
					elasticity: 0.5,
					name: "small-moving-triangle"
				}),
				new PhysicsObject({
					shape: Polygon.regularPolygon(6).scale(100).rotate(90),
					position: new Vector(width / 2, height / 2),
					mass: 2,
					elasticity: 0.5,
					name: "large-hexagon"
				})
			]);
		}
	},
	{
		name: "bouncing-ball",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => {
			return new PhysicsWorld([
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width / 2, height / 2),
					name: "light-ball"
				}),
				new PhysicsObject({
					shape: new Circle(0, 0, 50),
					position: new Vector(width / 2 - 150, height / 2),
					mass: 100,
					name: "heavy-ball"
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
					immovable: true,
					name: "floor"
				})
			], 0.1);
		}
	},
	{
		name: "falling-rectangle",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => {
			return new PhysicsWorld([
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
					elasticity: 0.1,
					name: "floor"
				}),
				new PhysicsObject({
					shape: new Polygon(
						-50, -10,
						50, -10,
						50, 10,
						-50, 10
					),
					position: new Vector(width / 2, height / 2),
					elasticity: 0.1,
					name: "falling-rectangle"
				})
			], 0.1);
		}
	},
	{
		name: "slanted-falling-rectangle",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => {
			return new PhysicsWorld([
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
					elasticity: 0.1,
					name: "floor"
				}),
				new PhysicsObject({
					shape: new Polygon(
						-50, -10,
						50, -10,
						50, 10,
						-50, 10
					).rotate(45),
					position: new Vector(width / 2, height / 2),
					elasticity: 0.1,
					name: "slanted-falling-rectangle"
				})
			], 0.1);
		}
	},
	{
		name: "rectangle-falls-on-slope",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => {
			const FLOOR_SIZE = 150;
			return new PhysicsWorld([
				new PhysicsObject({
					shape: new Polygon(-50, -10, 50, -10, 50, 10, -50, 10),
					position: new Vector(width / 2, 0),
					elasticity: 0.1,
					selected: true,
					name: "falling-rectangle"
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
					elasticity: 0.1,
					name: "sloped-floor-block"
				})
			], 0.1);
		}
	},
	{
		name: "rectangle-falls-on-shallow-slope",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => {
			const FLOOR_SIZE = 150;
			return new PhysicsWorld([
				new PhysicsObject({
					shape: new Polygon(-50, -10, 50, -10, 50, 10, -50, 10),
					position: new Vector(width / 2, 0),
					elasticity: 0.1,
					selected: true,
					name: "falling-rectangle"
				}),
				new PhysicsObject({
					shape: new Polygon(
						FLOOR_SIZE * 3, FLOOR_SIZE,
						-FLOOR_SIZE * 3, FLOOR_SIZE,
						-FLOOR_SIZE * 3, 0,
						FLOOR_SIZE * 3, -FLOOR_SIZE
					),
					position: new Vector(width / 2, height / 2),
					immovable: true,
					antigravity: true,
					elasticity: 0.1,
					name: "sloped-floor-block"
				})
			], 0.1);
		}
	},
	{
		name: "adjacent-immovable-objects",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => new PhysicsWorld([
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width / 2 - 25, height / 2),
				antigravity: true,
				immovable: true,
				name: "left-block"
			}),
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width / 2 + 25, height / 2),
				antigravity: true,
				immovable: true,
				name: "right-block"
			}),
		], 0.1)
	},
	{
		name: "block-on-two-floors",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => new PhysicsWorld([
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width / 2 - 25, height / 2),
				antigravity: true,
				immovable: true,
				name: "left-immovable-block"
			}),
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width / 2 + 25, height / 2),
				antigravity: true,
				immovable: true,
				name: "right-immovable-block"
			}),
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width / 2, height / 2 - 50),
				name: "block-on-floor"
			})
		], 0.1)
	},
	{
		name: "multi-collision-comparison",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => new PhysicsWorld([
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width * 1/4, height * 3/8),
				velocity: new Vector(0, 3),
				elasticity: 1,
				name: "left-moving-block"
			}),
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width * 3/4, height * 3/8),
				velocity: new Vector(0, 3),
				elasticity: 1,
				name: "right-moving-block"
			}),
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width * 1/4 - 25 - 1, height * 5/8),
				elasticity: 1,
				name: "left-unmoving-block-1"
			}),
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width * 1/4 + 25 + 1, height * 5/8),
				elasticity: 1,
				name: "left-unmoving-block-2"
			}),
			new PhysicsObject({
				width: 100, height: 50,
				position: new Vector(width * 3/4, height * 5/8),
				elasticity: 1,
				name: "right-unmoving-block",
				mass: 2
			}),
		])
	},
	{
		name: "non-rotatable-object-collision",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => new PhysicsWorld([
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width * 3/8, height * 1/2),
				velocity: new Vector(3, 0),
				name: "left-moving-block",
				rotatable: false
			}),
			new PhysicsObject({
				width: 50, height: 50,
				position: new Vector(width * 5/8, height * 1/2 + 25),
				name: "right-unmoving-block",
				rotatable: false
			})
		])
	},
	{
		name: "air-resistance",
		world: (width = app.canvasIO.canvas.width, height = app.canvasIO.canvas.height) => new PhysicsWorld([
			new PhysicsObject({
				shape: new Polygon(-30, -10, -30, 10, 30, 0),
				position: new Vector(width * 1/4, height * 1/4),
				velocity: new Vector(3, 0),
				name: "aerodynamic-triangle"
			}),
			new PhysicsObject({
				shape: Polygon.rectangle(100, 100),
				position: new Vector(width * 1/4, height * 3/4),
				velocity: new Vector(3, 0),
				name: "large-square"
			})
		], 0, 1e-4)
	}
];
const findScenario = name => scenarios.find(s => s.name === name);
