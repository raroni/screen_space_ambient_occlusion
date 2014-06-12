function Camera() {
  this.transformation = new Transformation();
  this.transformation.position = new Vector3(0, 3.5, -9);
  this.transformation.rotation = new Vector3(-0.4, 0, 0);
}

Camera.prototype.getDirection = function() {
  return this.transformation.getDirection();
};

Camera.prototype.getInverseTransformation = function() {
  return this.transformation.getInverseMatrix();
};

Camera.prototype.getTransformation = function() {
  return this.transformation.getMatrix();
};
