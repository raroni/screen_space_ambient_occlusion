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
  this.shaderProgram.use();
  var positionAttributeHandle = this.shaderProgram.getAttributeHandle('Position');
  this.glContext.enableVertexAttribArray(positionAttributeHandle);
  var textureCoordinatesAttributeHandle = this.shaderProgram.getAttributeHandle('TextureCoordinates');
  this.glContext.enableVertexAttribArray(textureCoordinatesAttributeHandle);

  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.buffer);

  this.glContext.vertexAttribPointer(positionAttributeHandle, 2, this.glContext.FLOAT, false, 16, 0);
  this.glContext.vertexAttribPointer(textureCoordinatesAttributeHandle, 2, this.glContext.FLOAT, false, 16, 8);

  var uniformInverseAspectRatioHandle = this.shaderProgram.getUniformHandle('InverseAspectRatio');
  this.glContext.uniform1f(uniformInverseAspectRatioHandle, this.inverseAspectRatio);

  this.glContext.activeTexture(this.glContext.TEXTURE0);
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, this.texture);
  var samplerUniformHandle = this.shaderProgram.getUniformHandle('Sampler');
  this.glContext.uniform1i(samplerUniformHandle, 0);

  this.glContext.drawArrays(this.glContext.TRIANGLE_STRIP, 0, 4);

  this.glContext.disableVertexAttribArray(positionAttributeHandle);
  this.glContext.disableVertexAttribArray(textureCoordinatesAttributeHandle);
  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);
};
