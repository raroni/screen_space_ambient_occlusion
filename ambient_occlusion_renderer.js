function AmbientOcclusionRenderer(glContext, shaderProgram, metadataTexture) {
  this.glContext = glContext;
  this.shaderProgram = shaderProgram;
  this.metadataTexture = metadataTexture;
  this.setupBuffer();
}

AmbientOcclusionRenderer.prototype.setupBuffer = function() {
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
  this.shaderProgram.use();

  var positionAttributeHandle = this.shaderProgram.getAttributeHandle('Position');
  this.glContext.enableVertexAttribArray(positionAttributeHandle);

  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.buffer);

  this.glContext.vertexAttribPointer(positionAttributeHandle, 2, this.glContext.FLOAT, false, 0, 0);

  this.glContext.activeTexture(this.glContext.TEXTURE0);
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, this.metadataTexture);
  var metadataUniformHandle = this.shaderProgram.getUniformHandle('Metadata');
  this.glContext.uniform1i(metadataUniformHandle, 0);

  //this.glContext.drawArrays(this.glContext.TRIANGLE_STRIP, 0, 4);

  this.glContext.disableVertexAttribArray(positionAttributeHandle);
  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);
};
