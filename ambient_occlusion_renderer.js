function AmbientOcclusionRenderer(glContext, shaderProgram, metadataTexture, resolution) {
  this.glContext = glContext;
  this.shaderProgram = shaderProgram;
  this.metadataTexture = metadataTexture;
  this.resolution = resolution;
}

AmbientOcclusionRenderer.prototype.initialize = function() {
  this.setupArrayBuffer();
  this.setupKernel();
};

AmbientOcclusionRenderer.prototype.setupKernel = function() {
  var kernel = this.createKernel();
  var kernelHandle = this.shaderProgram.getUniformHandle('Kernel');
  this.glContext.uniform3fv(kernelHandle, kernel);
  var kernelSizeHandle = this.shaderProgram.getUniformHandle('KernelSize');
  this.glContext.uniform1i(kernelSizeHandle, kernel.length);
};

AmbientOcclusionRenderer.prototype.createKernel = function() {
  var kernelSize = 32;
  this.kernel = new Float32Array(kernelSize);

  var vector, scale;

  for(var i=0; kernelSize>i; i++) {
    vector = new Vector3(
      Math.random()*2-1,
      Math.random()*2-1,
      Math.random()
    );
    vector.normalize();
    scale = i/kernelSize;
    vector.multiply(MiniMath.lerp(0, 1, scale*scale));

    for(var n=0; 3>n; n++) {
      this.kernel[i*3+n] = vector.components[n];
    }
  }

  return this.kernel;
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
  this.glContext.blendFunc(this.glContext.SRC_ALPHA, this.glContext.ONE);
  this.glContext.enable(this.glContext.BLEND);
  this.glContext.drawArrays(this.glContext.TRIANGLE_STRIP, 0, 4);
  this.glContext.enable(this.glContext.DEPTH_TEST);
  this.glContext.disable(this.glContext.BLEND);

  this.glContext.disableVertexAttribArray(positionAttributeHandle);
  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);
};
