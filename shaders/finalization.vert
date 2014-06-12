attribute vec2 Position;

varying vec2 InterpolatedTextureCoordinates;

void main() {
  gl_Position = vec4(Position, 0, 1);
  InterpolatedTextureCoordinates = Position*0.5+0.5;
}
