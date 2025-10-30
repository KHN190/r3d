/**
 * r3d.js - Three.js 3D renderer
 */

const r3d = {
  scene: null,
  camera: null,
  renderer: null,
  canvas: null,

  mtlLoader: null,
  objLoader: null,
  
  enabled: false,
  interactive: false,
  stats: null,
  
  sceneCache: {},
  currentScene: null,
  pendingScene: null,

  async preload() {},

  /**
   * Init
   */
  setup() {
    console.log('initialize r3d');
    
    this.scene = new THREE.Scene();
    this.scene.background = null;    
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.z = 5;
    
    this.renderer = new THREE.WebGPURenderer({ 
      alpha: true,
      antialias: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    this.canvas = this.renderer.domElement;
    this.canvas.id = 'r3d-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '10';
    this.canvas.style.pointerEvents = 'none';    
    document.body.appendChild(this.canvas);

    this.mtlLoader = new MTLLoader();
    this.objLoader = new OBJLoader();

    // pause render when window is not visible
    document.addEventListener('visibilitychange', () => {
      r3d.enabled = !document.hidden;
    });
    
    this.initStats();
    // this.hide();
    this.show();
  },
  
  /**
   * Set up perf stats monitor
   */
  initStats() {
    if (typeof Stats !== 'undefined') {
      this.stats = new Stats();
      this.stats.showPanel(0);      this.stats.dom.style.position = 'absolute';
      this.stats.dom.style.top = '10px';
      this.stats.dom.style.right = '10px';
      this.stats.dom.style.left = 'auto';
      this.stats.dom.style.zIndex = '100';
      document.body.appendChild(this.stats.dom);
      console.log('Stats.js initialized at top-right corner');
    } else {
      console.warn('Stats.js not loaded');
    }
  },

  requestScene(sceneName) {
    if (this.pendingScene === sceneName) return;
    this.pendingScene = sceneName;
    
    this.loadScene(sceneName).then(async config => {
      if (config && this.pendingScene === sceneName) {
        await this.applyScene(config, sceneName);
        this.pendingScene = null;
      }
    });
  },

  async applyScene(config, sceneName) {
    this.clearScene();
    this.setupCamera(config.camera);
    config.lights?.forEach(light => this.addLight(light));
    
    if (config.objects) {
      await Promise.all(config.objects.map(obj => this.addObject(obj)));
    }
    
    if (config.postProcessing) {
      this.setupPostProcessing(config.postProcessing);
    }

    await this.loadScript(sceneName);
    
    this.currentScene = sceneName;
    console.log(`Scene applied: ${sceneName}`);
  },
  
  /**
   * Load scene config JSON
   */
  async loadScene(sceneName) {
    if (this.sceneCache[sceneName]) {
      console.log(`Using cached scene: ${sceneName}`);
      return this.sceneCache[sceneName];
    }
    
    try {
      const response = await fetch(`./scenes/${sceneName}.json`);
      const config = await response.json();
      
      this.sceneCache[sceneName] = config;
      console.log(`Loaded scene: ${sceneName}`);
      return config;

    } catch (error) {
      console.error(`Failed to load scene ${sceneName}:`, error);
      return null;
    }
  },

  clearScene() {
    if (!this.scene) return;

    const disposeObject = (obj) => {
      if (obj.children && obj.children.length > 0) {
        obj.children.forEach(child => disposeObject(child));
      }
      
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    };

    while (this.scene.children.length > 0) {
      const obj = this.scene.children[0];
      disposeObject(obj);
      this.scene.remove(obj);
    }
    this.script = null;
    
    console.log('Scene cleared');
  },
  
  /**
   * Setup camera from config
   */
  setupCamera(config) {
    if (!config) return;
    
    if (config.position) {
      this.camera.position.set(...config.position);
    }
    
    if (config.lookAt) {
      this.camera.lookAt(...config.lookAt);
    }
    
    if (config.fov) {
      this.camera.fov = config.fov;
      this.camera.updateProjectionMatrix();
    }
  },
  
  /**
   * Add light to scene
   */
  addLight(config) {
    let light;
    const color = typeof config.color === 'string' ? parseInt(config.color, 16) : config.color;
    
    switch (config.type) {
      case 'AmbientLight':
        light = new THREE.AmbientLight(color, config.intensity);
        break;
        
      case 'DirectionalLight':
        light = new THREE.DirectionalLight(color, config.intensity);
        if (config.position) {
          light.position.set(...config.position);
        }
        break;
        
      case 'PointLight':
        light = new THREE.PointLight(color, config.intensity, config.distance || 0, config.decay || 2);
        if (config.position) {
          light.position.set(...config.position);
        }
        break;
        
      case 'SpotLight':
        light = new THREE.SpotLight(color, config.intensity, config.distance, config.angle, config.penumbra);
        if (config.position) {
          light.position.set(...config.position);
        }
        if (config.target) {
          light.target.position.set(...config.target);
        }
        break;
        
      default:
        console.warn(`Unknown light type: ${config.type}`);
        return;
    }
    
    if (light) {
      this.scene.add(light);
    }
  },
  
  /**
   * Add object to scene
   */
  async addObject(config) {
    if (config.type === 'mesh') {
      await this.addMesh(config);
    } else if (config.type === 'model') {
      await this.addModel(config);
    }
  },
  
  /**
   * Add mesh object
   */
  async addMesh(config) {
    // Create geometry
    let geometry;
    const geomConfig = config.geometry;
    const args = geomConfig.args || [];
    
    switch (geomConfig.type) {
      case 'BoxGeometry':
        geometry = new THREE.BoxGeometry(...args);
        break;
      case 'SphereGeometry':
        geometry = new THREE.SphereGeometry(...args);
        break;
      case 'PlaneGeometry':
        geometry = new THREE.PlaneGeometry(...args);
        break;
      case 'CylinderGeometry':
        geometry = new THREE.CylinderGeometry(...args);
        break;
      default:
        console.warn(`Unknown geometry type: ${geomConfig.type}`);
        return;
    }
    
    // Create material
    const matConfig = config.material;
    const color = typeof matConfig.color === 'string' ? parseInt(matConfig.color, 16) : matConfig.color;
    
    let material;
    switch (matConfig.type) {
      case 'MeshStandardMaterial':
        material = new THREE.MeshStandardMaterial({
          color,
          transparent: matConfig.transparent,
          opacity: matConfig.opacity,
          metalness: matConfig.metalness || 0,
          roughness: matConfig.roughness || 1
        });
        break;
      case 'MeshBasicMaterial':
        material = new THREE.MeshBasicMaterial({
          color,
          transparent: matConfig.transparent,
          opacity: matConfig.opacity
        });
        break;
      default:
        material = new THREE.MeshStandardMaterial({ color });
    }
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    
    if (config.position) mesh.position.set(...config.position);
    if (config.rotation) mesh.rotation.set(...config.rotation);
    if (config.scale) mesh.scale.set(...config.scale);
    if (config.name) mesh.name = config.name;
    
    this.scene.add(mesh);
  },
  
  /**
   * Add 3D model [.obj]
   */
  async addModel(config) {    
    try {
      const materials = await this.mtlLoader.loadAsync(config.material);
      materials.preload();
      this.objLoader.setMaterials(materials);
      
      const object = await this.objLoader.loadAsync(config.mesh);

      if (config.position) object.position.set(...config.position);
      if (config.rotation) object.rotation.set(...config.rotation);
      if (config.scale) object.scale.set(...config.scale);
      if (config.name) object.name = config.name;
      
      this.scene.add(object);
      console.log(`Model loaded: ${config.mesh}`);
      
    } catch (error) {
      console.error(`Failed to load model ${config.mesh}:`, error);
    }
  },
  
  setupPostProcessing(config) {
    console.log('Post-processing config:', config);
    // TODO: Implement post-processing effects
  },

  async loadScript(sceneName) {
    try {
      const module = await import(`../scenes/${sceneName}.js`);
      this.script = new module.default(this);
      console.log(`Script loaded: ${sceneName}.js`);
      
    } catch (error) {
      console.warn(`No script found for scene: ${sceneName}`);
      this.script = null;
    }
  },
  
  render() {
    if (!this.enabled) return;
    if (this.stats) this.stats.begin();
    if (this.scene && this.camera) this.renderer.render(this.scene, this.camera);
    if (this.stats) this.stats.end();
    if (this.script && this.script.update) this.script.update();
  },
  
  show() {
    this.enabled = true;
    if (this.canvas) {
      this.canvas.style.display = 'block';
    }
    console.log('3D renderer enabled');
  },
  
  hide() {
    this.enabled = false;
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
    console.log('3D renderer disabled');
  },
  
  /**
   * Enable/Disable interaction
   */
  setInteractive(interactive) {
    this.interactive = interactive;
    if (this.canvas) {
      this.canvas.style.pointerEvents = interactive ? 'auto' : 'none';
    }
    console.log(`3D renderer interactive: ${interactive}`);
  },
  
  onMouseMove(normalizedX, normalizedY) {
    if (!this.enabled) return;
    if (this.script && this.script.onMouseMove) {
      this.script.onMouseMove(normalizedX, normalizedY);
    }
  },

  onMouseDragged(normalizedX, normalizedY) {
    if (!this.enabled) return;
    if (this.script && this.script.onMouseDragged) {
      this.script.onMouseDragged(normalizedX, normalizedY);
    }
  },
  
  windowResized() {
    if (!this.camera || !this.renderer) return;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    console.log('r3d resized');
  },

  keyPressed(key) {
    if (!this.enabled) return;
    if (this.script && this.script.keyPressed) {
      this.script.keyPressed(key);
    }

    console.log('r3d key pressed: ' + key);
  },

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    if (this.stats && this.stats.dom.parentNode) {
      this.stats.dom.parentNode.removeChild(this.stats.dom);
    }
  }
};

window.r3d = r3d;
