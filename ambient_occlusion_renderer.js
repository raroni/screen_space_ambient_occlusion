function AmbientOcclusionRenderer(glContext, shaderProgram, metadataTexture, resolution) {
  this.glContext = glContext;
  this.shaderProgram = shaderProgram;
  this.metadataTexture = metadataTexture;
  this.resolution = resolution;
}

AmbientOcclusionRenderer.prototype.initialize = function() {
  this.setupFramebuffer();
  this.setupArrayBuffer();
};

AmbientOcclusionRenderer.prototype.setupFramebuffer = function() {
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
  this.glContext.texParameteri(this.glContext.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  this.glContext.texParameteri(this.glContext.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  this.glContext.texParameteri(this.glContext.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  this.glContext.texParameteri(this.glContext.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var frameBufferHandle = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferHandle)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

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

AmbientOcclusionRenderer.prototype.setupTexture = function() {
  setupMyTextureToRenderWAAAH();
};

AmbientOcclusionRenderer.prototype.setupArrayBuffer = function() {
  var buffer = this.glContext.createBuffer();

  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, buffer);

  var data = new Float32Array([
    // top left
    -1, 1,
    // bottom left
    -1, -1,
    // top right
    1, 1,
    // bottom right
    1, -1
  ]);

  this.glContext.bufferData(this.glContext.ARRAY_BUFFER, data, this.glContext.STATIC_DRAW);

  this.buffer = buffer;

  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);
};

AmbientOcclusionRenderer.prototype.draw = function() {
  this.glContext.bindFramebuffer(this.glContext.FRAMEBUFFER, this.frameBufferHandle);
  this.glContext.clear(this.glContext.COLOR_BUFFER_BIT | this.glContext.DEPTH_BUFFER_BIT);
  this.glContext.viewport(0, 0, this.resolution.width, this.resolution.height);

  this.shaderProgram.use();

  var positionAttributeHandle = this.shaderProgram.getAttributeHandle('Position');
  this.glContext.enableVertexAttribArray(positionAttributeHandle);

  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.buffer);

  this.glContext.vertexAttribPointer(positionAttributeHandle, 2, this.glContext.FLOAT, false, 0, 0);

  this.glContext.activeTexture(this.glContext.TEXTURE0);
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, this.metadataTexture);
  var metadataUniformHandle = this.shaderProgram.getUniformHandle('Metadata');
  this.glContext.uniform1i(metadataUniformHandle, 0);

  this.glContext.disable(this.glContext.DEPTH_TEST);
  this.glContext.drawArrays(this.glContext.TRIANGLE_STRIP, 0, 4);
  this.glContext.enable(this.glContext.DEPTH_TEST);

  this.glContext.disableVertexAttribArray(positionAttributeHandle);
  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);
  this.glContext.bindFramebuffer(this.glContext.FRAMEBUFFER, null);
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);
};
