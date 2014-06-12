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
  loader.add('texturePeek', 'shaders/texture_peek.vert', 'shaders/texture_peek.frag');
  loader.add('finalization', 'shaders/finalization.vert', 'shaders/finalization.frag');

  loader.onCompletion = function() {
    this.setupGL();
    this.shaderPrograms = loader.programs;
    this.setupPrograms();
    this.setupPerspective();
    this.setupRenderers();
    this.onLoaded();
  }.bind(this);
  loader.execute();
};

Renderer.prototype.setLight = function(light) {
  this.geometryRenderer.light = light;
};

Renderer.prototype.setupRenderers = function() {
  this.setupGeometryRenderer();
  this.setupMetadataRenderer();
  this.setupAmbientOcclusionRenderer();
  this.setupTexturePeekRenderer();
  this.setupFinalizationRenderer();
};

Renderer.prototype.setupFinalizationRenderer = function() {
  var resolution = {
    width: this.canvas.width,
    height: this.canvas.height
  };
  this.finalizationRenderer = new FinalizationRenderer(
    this.glContext,
    this.shaderPrograms.finalization,
    resolution,
    this.geometryRenderer.texture,
    this.ambientOcclusionRenderer.resultTexture
  );
  this.finalizationRenderer.initialize();
};

Renderer.prototype.setupTexturePeekRenderer = function() {
  var aspectRatio = this.canvas.width/this.canvas.height;
  this.texturePeekRenderer = new TexturePeekRenderer(this.glContext, this.shaderPrograms.texturePeek, this.metadataRenderer.texture, aspectRatio);
  this.texturePeekRenderer.initialize();
};

Renderer.prototype.setCamera = function(camera) {
  this.geometryRenderer.camera = camera;
  this.metadataRenderer.camera = camera;
};

Renderer.prototype.setupGeometryRenderer = function() {
  var resolution = {
    width: this.canvas.width,
    height: this.canvas.height
  };
  this.geometryRenderer = new GeometryRenderer(this.glContext, this.shaderPrograms.geometry, resolution, this.boxRenderers);
  this.geometryRenderer.initialize();
};

Renderer.prototype.setupMetadataRenderer = function() {
  var resolution = {
    width: this.canvas.width,
    height: this.canvas.height
  };
  this.metadataRenderer = new MetadataRenderer(this.glContext, this.shaderPrograms.metadata, resolution, this.boxRenderers);
  this.metadataRenderer.initialize();
};

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
  this.setupTexturePeekProgram();
  this.setupFinalizationProgram();
};

Renderer.prototype.setupTexturePeekProgram = function() {
  var program = this.shaderPrograms.texturePeek;
  program.setupAttributeHandle('Position');
  program.setupAttributeHandle('TextureCoordinates');
  program.setupUniformHandle("InverseAspectRatio");
  program.setupUniformHandle("Sampler");
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

Renderer.prototype.setupFinalizationProgram = function() {
  var program = this.shaderPrograms.finalization;
  program.setupAttributeHandle('Position');

  program.setupUniformHandle("AmbientOcclusionTexture");
  program.setupUniformHandle("GeometryTexture");
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
  program.setupUniformHandle('InverseProjectionTransformation');
  program.setupUniformHandle('ProjectionTransformation');
  program.setupUniformHandle('Kernel');
  program.setupUniformHandle('KernelSize');
  program.setupUniformHandle('Noise');
};

Renderer.prototype.setupPerspective = function() {
  var fieldOfView = Math.PI*(0.5*0.66);
  var aspectRatio = this.canvas.width/this.canvas.height;
  var near = 0.1;
  var far = 100;
  var projection = Matrix4.createPerspective(fieldOfView, aspectRatio, near, far);

  ['geometry', 'metadata', 'ambientOcclusion'].forEach(function(shaderProgramName) {
    var program = this.shaderPrograms[shaderProgramName];
    program.use();
    var uniformHandle = program.getUniformHandle('ProjectionTransformation');
    this.glContext.uniformMatrix4fv(uniformHandle, false, projection.components);
  }.bind(this));

  var inverseProjection = Matrix4.createInversePerspective(fieldOfView, aspectRatio, near, far);

  var inverseProjectionUniformHandle = this.shaderPrograms.ambientOcclusion.getUniformHandle('InverseProjectionTransformation');
  this.glContext.uniformMatrix4fv(inverseProjectionUniformHandle, false, inverseProjection.components);
};

Renderer.prototype.addBox = function(box) {
  var renderer = new BoxRenderer(this.glContext, box);
  this.boxRenderers.push(renderer);
};

Renderer.prototype.draw = function() {
  this.metadataRenderer.draw();
  this.geometryRenderer.draw();
  this.ambientOcclusionRenderer.draw();
  this.finalizationRenderer.draw();
  this.texturePeekRenderer.draw();
};
