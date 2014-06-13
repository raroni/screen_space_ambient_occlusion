precision mediump float;

uniform sampler2D GeometryTexture;
uniform sampler2D AmbientOcclusionTexture;

varying vec2 InterpolatedTextureCoordinates;

void main() {
  float ambientOcclusion = texture2D(AmbientOcclusionTexture, InterpolatedTextureCoordinates).x;
  vec4 GeometryColor = texture2D(GeometryTexture, InterpolatedTextureCoordinates);
  gl_FragColor = vec4(GeometryColor.xyz-ambientOcclusion, 1);
}
