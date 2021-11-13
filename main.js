class App {
	constructor() {
		this.physicsWorld = new PhysicsWorld();
		this.fps = 60;
	}
	initialize() {
		window.setInterval(() => {
			this.update();
			this.display();
		}, 1000 / this.fps);
	}

	display() {

	}
	update() {
		this.physicsWorld.update();
	}
}

const app = new App();
app.initialize();
