class App {
	constructor() {
		this.physicsWorld = new PhysicsWorld();
		this.fps = 60;
		this.frameCount = 0;
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
		this.displayFrameCount(this.canvasIO.ctx);
	}
	update() {
		this.physicsWorld.update();
		this.frameCount ++;
	}

	displayFrameCount(c) {
		c.textAlign = "left";
		c.textBaseline = "top";
		c.fillStyle = "black";
		c.font = "20px monospace";
		c.fillText(this.frameCount, 0, 0);
	}
}

const app = new App();
app.initialize();
