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
