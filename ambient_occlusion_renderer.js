function AmbientOcclusionRenderer(glContext, shaderProgram, metadataTexture, resolution) {
  this.glContext = glContext;
  this.shaderProgram = shaderProgram;
  this.metadataTexture = metadataTexture;
  this.resolution = resolution;
  this.noiseSize = 4;
}

AmbientOcclusionRenderer.prototype.initialize = function() {
  this.setupArrayBuffer();
  this.setupResultTexture();
  this.setupKernel();
  this.setupNoise();
};

AmbientOcclusionRenderer.prototype.setupNoise = function() {
  var gl = this.glContext;
  var noise = this.createNoise();

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    this.noiseSize,
    this.noiseSize,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    noise
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.bindTexture(gl.TEXTURE_2D, null);
  this.noiseTexture = texture;
};

AmbientOcclusionRenderer.prototype.createNoise = function() {
  var size = this.noiseSize*this.noiseSize;
  var noise = new Uint8Array(size*3);
  for (var i = 0; i<size; ++i) {
    vector = new Vector3(
      Math.floor(Math.random()*255),
      Math.floor(Math.random()*255),
      0
    );

    for(var n=0; 3>n; n++) {
      noise[i*3+n] = vector.get(n);
    }
  }
  return noise;
};

AmbientOcclusionRenderer.prototype.setupResultTexture = function() {
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

  this.resultTexture = texture;
  this.frameBufferHandle = frameBufferHandle;
};

AmbientOcclusionRenderer.prototype.setupKernel = function() {
  var kernel = this.createKernel();
  var kernelHandle = this.shaderProgram.getUniformHandle('Kernel');
  this.glContext.uniform3fv(kernelHandle, kernel);
  var kernelSizeHandle = this.shaderProgram.getUniformHandle('KernelSize');
  this.glContext.uniform1i(kernelSizeHandle, kernel.length/3);
};

AmbientOcclusionRenderer.prototype.createKernel = function() {
  var kernelSize = 16;
  var kernel = new Float32Array(kernelSize*3);

  var vector, scale;
  for(var i=0; kernelSize>i; i++) {
    vector = new Vector3(
      Math.random()*2-1,
      Math.random()*2-1,
      Math.random()
    );
    vector.normalize();
    scale = (i+1)/kernelSize;
    vector.multiply(MiniMath.lerp(0, 1, scale*scale));

    for(var n=0; 3>n; n++) {
      kernel[i*3+n] = vector.get(n);
    }
  }

  return kernel;
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
  gl.bindTexture(gl.TEXTURE_2D, this.metadataTexture);
  var metadataUniformHandle = this.shaderProgram.getUniformHandle('Metadata');
  gl.uniform1i(metadataUniformHandle, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
  var noiseUniformHandle = this.shaderProgram.getUniformHandle('Noise');
  gl.uniform1i(noiseUniformHandle, 1);

  gl.disable(gl.DEPTH_TEST);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.enable(gl.DEPTH_TEST);

  gl.disableVertexAttribArray(positionAttributeHandle);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
