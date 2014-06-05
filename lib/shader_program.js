function ShaderProgram(glContext, vertexShaderSource, fragmentShaderSource) {
  this.glContext = glContext;

  this.sources = {
    vertex: vertexShaderSource,
    fragment: fragmentShaderSource
  };
  this.shaderHandles = {};

  this.handle = glContext.createProgram();
  this.attributeHandles = {};
  this.uniformHandles = {};
}

ShaderProgram.prototype.compile = function() {
  this.compileShader('vertex');
  this.compileShader('fragment');
};

ShaderProgram.prototype.compileShader = function(type) {
  var glType = type == 'vertex' ? this.glContext.VERTEX_SHADER : this.glContext.FRAGMENT_SHADER;
  var handle = this.glContext.createShader(glType);

  var source = this.sources[type];
  this.glContext.shaderSource(handle, source);

  this.glContext.compileShader(handle);

  if (!this.glContext.getShaderParameter(handle, this.glContext.COMPILE_STATUS)) {
    var log = this.glContext.getShaderInfoLog(handle);
    console.log(log);
    throw new Error('Shader compilation failed.');
  }

  this.shaderHandles[type] = handle;
};

ShaderProgram.prototype.link = function() {
  this.glContext.attachShader(this.handle, this.shaderHandles.vertex);
  this.glContext.attachShader(this.handle, this.shaderHandles.fragment);
  this.glContext.linkProgram(this.handle);

  if(!this.glContext.getProgramParameter(this.handle, this.glContext.LINK_STATUS)) {
    throw new Error('Linking failed.');
  }
};

ShaderProgram.prototype.use = function() {
  this.glContext.useProgram(this.handle);
};

ShaderProgram.prototype.setupAttributeHandle = function(name) {
  var handle = this.glContext.getAttribLocation(this.handle, name);
  if(handle == null) throw new Error("Could not setup attribute handle.");
  this.attributeHandles[name] = handle;
};

ShaderProgram.prototype.getAttributeHandle = function(name) {
  return this.attributeHandles[name];
};

ShaderProgram.prototype.setupUniformHandle = function(name) {
  var handle = this.glContext.getUniformLocation(this.handle, name);
  if(handle == null) throw new Error("Could not setup uniform handle (" + name + ").");
  this.uniformHandles[name] = handle;
};

ShaderProgram.prototype.getUniformHandle = function(name) {
  return this.uniformHandles[name];
};
