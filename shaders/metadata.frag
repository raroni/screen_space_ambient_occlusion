precision mediump float;

varying vec3 InterpolatedViewNormal;
varying float InterpolatedViewPositionZ;

void main() {
  gl_FragColor = vec4(InterpolatedViewNormal, InterpolatedViewPositionZ);
}
