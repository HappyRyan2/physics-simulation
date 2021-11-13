const app = {
	FPS: 60,
	physicsWorld: new PhysicsWorld(),

	display: () => {

	},
	update: () => {
		app.physicsWorld.update();
	},

	initialize: () => {
		window.setInterval(() => {
			app.update();
			app.display();
		}, 1000 / app.FPS);
	}
};
app.initialize();
