function Renderer(canvas) {
  canvas.width = 1000;
  canvas.height = 400;
  this.glContext = canvas.getContext('webgl');
  this.boxRenderers = [];
  this.canvas = canvas;
}

Renderer.prototype.load = function() {
  var loader = new ShaderProgramCollectionLoader(this.glContext);
  loader.add('geometry', 'shaders/geometry.vert', 'shaders/geometry.frag');

  loader.onCompletion = function() {
    this.setupGL();
    this.shaderPrograms = loader.programs;
    this.setupPrograms();
    this.setupPerspective();
    this.onLoaded();
  }.bind(this);
  loader.execute();
};

Renderer.prototype.setLight = function(light) {
  this.light = light;
};

Renderer.prototype.setupGL = function() {
  this.glContext.enable(this.glContext.CULL_FACE);
  this.glContext.enable(this.glContext.DEPTH_TEST);
};

Renderer.prototype.setupPrograms = function() {
  this.setupGeometryProgram();
};

Renderer.prototype.setupGeometryProgram = function() {
  var program = this.shaderPrograms.geometry;

  ['Position', 'Normal'].forEach(function(attributeName) {
    program.setupAttributeHandle(attributeName);
  }.bind(this));

  program.setupUniformHandle("ProjectionTransformation");
  program.setupUniformHandle("ModelWorldTransformation");
  program.setupUniformHandle("WorldLightDirection");
  program.setupUniformHandle("WorldViewTransformation");
};

Renderer.prototype.setupPerspective = function() {
  var fieldOfView = Math.PI*(0.5*0.66);
  var aspectRatio = this.canvas.width/this.canvas.height;
  var near = 0.1;
  var far = 100;
  var matrix = Matrix4.createPerspective(fieldOfView, aspectRatio, near, far);

  var program = this.shaderPrograms.geometry;
  program.use();
  var uniformHandle = program.getUniformHandle('ProjectionTransformation');
  this.glContext.uniformMatrix4fv(uniformHandle, false, matrix.components);
};

Renderer.prototype.addBox = function(box) {
  var renderer = new BoxRenderer(this.glContext, box);
  this.boxRenderers.push(renderer);
};

Renderer.prototype.draw = function() {
  this.glContext.viewport(0, 0, this.canvas.width, this.canvas.height);
  this.glContext.clearColor(1, 1, 1, 1);
  this.glContext.clear(this.glContext.COLOR_BUFFER_BIT | this.glContext.DEPTH_BUFFER_BIT);

  var program = this.shaderPrograms.geometry;
  program.use();

  ['Position', 'Normal'].forEach(function(attributeName) {
    var handle = program.getAttributeHandle(attributeName);
    this.glContext.enableVertexAttribArray(handle);
  }.bind(this));

  var worldViewUniformHandle = program.getUniformHandle('WorldViewTransformation');
  this.glContext.uniformMatrix4fv(worldViewUniformHandle, false, this.camera.getInverseTransformation().components);

  var lightUniformHandle = program.getUniformHandle('WorldLightDirection');
  var direction = this.light.getDirection();
  this.glContext.uniform3fv(lightUniformHandle, direction.components);;

  var lightProjectionTransformationUniformHandle = program.getUniformHandle('LightProjectionTransformation');
  var projection = Matrix4.createOrthographic(-5, 5, -5, 5, 0.1, 100);
  this.glContext.uniformMatrix4fv(lightProjectionTransformationUniformHandle, false, projection.components);

  this.boxRenderers.forEach(function(renderer) {
    renderer.draw(program);
  });

  ['Position', 'Normal'].forEach(function(attributeName) {
    var handle = program.getAttributeHandle(attributeName);
    this.glContext.disableVertexAttribArray(handle);
  }.bind(this));
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);
};
