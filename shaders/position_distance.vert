attribute vec3 ModelPosition;

uniform mat4 ProjectionTransformation;
uniform mat4 WorldViewTransformation;
uniform mat4 ModelWorldTransformation;

varying vec3 InterpolatedViewPosition;

void main() {
  mat4 ModelViewTransformation = WorldViewTransformation*ModelWorldTransformation;
  vec4 ViewPosition = ModelViewTransformation*vec4(ModelPosition, 1.0);
  gl_Position = ProjectionTransformation*ViewPosition;
  InterpolatedViewPosition = ViewPosition.xyz;
}
