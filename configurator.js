function Configurator(config) {
  var element = document.createElement('div');

  var ambientOcclusionConstantAttenuationSlider = new Slider('AO: constant attenuation', 0, 20, config.ambientOcclusion.constantAttenuation);
  ambientOcclusionConstantAttenuationSlider.onChange = function(value) {
    config.ambientOcclusion.constantAttenuation = value;
  };
  element.appendChild(ambientOcclusionConstantAttenuationSlider.element);

  var ambientOcclusionDistanceAttenuationSlider = new Slider('AO: distance attenuation', 0, 100, config.ambientOcclusion.distanceAttenuation);
  ambientOcclusionDistanceAttenuationSlider.onChange = function(value) {
    config.ambientOcclusion.distanceAttenuation = value;
  };
  element.appendChild(ambientOcclusionDistanceAttenuationSlider.element);

  var ambientOcclusionSamplingRadiusSlider = new Slider('AO: sample radius', 0, 40, config.ambientOcclusion.samplingRadius);
  ambientOcclusionSamplingRadiusSlider.onChange = function(value) {
    config.ambientOcclusion.samplingRadius = value;
  };
  element.appendChild(ambientOcclusionSamplingRadiusSlider.element);

  this.element = element;
}
