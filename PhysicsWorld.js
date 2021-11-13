class PhysicsWorld {
	constructor(objects) {
		this.objects = objects ?? [];
	}

	update() {
		for(const obj of this.objects) {
			obj.update();
		}
	}
}
