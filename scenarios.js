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
		name: "bouncing-ball",
		load: () => {
			const { width, height } = app.canvasIO.canvas;
			app.physicsWorld = new PhysicsWorld([
				new PhysicsObject({
					shape: new Circle(new Vector(width / 2, height / 2), 50),
				}),
				new PhysicsObject({
					shape: new Polygon([
						new Vector(0, height * 7/8),
						new Vector(width, height * 7/8),
						new Vector(width, height),
						new Vector(0, height)
					]),
					antigravity: true
				})
			], 0.1);
		}
	}
];
scenarios[1].load();
