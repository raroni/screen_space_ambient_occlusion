function Light() {
  this.transformation = new Transformation();
}

Light.prototype.getInverseTransformation = function() {
  return this.transformation.getInverseMatrix();
};

Light.prototype.getDirection = function() {
  return this.transformation.getDirection();
};
