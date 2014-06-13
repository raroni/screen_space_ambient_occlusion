function Renderer(canvas) {
  canvas.width = 1000;
  canvas.height = 400;
  this.glContext = canvas.getContext('webgl');
  this.canvas = canvas;
  this.boxRenderings = [];
}

Renderer.prototype.load = function() {
  var loader = new ShaderProgramCollectionLoader(this.glContext);
  loader.add('geometry', 'shaders/geometry.vert', 'shaders/geometry.frag');
  loader.add('positionDistance', 'shaders/position_distance.vert', 'shaders/position_distance.frag');
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
  this.setupPositionDistanceRenderer();
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
  this.texturePeekRenderer = new TexturePeekRenderer(
    this.glContext,
    this.shaderPrograms.texturePeek,
    this.positionDistanceRenderer.texture,
    aspectRatio
  );
  this.texturePeekRenderer.initialize();
};

Renderer.prototype.setCamera = function(camera) {
  this.geometryRenderer.camera = camera;
  this.positionDistanceRenderer.camera = camera;
};

Renderer.prototype.setupGeometryRenderer = function() {
  var resolution = {
    width: this.canvas.width,
    height: this.canvas.height
  };
  this.geometryRenderer = new GeometryRenderer(this.glContext, this.shaderPrograms.geometry, resolution, this.boxRenderings);
  this.geometryRenderer.initialize();
};

Renderer.prototype.setupPositionDistanceRenderer = function() {
  var resolution = {
    width: this.canvas.width,
    height: this.canvas.height
  };
  this.positionDistanceRenderer = new PositionDistanceRenderer(this.glContext, this.shaderPrograms.positionDistance, resolution, this.boxRenderings);
  this.positionDistanceRenderer.initialize();
};

Renderer.prototype.setupAmbientOcclusionRenderer = function() {
  var resolution = {
    width: this.canvas.width,
    height: this.canvas.height
  };
  this.ambientOcclusionRenderer = new AmbientOcclusionRenderer(
    this.glContext,
    this.shaderPrograms.ambientOcclusion,
    this.positionDistanceRenderer.texture,
    resolution
  );
  this.ambientOcclusionRenderer.initialize();
};

Renderer.prototype.setupGL = function() {
  this.glContext.enable(this.glContext.CULL_FACE);
  this.glContext.enable(this.glContext.DEPTH_TEST);
  if(!this.glContext.getExtension("OES_texture_float")) {
    throw new Error("Could not initialize OES_texture_float.");
  }
};

Renderer.prototype.setupPrograms = function() {
  this.setupGeometryProgram();
  this.setupPositionDistanceProgram();
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

Renderer.prototype.setupPositionDistanceProgram = function() {
  var program = this.shaderPrograms.positionDistance;

  program.setupAttributeHandle('ModelPosition');
  program.setupUniformHandle("ProjectionTransformation");
  program.setupUniformHandle("ModelWorldTransformation");
  program.setupUniformHandle("WorldViewTransformation");
  program.setupUniformHandle("DepthSpan");
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

  ['geometry', 'positionDistance', 'ambientOcclusion'].forEach(function(shaderProgramName) {
    var program = this.shaderPrograms[shaderProgramName];
    program.use();
    var uniformHandle = program.getUniformHandle('ProjectionTransformation');
    this.glContext.uniformMatrix4fv(uniformHandle, false, projection.components);
  }.bind(this));

  var inverseProjection = Matrix4.createInversePerspective(fieldOfView, aspectRatio, near, far);
  var inverseProjectionUniformHandle = this.shaderPrograms.ambientOcclusion.getUniformHandle('InverseProjectionTransformation');
  this.shaderPrograms.ambientOcclusion.use();
  this.glContext.uniformMatrix4fv(inverseProjectionUniformHandle, false, inverseProjection.components);

  var depthSpanUniformHandle = this.shaderPrograms.positionDistance.getUniformHandle('DepthSpan');
  this.shaderPrograms.positionDistance.use();
  this.glContext.uniform1f(depthSpanUniformHandle, far-near);
};

Renderer.prototype.addBox = function(box) {
  var renderer = new BoxRendering(this.glContext, box);
  this.boxRenderings.push(renderer);
};

Renderer.prototype.draw = function() {
  this.positionDistanceRenderer.draw();
  this.geometryRenderer.draw();
  this.ambientOcclusionRenderer.draw();
  this.finalizationRenderer.draw();
  this.texturePeekRenderer.draw();
};
