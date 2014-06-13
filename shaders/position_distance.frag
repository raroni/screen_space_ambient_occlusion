precision mediump float;

varying vec3 InterpolatedViewPosition;
uniform float DepthSpan;

void main() {
  float NormalizedDistance = length(InterpolatedViewPosition)/DepthSpan;
  gl_FragColor = vec4(InterpolatedViewPosition.xyz, NormalizedDistance);
}
