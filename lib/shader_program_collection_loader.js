function ShaderProgramCollectionLoader(glContext) {
  this.glContext = glContext;
  this.loadRequests = [];
  this.programs = {};
}

ShaderProgramCollectionLoader.prototype.add = function(name, vertexShaderPath, fragmentShaderPath) {
  this.loadRequests.push({
    name: name,
    vertexShaderPath: vertexShaderPath,
    fragmentShaderPath: fragmentShaderPath
  });
};

ShaderProgramCollectionLoader.prototype.execute = function() {
  this.loadRequests.forEach(function(request) {
    var loader = new ShaderProgramLoader(this.glContext, request.vertexShaderPath, request.fragmentShaderPath);
    loader.onCompletion = function() {
      this.programs[request.name] = loader.program;
      this.checkCompletion();
    }.bind(this);
    loader.execute();
  }.bind(this));
};

ShaderProgramCollectionLoader.prototype.checkCompletion = function() {
  if(Object.keys(this.programs).length == this.loadRequests.length) {
    this.onCompletion();
  }
};
