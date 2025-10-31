# R3D

R3D is a game engine for 2D/3D. It elevates three.js & p5.js for UI, 2D animation and 3D rendering.

For samples, see [`./scenes`](./scenes). Each of the scenes have their own script. Future it may include a visual editor.

## Why do I need it?

R3D builds with Tauri, which runs on native webview.

A game engine serves four purposes: 1. **render**, 2. **script**, 3. **debug**, 4. **build**. It may also include an editor.

Built with Tauri, it allows R3D to run cross-platform with slightly render efficiency loss compared to Godot, but gives accessibility to any JS runtime (e.g. transformer.js). CPU intensive work / OS access can be either written in Rust (e.g. filesystem); or can be done with WASM. Initially I use this for integrating AI models for a project, it forked to be a standalone game engine by itself.

The build will be [much smaller](https://gethopp.app/blog/tauri-vs-electron) than the bloated Electron, while debug is obvious with any web developer tools - which I believe easier than Godot, Unity and Lua projects.

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
