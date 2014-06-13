precision mediump float;

uniform sampler2D Sampler;

varying vec2 InterpolatedTextureCoordinates;

void main() {
  gl_FragColor = vec4(texture2D(Sampler, InterpolatedTextureCoordinates).xyz, 1);
}
