attribute vec2 Position;

varying vec4 vColor;

void main() {
  gl_Position = vec4(Position, 0, 1);
}
