function TexturePeekRenderer(glContext, shaderProgram, texture, aspectRatio) {
  this.glContext = glContext;
  this.shaderProgram = shaderProgram;
  this.texture = texture;
  this.size = 0.5;
  this.position = new Vector2(aspectRatio-this.size*1.2, -1+this.size*1.2);
  this.setupBuffer();
  this.inverseAspectRatio = 1/aspectRatio;
}

TexturePeekRenderer.prototype.initialize = function() {
  this.setupBuffer();
};

TexturePeekRenderer.prototype.setupBuffer = function() {
  var buffer = this.glContext.createBuffer();

  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, buffer);

  var data = new Float32Array([
    // top left
    this.position.get(0)-this.size, this.position.get(1)+this.size, 0, 1,
    // bottom left
    this.position.get(0)-this.size, this.position.get(1)-this.size, 0, 0,
    // top right
    this.position.get(0)+this.size, this.position.get(1)+this.size, 1, 1,
    // bottom right
    this.position.get(0)+this.size, this.position.get(1)-this.size, 1, 0
  ]);

  this.glContext.bufferData(this.glContext.ARRAY_BUFFER, data, this.glContext.STATIC_DRAW);

  this.buffer = buffer;

  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);
};

TexturePeekRenderer.prototype.draw = function() {
  var gl = this.glContext;
  this.shaderProgram.use();
  var positionAttributeHandle = this.shaderProgram.getAttributeHandle('Position');
  gl.enableVertexAttribArray(positionAttributeHandle);
  var textureCoordinatesAttributeHandle = this.shaderProgram.getAttributeHandle('TextureCoordinates');
  gl.enableVertexAttribArray(textureCoordinatesAttributeHandle);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

  gl.vertexAttribPointer(positionAttributeHandle, 2, gl.FLOAT, false, 16, 0);
  gl.vertexAttribPointer(textureCoordinatesAttributeHandle, 2, gl.FLOAT, false, 16, 8);

  var uniformInverseAspectRatioHandle = this.shaderProgram.getUniformHandle('InverseAspectRatio');
  gl.uniform1f(uniformInverseAspectRatioHandle, this.inverseAspectRatio);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  var samplerUniformHandle = this.shaderProgram.getUniformHandle('Sampler');
  gl.uniform1i(samplerUniformHandle, 0);

  gl.disable(gl.DEPTH_TEST);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.enable(gl.DEPTH_TEST);

  gl.disableVertexAttribArray(positionAttributeHandle);
  gl.disableVertexAttribArray(textureCoordinatesAttributeHandle);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
};
