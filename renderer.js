function Renderer(canvas) {
  canvas.width = 1000;
  canvas.height = 400;
  this.glContext = canvas.getContext('webgl');
  this.canvas = canvas;
  this.boxRenderers = [];
}

Renderer.prototype.load = function() {
  var loader = new ShaderProgramCollectionLoader(this.glContext);
  loader.add('geometry', 'shaders/geometry.vert', 'shaders/geometry.frag');
  loader.add('metadata', 'shaders/metadata.vert', 'shaders/metadata.frag');
  loader.add('ambientOcclusion', 'shaders/ambient_occlusion.vert', 'shaders/ambient_occlusion.frag');

  loader.onCompletion = function() {
    this.setupGL();
    this.shaderPrograms = loader.programs;
    this.setupPrograms();
    this.setupPerspective();
    this.setupGeometryRenderer();
    this.setupMetadataRenderer();
    this.setupAmbientOcclusionRenderer();
    this.onLoaded();
  }.bind(this);
  loader.execute();
};

Renderer.prototype.setLight = function(light) {
  this.geometryRenderer.light = light;
};

Renderer.prototype.setCamera = function(camera) {
  this.geometryRenderer.camera = camera;
  this.metadataRenderer.camera = camera;
};

Renderer.prototype.setupGeometryRenderer = function() {
  this.geometryRenderer = new GeometryRenderer(this.glContext, this.shaderPrograms.geometry, this.boxRenderers);
};

Renderer.prototype.setupMetadataRenderer = function() {
  var resolution = {
    width: this.canvas.width,
    height: this.canvas.height
  };
  this.metadataRenderer = new MetadataRenderer(this.glContext, this.shaderPrograms.metadata, resolution, this.boxRenderers);
  this.metadataRenderer.initialize();
}

Renderer.prototype.setupAmbientOcclusionRenderer = function() {
  var resolution = {
    width: this.canvas.width,
    height: this.canvas.height
  };
  this.ambientOcclusionRenderer = new AmbientOcclusionRenderer(
    this.glContext,
    this.shaderPrograms.ambientOcclusion,
    this.metadataRenderer.texture,
    resolution
  );
  this.ambientOcclusionRenderer.initialize();
};

Renderer.prototype.setupGL = function() {
  this.glContext.enable(this.glContext.CULL_FACE);
  this.glContext.enable(this.glContext.DEPTH_TEST);
};

Renderer.prototype.setupPrograms = function() {
  this.setupGeometryProgram();
  this.setupMetadataProgram();
  this.setupAmbientOcclusionProgram();
};

Renderer.prototype.setupGeometryProgram = function() {
  var program = this.shaderPrograms.geometry;

  ['ModelPosition', 'ModelNormal'].forEach(function(attributeName) {
    program.setupAttributeHandle(attributeName);
  }.bind(this));

  program.setupUniformHandle("ProjectionTransformation");
  program.setupUniformHandle("ModelWorldTransformation");
  program.setupUniformHandle("WorldLightDirection");
  program.setupUniformHandle("WorldViewTransformation");
};

Renderer.prototype.setupMetadataProgram = function() {
  var program = this.shaderPrograms.metadata;

  ['ModelPosition', 'ModelNormal'].forEach(function(attributeName) {
    program.setupAttributeHandle(attributeName);
  }.bind(this));

  program.setupUniformHandle("ProjectionTransformation");
  program.setupUniformHandle("ModelWorldTransformation");
  program.setupUniformHandle("WorldViewTransformation");
};

Renderer.prototype.setupAmbientOcclusionProgram = function() {
  var program = this.shaderPrograms.ambientOcclusion;
  program.setupAttributeHandle('Position');
  program.setupUniformHandle('Metadata');
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

  this.metadataRenderer.draw();
  this.ambientOcclusionRenderer.draw();
  this.geometryRenderer.draw();
};
