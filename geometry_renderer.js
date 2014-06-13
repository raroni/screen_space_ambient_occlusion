function GeometryRenderer(glContext, shaderProgram, resolution, boxRenderings) {
  this.glContext = glContext;
  this.shaderProgram = shaderProgram;
  this.boxRenderings = boxRenderings;
  this.resolution = resolution;
}

GeometryRenderer.prototype.initialize = function() {
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

GeometryRenderer.prototype.draw = function() {
  var program = this.shaderProgram;
  program.use();
  var gl = this.glContext;

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferHandle);
  gl.viewport(0, 0, this.resolution.width, this.resolution.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  ['ModelPosition', 'ModelNormal'].forEach(function(attributeName) {
    var handle = program.getAttributeHandle(attributeName);
    gl.enableVertexAttribArray(handle);
  }.bind(this));

  var worldViewUniformHandle = program.getUniformHandle('WorldViewTransformation');
  gl.uniformMatrix4fv(worldViewUniformHandle, false, this.camera.getInverseTransformation().components);

  var lightUniformHandle = program.getUniformHandle('WorldLightDirection');
  var direction = this.light.getDirection();
  gl.uniform3fv(lightUniformHandle, direction.components);;

  this.boxRenderings.forEach(function(rendering) {
    var uniformHandle = program.getUniformHandle('ModelWorldTransformation');
    gl.uniformMatrix4fv(uniformHandle, false, rendering.box.getTransformation().components);

    gl.bindBuffer(gl.ARRAY_BUFFER, rendering.bufferHandle);

    var positionAttributeHandle = program.getAttributeHandle('ModelPosition');
    gl.vertexAttribPointer(positionAttributeHandle, 3, gl.FLOAT, false, 24, 0);

    var normalAttributeHandle = program.getAttributeHandle('ModelNormal');
    gl.vertexAttribPointer(normalAttributeHandle, 3, gl.FLOAT, false, 24, 12);

    gl.drawArrays(gl.TRIANGLES, 0, 36);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  });

  ['ModelPosition', 'ModelNormal'].forEach(function(attributeName) {
    var handle = program.getAttributeHandle(attributeName);
    gl.disableVertexAttribArray(handle);
  }.bind(this));
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
