let debugMode = false;

async function preload() {
  console.log('preloading...');
  if (window.r3d) await window.r3d.preload();
}

function setup() {
  console.log('setup main');
  createCanvas(windowWidth, windowHeight);
  frameRate(30);

  if (window.r3d) {
    window.r3d.setup();
    // window.r3d.requestScene('box');
    window.r3d.requestScene('ojos');
  }
}

function draw() {
  if (window.r3d) {
    window.r3d.render();
    if (window.r3d.stats) {
      window.r3d.stats.begin();
      window.r3d.stats.end();
    }
  }
}

function mouseDragged() {
  if (window.r3d) {
    const normalizedX = (mouseX / windowWidth) * 2 - 1;
    const normalizedY = (mouseY / windowHeight) * 2 - 1;
    window.r3d.onMouseDragged(normalizedX, normalizedY);
  }
  return true;
}

function mouseMoved() {
  if (window.r3d) {
    const normalizedX = (mouseX / windowWidth) * 2 - 1;
    const normalizedY = (mouseY / windowHeight) * 2 - 1;
    window.r3d.onMouseMove(normalizedX, normalizedY);
  }
  return true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  if (window.r3d) {
    window.r3d.windowResized();
  }
}

function keyPressed() {
  if (window.r3d) {
    window.r3d.keyPressed(key);
  }
  return true;
}