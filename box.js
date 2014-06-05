function Box() {
  this.transformation = new Transformation();
  this.size = new Vector3(1, 1, 1);
}

Box.prototype.getTransformation = function() {
  return this.transformation.getMatrix();
};
