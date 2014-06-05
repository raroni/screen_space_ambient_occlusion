function GeometryRenderer(glContext, shaderProgram) {
  this.glContext = glContext;
  this.shaderProgram = shaderProgram;
  this.boxRenderers = [];
}

GeometryRenderer.prototype.addBox = function(box) {
  var renderer = new BoxRenderer(this.glContext, box);
  this.boxRenderers.push(renderer);
};

GeometryRenderer.prototype.draw = function() {
  var program = this.shaderProgram;

  ['Position', 'Normal'].forEach(function(attributeName) {
    var handle = program.getAttributeHandle(attributeName);
    this.glContext.enableVertexAttribArray(handle);
  }.bind(this));

  var worldViewUniformHandle = program.getUniformHandle('WorldViewTransformation');
  this.glContext.uniformMatrix4fv(worldViewUniformHandle, false, this.camera.getInverseTransformation().components);

  var lightUniformHandle = program.getUniformHandle('WorldLightDirection');
  var direction = this.light.getDirection();
  this.glContext.uniform3fv(lightUniformHandle, direction.components);;

  var lightProjectionTransformationUniformHandle = program.getUniformHandle('LightProjectionTransformation');
  var projection = Matrix4.createOrthographic(-5, 5, -5, 5, 0.1, 100);
  this.glContext.uniformMatrix4fv(lightProjectionTransformationUniformHandle, false, projection.components);

  this.boxRenderers.forEach(function(renderer) {
    renderer.draw(program);
  });

  ['Position', 'Normal'].forEach(function(attributeName) {
    var handle = program.getAttributeHandle(attributeName);
    this.glContext.disableVertexAttribArray(handle);
  }.bind(this));
  this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);
};
