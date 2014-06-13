function BoxRendering(glContext, box) {
  this.glContext = glContext;
  this.box = box;
  this.setupBuffer();
}

BoxRendering.prototype.setupBuffer = function() {
  var handle = this.glContext.createBuffer();

  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, handle);
  var halfWidth = this.box.size.get(0)*0.5;
  var halfHeight = this.box.size.get(1)*0.5;
  var halfDepth = this.box.size.get(2)*0.5;

  var data = new Float32Array([
    // front
    -halfWidth, -halfHeight, -halfDepth, 0, 0, -1,
    halfWidth, -halfHeight, -halfDepth, 0, 0, -1,
    -halfWidth, halfHeight, -halfDepth, 0, 0, -1,
    -halfWidth, halfHeight, -halfDepth, 0, 0, -1,
    halfWidth, -halfHeight, -halfDepth, 0, 0, -1,
    halfWidth, halfHeight, -halfDepth, 0, 0, -1,
    // back
    -halfWidth, halfHeight, halfDepth, 0, 0, 1,
    halfWidth, -halfHeight, halfDepth, 0, 0, 1,
    -halfWidth, -halfHeight, halfDepth, 0, 0, 1,
    -halfWidth, halfHeight, halfDepth, 0, 0, 1,
    halfWidth, halfHeight, halfDepth, 0, 0, 1,
    halfWidth, -halfHeight, halfDepth, 0, 0, 1,
    // left
    -halfWidth, halfHeight, halfDepth, -1, 0, 0,
    -halfWidth, -halfHeight, -halfDepth, -1, 0, 0,
    -halfWidth, halfHeight, -halfDepth, -1, 0, 0,
    -halfWidth, halfHeight, halfDepth, -1, 0, 0,
    -halfWidth, -halfHeight, halfDepth, -1, 0, 0,
    -halfWidth, -halfHeight, -halfDepth, -1, 0, 0,
    // right
    halfWidth, halfHeight, -halfDepth, 1, 0, 0,
    halfWidth, -halfHeight, -halfDepth, 1, 0, 0,
    halfWidth, halfHeight, halfDepth, 1, 0, 0,
    halfWidth, -halfHeight, -halfDepth, 1, 0, 0,
    halfWidth, -halfHeight, halfDepth, 1, 0, 0,
    halfWidth, halfHeight, halfDepth, 1, 0, 0,
    // top
    -halfWidth, halfHeight, halfDepth, 0, 1, 0,
    -halfWidth, halfHeight, -halfDepth, 0, 1, 0,
    halfWidth, halfHeight, -halfDepth, 0, 1, 0,
    -halfWidth, halfHeight, halfDepth, 0, 1, 0,
    halfWidth, halfHeight, -halfDepth, 0, 1, 0,
    halfWidth, halfHeight, halfDepth, 0, 1, 0,
    // bottom
    halfWidth, -halfHeight, -halfDepth, 0, -1, 0,
    -halfWidth, -halfHeight, -halfDepth, 0, -1, 0,
    -halfWidth, -halfHeight, halfDepth, 0, -1, 0,
    halfWidth, -halfHeight, halfDepth, 0, -1, 0,
    halfWidth, -halfHeight, -halfDepth, 0, -1, 0,
    -halfWidth, -halfHeight, halfDepth, 0, -1, 0
  ]);
  this.glContext.bufferData(this.glContext.ARRAY_BUFFER, data, this.glContext.STATIC_DRAW);

  this.bufferHandle = handle;

  this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);
};
