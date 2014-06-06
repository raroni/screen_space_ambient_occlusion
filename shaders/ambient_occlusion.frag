precision mediump float;

uniform sampler2D Metadata;
const int MAX_KERNEL_SIZE = 128;
uniform int KernelSize;
uniform vec3 Kernel[MAX_KERNEL_SIZE];

void main() {
  vec4 x = texture2D(Metadata, vec2(0.5, 0.5));
  gl_FragColor = vec4(0, 0, 0.8, 0.5);
}
