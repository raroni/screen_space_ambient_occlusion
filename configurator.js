function Configurator(config) {
  var element = document.createElement('div');

  var ambientOcclusionDistanceAttenuation = new Slider('AO: distance attenuation', 0, 100, config.ambientOcclusion.distanceAttenuation);
  ambientOcclusionDistanceAttenuation.onChange = function(value) {
    config.ambientOcclusion.distanceAttenuation = value;
  };
  element.appendChild(ambientOcclusionDistanceAttenuation.element);

  var ambientOcclusionConstantAttenuation = new Slider('AO: constant attenuation', 0, 100, config.ambientOcclusion.constantAttenuation);
  ambientOcclusionConstantAttenuation.onChange = function(value) {
    config.ambientOcclusion.constantAttenuation = value;
  };
  element.appendChild(ambientOcclusionConstantAttenuation.element);

  this.element = element;
}
