attribute vec2 Position;

varying vec2 InterpolatedPosition;

void main() {
  gl_Position = vec4(Position, 0, 1);
  InterpolatedPosition = gl_Position.xy;
}
