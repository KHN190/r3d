export default class OjosScript {
  constructor(r3d) {
    this.r3d = r3d;
    this.mouseX = 0;
    this.mouseY = 0;
    this.object = r3d.scene.children.find(obj => obj.isGroup);

    this.initRotationY = this.object.rotation.y;
  }
  
  update() {
    background(210);
    
    if (this.object) {
      this.object.position.x = this.mouseX * 2.5;
      this.object.position.y = -this.mouseY * 2.5;
      this.object.position.z = 0;
      
      const lookAtX = this.mouseX * 10;
      const lookAtY = -this.mouseY * 8;
      const lookAtZ = 10; 
      this.object.lookAt(lookAtX, lookAtY, lookAtZ);
      
      this.object.rotation.y += this.initRotationY;
    }
  }
  
  onMouseMove(normalizedX, normalizedY) {
    this.mouseX = normalizedX;
    this.mouseY = normalizedY;
  }
}
