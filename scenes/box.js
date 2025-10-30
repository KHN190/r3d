export default class BoxScript {
  constructor(r3d) {
    this.r3d = r3d;
    this.mesh = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mesh = r3d.scene.children.find(obj => obj.isMesh);
  }
  
  update() {
    // p5 API
    // set background color
    background(210);
    
    if (this.mesh) {
      this.mesh.position.x = this.mouseX * 3;
      this.mesh.position.y = -this.mouseY * 3;
    }
  }
  
  onMouseMove(normalizedX, normalizedY) {
    this.mouseX = normalizedX;
    this.mouseY = normalizedY;
  }
}
