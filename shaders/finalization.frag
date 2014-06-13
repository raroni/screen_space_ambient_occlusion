precision mediump float;

uniform sampler2D GeometryTexture;
uniform sampler2D AmbientOcclusionTexture;

varying vec2 InterpolatedTextureCoordinates;

void main() {
  vec4 x = texture2D(AmbientOcclusionTexture, InterpolatedTextureCoordinates);
  vec4 GeometryColor = texture2D(GeometryTexture, InterpolatedTextureCoordinates);
  //gl_FragColor = vec4(GeometryColor.xyz-x.a, 1);
  gl_FragColor = vec4(GeometryColor.xyz, 1);
}
