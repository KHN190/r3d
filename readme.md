# R3D

R3D is a game engine for 2D/3D. It elevates three.js & p5.js for UI, 2D animation and 3D rendering.

For samples, see [`./scenes`](./scenes). Each of the scenes have their own script. Future it may include a visual editor.

## Why do I need it?

R3D builds with Tauri, which runs on native webview.

This allows R3D to run cross-platform with slightly render efficiency loss compared to Godot, but gives accessibility to any JS runtime (e.g. transformer.js). Initially I use this for integrating AI models for a game project, it forked to be a standalone game engine by itself.

The build will be much smaller than the bloated Electron, while debug is obvious with any web developer tools - which I believe easier than Godot, Unity and Lua projects.

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
npm install

cd src-tauri
cargo build
```

Then you can skip above and start it,

```bash
npm run dev
```

This launches the Tauri app with hot reload.

## Build and Debug

See [Tauri](https://github.com/tauri-apps/tauri) for build and debug docs.

## License

MIT
