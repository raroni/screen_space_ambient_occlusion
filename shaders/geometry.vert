attribute vec3 ModelPosition, ModelNormal;

uniform mat4 ProjectionTransformation;
uniform mat4 WorldViewTransformation;
uniform mat4 ModelWorldTransformation;
uniform vec3 WorldLightDirection;

varying vec4 vColor;
varying vec4 InterpolatedLightPosition;

void main() {
  vec4 WorldPosition = ModelWorldTransformation*vec4(ModelPosition, 1.0);
  gl_Position = ProjectionTransformation*WorldViewTransformation*WorldPosition;

  vec4 worldNormal = normalize(ModelWorldTransformation*vec4(ModelNormal, 0.0));

  float cosAngIncidence = dot(vec3(worldNormal), vec3(WorldLightDirection*-1.0));
  cosAngIncidence = clamp(cosAngIncidence, 0.0, 1.0);

  vec3 color = vec3(1, 0.55, 0.2);
  vColor = vec4(color*0.5+color*cosAngIncidence*0.5, 1);
}
