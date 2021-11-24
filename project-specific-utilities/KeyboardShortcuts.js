class KeyboardShortcut {
	constructor(action, key, modifiers) {
		this.action = action;
		this.key = key;
		this.modifiers = modifiers ?? {};
		this.modifiers.ctrl = this.modifiers.ctrl ?? false;
		this.modifiers.alt = this.modifiers.alt ?? false;
		this.modifiers.shift = this.modifiers.shift ?? false;
	}

	matches(event) {
		return (
			event.ctrlKey === this.modifiers.ctrl &&
			event.altKey === this.modifiers.alt &&
			event.shiftKey === this.modifiers.shift &&
			event.code === this.key
		);
	}
}

class KeyboardShortcuts {
	constructor(shortcuts) {
		this.shortcuts = shortcuts;
		document.body.addEventListener("keydown", (event) => {
			this.update(event);
		});
	}

	update(event) {
		const matchingShortcut = this.shortcuts.find(s => s.matches(event));
		matchingShortcut?.action?.();
	}
}
const keyboardShortcuts = new KeyboardShortcuts([
	new KeyboardShortcut(() => {
		app.physicsWorld.paused = !app.physicsWorld.paused;
	}, "Space"),
	new KeyboardShortcut(() => {
		if(app.physicsWorld.paused) {
			app.physicsWorld.update();
		}
	}, "ArrowRight"),
	new KeyboardShortcut(() => {
		if(app.physicsWorld.paused) {
			for(let i = 0; i < 5; i ++) {
				app.physicsWorld.update();
			}
		}
	}, "ArrowRight", { ctrl: true })
]);
