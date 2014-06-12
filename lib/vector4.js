function Vector4() {
  this.components = new Float32Array(4);
  if(arguments.length == 4) {
    this.components[0] = arguments[0];
    this.components[1] = arguments[1];
    this.components[2] = arguments[2];
    this.components[3] = arguments[3];
  }
}

Vector4.prototype.get = function(index) {
  return this.components[index];
};

Vector4.prototype.multiply = function(scalar) {
  this.components[0] *= scalar;
  this.components[1] *= scalar;
  this.components[2] *= scalar;
  this.components[3] *= scalar;
};
