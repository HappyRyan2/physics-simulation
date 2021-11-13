const scenarios = [
	{
		name: "falling-ball",
		load: () => {
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject(
					new Circle(new Vector(app.canvasIO.canvas.width / 2, app.canvasIO.canvas.height / 2), 50),
					1
				)
			], 0.1);
		}
	},
	{
		name: "bouncing-ball",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject(
					new Circle(new Vector(width / 2, height / 2), 50),
					1
				),
				new PhysicsObject(
					new Polygon([
						new Vector(0, height * 7/8),
						new Vector(width, height * 7/8),
						new Vector(width, height),
						new Vector(0, height)
					])
				)
			], 0.1);
		}
	}
];
scenarios[1].load();
