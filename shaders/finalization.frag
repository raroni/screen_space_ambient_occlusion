precision mediump float;

uniform sampler2D GeometryTexture;

varying vec2 InterpolatedTextureCoordinates;

void main() {
  gl_FragColor = texture2D(GeometryTexture, InterpolatedTextureCoordinates);
}
