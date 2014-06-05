function Renderer(canvas) {
  canvas.width = 1000;
  canvas.height = 400;
  this.glContext = canvas.getContext('webgl');
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
    this.setupGeometryRenderer();
    this.onLoaded();
  }.bind(this);
  loader.execute();
};

Renderer.prototype.setLight = function(light) {
  this.geometryRenderer.light = light;
};

Renderer.prototype.setCamera = function(camera) {
  this.geometryRenderer.camera = camera;
};

Renderer.prototype.setupGeometryRenderer = function() {
  this.geometryRenderer = new GeometryRenderer(this.glContext, this.shaderPrograms.geometry);
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
  this.geometryRenderer.addBox(box);
};

Renderer.prototype.draw = function() {
  this.glContext.viewport(0, 0, this.canvas.width, this.canvas.height);
  this.glContext.clearColor(1, 1, 1, 1);
  this.glContext.clear(this.glContext.COLOR_BUFFER_BIT | this.glContext.DEPTH_BUFFER_BIT);

  this.geometryRenderer.draw();
};
