precision mediump float;

varying vec3 InterpolatedViewNormal;
varying float InterpolatedViewPositionZ;

void main() {
  vec3 packedNormal = (InterpolatedViewNormal*0.5) + 0.5;
  gl_FragColor = vec4(packedNormal, InterpolatedViewPositionZ*0.05);
}
