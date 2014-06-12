function FinalizationRenderer(glContext, shaderProgram, resolution, geometryTexture) {
  this.glContext = glContext;
  this.shaderProgram = shaderProgram;
  this.resolution = resolution;
  this.geometryTexture = geometryTexture;
}

FinalizationRenderer.prototype.initialize = function() {
  this.setupBuffer();
};

FinalizationRenderer.prototype.setupBuffer = function() {
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

FinalizationRenderer.prototype.draw = function() {
  this.shaderProgram.use();
  var gl = this.glContext;
  gl.viewport(0, 0, this.resolution.width, this.resolution.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

  var positionAttributeHandle = this.shaderProgram.getAttributeHandle('Position');
  gl.enableVertexAttribArray(positionAttributeHandle);

  this.glContext.vertexAttribPointer(positionAttributeHandle, 2, this.glContext.FLOAT, false, 0, 0);

  this.glContext.activeTexture(this.glContext.TEXTURE0);
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, this.geometryTexture);
  var geometryTextureUniformHandle = this.shaderProgram.getUniformHandle('GeometryTexture');
  this.glContext.uniform1i(geometryTextureUniformHandle, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  
  gl.disableVertexAttribArray(positionAttributeHandle);
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};
