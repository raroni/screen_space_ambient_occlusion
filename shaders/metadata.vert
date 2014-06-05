attribute vec3 ModelPosition, ModelNormal;

uniform mat4 ProjectionTransformation;
uniform mat4 WorldViewTransformation;
uniform mat4 ModelWorldTransformation;

varying float InterpolatedViewPositionZ;
varying vec3 InterpolatedViewNormal;

void main() {
  mat4 ModelViewTransformation = WorldViewTransformation*ModelWorldTransformation;
  vec4 ViewPosition = ModelViewTransformation*vec4(ModelPosition, 1.0);
  gl_Position = ProjectionTransformation*ViewPosition;

  InterpolatedViewPositionZ = ViewPosition.z;
  InterpolatedViewNormal = normalize((ModelViewTransformation*vec4(ModelNormal, 0.0)).xyz);
}
