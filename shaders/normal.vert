attribute vec3 ModelPosition;
attribute vec3 ModelNormal;

uniform mat4 ProjectionTransformation;
uniform mat4 WorldViewTransformation;
uniform mat4 ModelWorldTransformation;

varying vec3 InterpolatedViewNormal;

void main() {
  mat4 ModelViewTransformation = WorldViewTransformation*ModelWorldTransformation;
  InterpolatedViewNormal = (ModelViewTransformation*vec4(ModelNormal, 0)).xyz;
  gl_Position = ProjectionTransformation*ModelViewTransformation*vec4(ModelPosition, 1);
}
