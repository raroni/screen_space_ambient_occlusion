function Vector3() {
  this.components = new Float32Array(3);
  if(arguments.length == 3) {
    this.components[0] = arguments[0];
    this.components[1] = arguments[1];
    this.components[2] = arguments[2];
  }
}

Vector3.prototype.get = function(index) {
  return this.components[index];
};

Vector3.prototype.add = function(vector) {
  this.set(Vector3.add(this, vector));
};

Vector3.prototype.subtract = function(vector) {
  this.set(Vector3.subtract(this, vector));
};

Vector3.prototype.clone = function(index) {
  return new Vector3(this.get(0), this.get(1), this.get(2));
};

Vector3.prototype.getLength = function() {
  var squaredLength = Math.pow(this.components[0], 2) + Math.pow(this.components[1], 2) + Math.pow(this.components[2], 2);
  return Math.sqrt(squaredLength);
};

Vector3.prototype.negate = function() {
  this.multiply(-1);
};

Vector3.up = function() {
  var up = new Vector3(0, 1, 0);
  return up;
};

Vector3.down = function() {
  var down = new Vector3(0, -1, 0);
  return down;
};

Vector3.prototype.multiply = function(scalar) {
  this.components[0] *= scalar;
  this.components[1] *= scalar;
  this.components[2] *= scalar;
};

Vector3.prototype.set = function(vector) {
  this.components[0] = vector.get(0);
  this.components[1] = vector.get(1);
  this.components[2] = vector.get(2);
};

Vector3.prototype.normalize = function() {
  this.set(Vector3.divide(this, this.getLength()));
};

Vector3.negate = function(vector) {
  var result = vector.clone();
  result.components[0] *= -1;
  result.components[1] *= -1;
  result.components[2] *= -1;
  return result;
};

Vector3.divide = function(vector, scalar) {
  var result = vector.clone();
  result.components[0] /= scalar;
  result.components[1] /= scalar;
  result.components[2] /= scalar;
  return result;
};

Vector3.subtract = function(vector1, vector2) {
  var result = new Vector3(
    vector1.get(0) - vector2.get(0),
    vector1.get(1) - vector2.get(1),
    vector1.get(2) - vector2.get(2)
  );
  return result;
};

Vector3.add = function(vector1, vector2) {
  var result = new Vector3(
    vector1.get(0) + vector2.get(0),
    vector1.get(1) + vector2.get(1),
    vector1.get(2) + vector2.get(2)
  );
  return result;
};

Vector3.cross = function(vectorA, vectorB) {
  var x = vectorA.get(1)*vectorB.get(2) - vectorA.get(2) * vectorB.get(1);
  var y = vectorA.get(2)*vectorB.get(0) - vectorA.get(0) * vectorB.get(2);
  var z = vectorA.get(0)*vectorB.get(1) - vectorA.get(1) * vectorB.get(0);

  var result = new Vector3(x, y, z);
  return result;
};
