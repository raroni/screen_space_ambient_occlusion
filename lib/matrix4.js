function Matrix4() {
  this.components = new Float32Array(16);
}

Matrix4.prototype.get = function(index) {
  return this.components[index];
};

Matrix4.prototype.transpose = function() {
  var copy = new Float32Array(this.components);
  this.components[1] = copy[4];
  this.components[2] = copy[8];
  this.components[3] = copy[12];
  this.components[4] = copy[1];
  this.components[6] = copy[9];
  this.components[7] = copy[13];
  this.components[8] = copy[2];
  this.components[9] = copy[6];
  this.components[11] = copy[14];
  this.components[12] = copy[3];
  this.components[13] = copy[7];
  this.components[14] = copy[11];
};

Matrix4.createOrthographic = function(left, right, bottom, top, near, far) {
  var matrix = new Matrix4();
  var components = matrix.components;

  components[0] = 2/(right-left);
  components[13] = -(right+left)/(right-left);

  components[5] = 2/(top-bottom);
  components[13] = -(top+bottom)/(top-bottom);

  components[10] = 2/(far-near);
  components[14] = -(far+near)/(far-near);

  components[15] = 1;

  return matrix;
};

Matrix4.createPerspective = function(fieldOfView, aspectRatio, near, far) {
  var matrix = new Matrix4();

  var halfFovTangent = Math.tan(fieldOfView/2);

  matrix.components[0] = 1/halfFovTangent;
  matrix.components[5] = aspectRatio/halfFovTangent;
  matrix.components[10] = (far + near) / (far - near);
  matrix.components[11] = 1;
  matrix.components[14] = -(2*far*near)/(far-near);

  return matrix;
};

Matrix4.createTranslation = function(translation) {
  var matrix = Matrix4.createIdentity();
  matrix.components[12] = translation.get(0);
  matrix.components[13] = translation.get(1);
  matrix.components[14] = translation.get(2);
  return matrix;
};

Matrix4.createXRotation = function(rotation) {
    var matrix = Matrix4.createIdentity();

    var cosAngle = Math.cos(rotation);
    var sinAngle = Math.sin(rotation);

    matrix.components[5] = cosAngle;
    matrix.components[6] = sinAngle;
    matrix.components[9] = -sinAngle;
    matrix.components[10] = cosAngle;

    return matrix;
};

Matrix4.createYRotation = function(rotation) {
    var matrix = Matrix4.createIdentity();

    var cosAngle = Math.cos(rotation);
    var sinAngle = Math.sin(rotation);

    matrix.components[0] = cosAngle;
    matrix.components[2] = sinAngle;
    matrix.components[8] = -sinAngle;
    matrix.components[10] = cosAngle;

    return matrix;
};

Matrix4.createZRotation = function(rotation) {
  var matrix = Matrix4.createIdentity();

  var cosAngle = Math.cos(rotation);
  var sinAngle = Math.sin(rotation);

  matrix.components[0] = cosAngle;
  matrix.components[1] = sinAngle;
  matrix.components[4] = -sinAngle;
  matrix.components[5] = cosAngle;

  return matrix;
};

Matrix4.createRotation = function(direction, up) {
  var xAxis = Vector3.cross(up, direction);
  xAxis.normalize();

  var yAxis = Vector3.cross(direction, xAxis);
  yAxis.normalize();

  var zAxis = direction;
  zAxis.normalize();

  var matrix = Matrix4.createIdentity();
  matrix.components[0] = xAxis.get(0);
  matrix.components[1] = xAxis.get(1);
  matrix.components[2] = xAxis.get(2);
  matrix.components[4] = yAxis.get(0);
  matrix.components[5] = yAxis.get(1);
  matrix.components[6] = yAxis.get(2);
  matrix.components[8] = zAxis.get(0);
  matrix.components[9] = zAxis.get(1);
  matrix.components[10] = zAxis.get(2);

  return matrix;
};

Matrix4.createLookAt = function(direction, up) {
  var matrix = Matrix4.createRotation(direction, up);
  matrix.transpose();
  return matrix;
};

Matrix4.createIdentity = function() {
  var matrix = new Matrix4();
  matrix.components[0] = 1;
  matrix.components[5] = 1;
  matrix.components[10] = 1;
  matrix.components[15] = 1;
  return matrix;
};

Matrix4.multiply = function(factorA, factorB) {
  var result = new Matrix4();

  var resultIndex;
  for(var row=0; 4>row; row++) {
    for(var column=0; 4>column; column++) {
      resultIndex = column*4+row;
      for(var step=0; 4>step; step++) {
        result.components[resultIndex] += factorA.get(row+step*4) * factorB.get(column*4+step);
      }
    }
  }
  
  return result;
};

Matrix4.multiplyVector = function(matrix, vector) {
  var result = new Vector4();

  for(var row=0; 4>row; row++) {
    for(var step=0; 4>step; step++) {
      result.components[row] += matrix.get(step*4+row) * vector.get(step);
    }
  }

  return result;
};
