function App(container) {
  var config = {
    ambientOcclusion: {
      constantAttenuation: 10,
      distanceAttenuation: 50,
      samplingRadius: 20
    }
  };

  this.renderer = new Renderer(config);
  this.keyboard = new Keyboard();
  this.keyboard.resume();
  this.configurator = new Configurator(config);

  this.element = document.createElement('div');
  this.element.appendChild(this.renderer.canvas);
  this.element.appendChild(this.configurator.element);
}

App.prototype.run = function() {
  this.renderer.onLoaded = function() {
    this.setupWorld();
    this.update();
  }.bind(this);
  this.renderer.load();
};

App.prototype.update = function() {
  var rotationSpeed = 0.02;
  if(this.keyboard.keysPressed['up']) {
    this.camera.transformation.rotation.components[0] += rotationSpeed;
  }
  if(this.keyboard.keysPressed['down']) {
    this.camera.transformation.rotation.components[0] -= rotationSpeed;
  }
  if(this.keyboard.keysPressed['right']) {
    this.camera.transformation.rotation.components[1] -= rotationSpeed;
  }
  if(this.keyboard.keysPressed['left']) {
    this.camera.transformation.rotation.components[1] += rotationSpeed;
  }
  if(this.keyboard.keysPressed.w) {
    var direction = this.camera.getDirection();
    direction.multiply(0.1);
    this.camera.transformation.position.add(direction);
  } else if (this.keyboard.keysPressed.s) {
    var direction = this.camera.getDirection();
    direction.multiply(0.1);
    this.camera.transformation.position.subtract(direction);
  }
  this.box5.transformation.rotation.components[1] += 0.01;
  //this.box.rotation.components[1] += 0.01;
  //this.light.transformation.rotation.components[1] += 0.03;
  //this.camera.transformation.rotation.components[1] += 0.03;
  this.renderer.draw();
  requestAnimationFrame(this.update.bind(this));
}

App.prototype.setupWorld = function() {
  this.camera = new Camera();
  this.renderer.setCamera(this.camera);

  var distance = 2;

  var box1 = new Box();
  box1.transformation.position.components[0] = -distance;
  box1.transformation.position.components[1] = 0.5;
  box1.transformation.position.components[2] = distance;
  this.renderer.addBox(box1);
  
  var box2 = new Box();
  box2.transformation.position.components[0] = distance;
  box2.transformation.position.components[1] = 0.5;
  box2.transformation.position.components[2] = distance;
  this.renderer.addBox(box2);
  
  var box3 = new Box();
  box3.transformation.position.components[0] = -distance;
  box3.transformation.position.components[1] = 0.5;
  box3.transformation.position.components[2] = -distance;
  this.renderer.addBox(box3);
  
  var box4 = new Box();
  box4.transformation.position.components[0] = distance;
  box4.transformation.position.components[1] = 0.5;
  box4.transformation.position.components[2] = -distance;
  this.renderer.addBox(box4);

  var box5 = new Box();
  box5.transformation.position.components[0] = 0;
  box5.transformation.position.components[1] = 0;
  box5.transformation.position.components[2] = 0;
  this.renderer.addBox(box5);
  this.box5 = box5;

  var box6 = new Box();
  box6.transformation.position.components[0] = -2;
  box6.transformation.position.components[1] = 0.05;
  box6.transformation.position.components[2] = -3;
  box6.size = new Vector3(0.1, 0.1, 0.1);
  this.renderer.addBox(box6);
  this.box6 = box6;

  var floor = new Box();
  floor.size.components[0] = 8;
  floor.size.components[1] = 0.25;
  floor.size.components[2] = 8;
  floor.transformation.position.components[1] = -0.125;
  this.renderer.addBox(floor);

  var backWall = new Box();
  backWall.size.components[0] = 4.25;
  backWall.size.components[1] = 2.5;
  backWall.size.components[2] = 0.25;
  backWall.transformation.position.components[0] = -2.125;
  backWall.transformation.position.components[1] = 1;
  backWall.transformation.position.components[2] = 4.125;
  this.renderer.addBox(backWall);

  var leftWall = new Box();
  leftWall.size.components[0] = 0.25;
  leftWall.size.components[1] = 2.5;
  leftWall.size.components[2] = 8;
  leftWall.transformation.position.components[0] = -4.125;
  leftWall.transformation.position.components[1] = 1;
  leftWall.transformation.position.components[2] = 0;
  this.renderer.addBox(leftWall);

  this.light = new Light();
  this.light.transformation.rotation = new Vector3(-0.6, 0.4, 0);
  this.light.transformation.position = new Vector3(2, 4, -5);
  this.renderer.setLight(this.light);
};
