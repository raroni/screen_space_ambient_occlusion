function Transformation() {
  this.position = new Vector3();
  this.rotation = new Vector3();
}

Transformation.prototype.getDirection = function() {
  var pitch = this.rotation.get(0);
  var yaw = this.rotation.get(1);

  var direction = new Vector3(
    -Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch)
  );

  return direction;
};

Transformation.prototype.getMatrix = function() {
  var translationMatrix = Matrix4.createTranslation(this.position);

  var rotationMatrix = Matrix4.createYRotation(this.rotation.get(1));

  var modelTransformation = Matrix4.multiply(translationMatrix, rotationMatrix);
  return modelTransformation;
};

Transformation.prototype.getInverseMatrix = function() {
  var inverseTransformation = Matrix4.createIdentity();

  var direction = this.getDirection();
  var rotationMatrix = Matrix4.createLookAt(direction, Vector3.up());
  inverseTransformation = Matrix4.multiply(inverseTransformation, rotationMatrix);

  var translationMatrix = Matrix4.createTranslation(Vector3.negate(this.position));
  inverseTransformation = Matrix4.multiply(inverseTransformation, translationMatrix);
  return inverseTransformation;
};
