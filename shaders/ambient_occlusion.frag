precision mediump float;

varying vec4 vColor;
uniform sampler2D Metadata;

void main() {
  vec4 x = texture2D(Metadata, vec2(0.5, 0.5));
  gl_FragColor = vec4(0, 0, 1, 1);
}
