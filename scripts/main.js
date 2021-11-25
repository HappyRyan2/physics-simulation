class App {
	constructor() {
		this.physicsWorld = new PhysicsWorld();
		this.fps = 60;
		this.frameCount = 0;
		this.canvasIO = new CanvasIO();
		this.frameTimes = [];
		this.actualFPS = 60;
	}
	initialize() {
		this.canvasIO.activate();
		window.setInterval(() => {
			this.frameTimes.push(Date.now());
			this.update();
			this.display();
		}, 1000 / this.fps);
	}

	display() {
		this.physicsWorld.display(this.canvasIO.ctx);
		this.displayFrameCount(this.canvasIO.ctx);
		this.displayFrameRate(this.canvasIO.ctx);
	}
	update() {
		if(!this.physicsWorld.paused) {
			this.physicsWorld.update();
			this.frameCount ++;
			if(this.frameCount % 10 === 0) {
				this.updateFPS();
			}
		}
	}

	displayFrameCount(c) {
		c.textAlign = "left";
		c.textBaseline = "top";
		c.fillStyle = "black";
		c.font = "20px monospace";
		c.fillText(this.frameCount, 0, 0);
	}
	displayFrameRate(c) {
		c.textAlign = "right";
		c.textBaseline = "top";
		c.fillStyle = "black";
		c.font = "20px monospace";
		c.fillText(Math.round(this.actualFPS), c.canvas.width, 0);
	}

	updateFPS() {
		const NUM_FRAMES = 10;
		const duration = this.frameTimes[this.frameTimes.length - 1] - this.frameTimes[this.frameTimes.length - 1 - NUM_FRAMES];
		this.actualFPS = NUM_FRAMES * 1000 / duration;
	}
}

const app = new App();
app.initialize();
