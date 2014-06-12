attribute vec2 Position;
attribute vec2 TextureCoordinates;

uniform float InverseAspectRatio;

varying vec2 InterpolatedTextureCoordinates;

void main() {
  gl_Position = vec4(Position.x*InverseAspectRatio, Position.y, 0, 1);
  InterpolatedTextureCoordinates = TextureCoordinates;
}
