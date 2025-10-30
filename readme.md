# R3D

R3D is a game engine for 2D/3D. It elevates three.js & p5.js for UI, 2D animation and 3D rendering.

For examples, see [`./scenes`](./scenes). Each of the scenes have their own script. Future it may include a visual editor for the scenes.

## Why R3D / JavaScript?

R3D builds with Tauri, which runs on native webview. This allows R3D to run cross-platform with slightly render efficiency loss compared to Godot.

Its yet another close friend is [Love2d](https://www.love2d.org), but with accessibility to any JS runtime (e.g. transformer.js).

## Load a Scene

To view a scene, edit `main.js`,

```javascript
setup() {
	// ...
	//
	// load the scene 'box.json' with script `box.js`
	// defined in ./scenes
	//
	requestScene('box');
}
```

If you are first time building the app,

```bash
cd src-tauri
cargo build
```

Then you can skip above and start it,

```bash
npm run dev
```

This launches the Tauri app with hot reload.

## License

MIT
