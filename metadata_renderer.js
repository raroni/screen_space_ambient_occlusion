function MetadataRenderer(glContext, shaderProgram, resolution, boxRenderers) {
  this.glContext = glContext;
  this.shaderProgram = shaderProgram;
  this.resolution = resolution;
  this.boxRenderers = boxRenderers;
}

MetadataRenderer.prototype.initialize = function() {
  var gl = this.glContext;

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    this.resolution.width,
    this.resolution.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var depthRenderBufferHandle = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBufferHandle);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.resolution.width, this.resolution.height);

  var frameBufferHandle = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferHandle)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBufferHandle);

  var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if(status != gl.FRAMEBUFFER_COMPLETE) {
    throw new Error("Frame buffer not complete.");
  }

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  this.texture = texture;
  this.frameBufferHandle = frameBufferHandle;
};

MetadataRenderer.prototype.draw = function() {
  this.glContext.bindFramebuffer(this.glContext.FRAMEBUFFER, this.frameBufferHandle);
  this.glContext.viewport(0, 0, this.resolution.width, this.resolution.height);
  this.glContext.clear(this.glContext.COLOR_BUFFER_BIT | this.glContext.DEPTH_BUFFER_BIT);

  var program = this.shaderProgram;
  program.use();

  ['ModelPosition', 'ModelNormal'].forEach(function(attributeName) {
    var handle = program.getAttributeHandle(attributeName);
    this.glContext.enableVertexAttribArray(handle);
  }.bind(this));

  var worldViewUniformHandle = program.getUniformHandle('WorldViewTransformation');
  this.glContext.uniformMatrix4fv(worldViewUniformHandle, false, this.camera.getInverseTransformation().components);

  this.boxRenderers.forEach(function(renderer) {
    renderer.draw(program);
  });

  ['ModelPosition', 'ModelNormal'].forEach(function(attributeName) {
    var handle = program.getAttributeHandle(attributeName);
    this.glContext.disableVertexAttribArray(handle);
  }.bind(this));

  this.glContext.bindFramebuffer(this.glContext.FRAMEBUFFER, null);
};
