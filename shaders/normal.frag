precision mediump float;

varying vec3 InterpolatedViewNormal;

void main() {
  vec3 Normal = normalize(InterpolatedViewNormal);
  gl_FragColor = vec4(Normal, 0);
}
