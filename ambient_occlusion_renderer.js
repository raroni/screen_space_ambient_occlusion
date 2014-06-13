function AmbientOcclusionRenderer(glContext, shaderProgram, positionDistanceTexture, normalTexture, normalMapImage, resolution) {
  this.glContext = glContext;
  this.shaderProgram = shaderProgram;
  this.positionDistanceTexture = positionDistanceTexture;
  this.normalTexture = normalTexture;
  this.resolution = resolution;
  this.normalMapImage = normalMapImage;
}

AmbientOcclusionRenderer.prototype.initialize = function() {
  this.setupArrayBuffer();
  this.setupFrameBuffer();
  this.setupRandomTexture();
};

AmbientOcclusionRenderer.prototype.setupRandomTexture = function() {
  var gl = this.glContext;

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    this.normalMapImage
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.bindTexture(gl.TEXTURE_2D, null);
  this.randomTexture = texture;
};

AmbientOcclusionRenderer.prototype.setupFrameBuffer = function() {
  var gl = this.glContext;

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    this.resolution.width,
    this.resolution.height,
    0,
    gl.RGB,
    gl.FLOAT,
    null
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

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
  var gl = this.glContext;
  this.shaderProgram.use();

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferHandle);
  gl.viewport(0, 0, this.resolution.width, this.resolution.height);
  this.glContext.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var positionAttributeHandle = this.shaderProgram.getAttributeHandle('Position');
  gl.enableVertexAttribArray(positionAttributeHandle);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

  gl.vertexAttribPointer(positionAttributeHandle, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.positionDistanceTexture);
  var positionDistanceTextureUniformHandle = this.shaderProgram.getUniformHandle('PositionDistanceTexture');
  gl.uniform1i(positionDistanceTextureUniformHandle, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
  var normalTextureUniformHandle = this.shaderProgram.getUniformHandle('NormalTexture');
  gl.uniform1i(normalTextureUniformHandle, 1);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, this.randomTexture);
  var randomTextureUniformHandle = this.shaderProgram.getUniformHandle('RandomTexture');
  gl.uniform1i(randomTextureUniformHandle, 2);

  gl.disable(gl.DEPTH_TEST);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.enable(gl.DEPTH_TEST);

  gl.disableVertexAttribArray(positionAttributeHandle);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
