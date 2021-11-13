class App {
	constructor() {
		this.physicsWorld = new PhysicsWorld();
		this.fps = 60;
		this.canvasIO = new CanvasIO();
	}
	initialize() {
		this.canvasIO.activate();
		window.setInterval(() => {
			this.update();
			this.display();
		}, 1000 / this.fps);
	}

	display() {
		this.physicsWorld.display(this.canvasIO.ctx);
	}
	update() {
		this.physicsWorld.update();
	}
}

const app = new App();
app.initialize();
