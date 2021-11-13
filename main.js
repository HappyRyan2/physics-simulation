const app = {
	FPS: 60,

	display: () => {

	},
	update: () => {
		
	},

	initialize: () => {
		window.setInterval(() => {
			app.update();
			app.display();
		}, 1000 / app.FPS);
	}
};
app.initialize();
