function ShaderProgramLoader(glContext, vertexShaderPath, fragmentShaderPath) {
  this.glContext = glContext;
  this.paths = {
    vertex: vertexShaderPath,
    fragment: fragmentShaderPath
  };
  this.sources = {};
}

ShaderProgramLoader.prototype.execute = function() {
  this.loadShader('vertex');
  this.loadShader('fragment');
};

ShaderProgramLoader.prototype.loadShader = function(type) {
  var path = this.paths[type];
  var request = new Request(path);

  request.onCompletion = function(source) {
    this.sources[type] = source;
    this.checkSetup();
  }.bind(this);
  request.execute();
}

ShaderProgramLoader.prototype.checkSetup = function() {
  if(this.sources.vertex && this.sources.fragment) {
    this.program = new ShaderProgram(this.glContext, this.sources.vertex, this.sources.fragment);
    this.program.compile();
    this.program.link();
    this.onCompletion();
  }
};
