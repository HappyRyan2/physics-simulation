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
	}
];
scenarios[0].load();
