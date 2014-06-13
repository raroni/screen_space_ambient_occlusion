precision mediump float;

const int MAX_KERNEL_SIZE = 128;

const float Radius = 0.75;

varying vec2 InterpolatedTextureCoordinates;

uniform sampler2D PositionDistanceTexture;
uniform sampler2D RandomTexture;
uniform sampler2D NormalTexture;

const float OccluderBias = 0.05; // <- fix!

float SamplePixels(vec3 SourcePosition, vec3 SourceNormal, vec2 SampleTextureCoordinates) {
  vec3 SamplePosition = texture2D(PositionDistanceTexture, SampleTextureCoordinates).xyz;

  vec2 Attenuation = vec2(10, 50); // <- fix!

  // Calculate ambient occlusion amount between these two points
  // It is simular to diffuse lighting. Objects directly above the fragment cast
  // the hardest shadow and objects closer to the horizon have minimal effect.
  vec3 PositionVec = SamplePosition - SourcePosition; // << skodnavn??
  float intensity = max(dot(normalize(PositionVec), SourceNormal) - OccluderBias, 0.0);

  // Attenuate the occlusion, similar to how you attenuate a light source.
  // The further the distance between points, the less effect AO has on the fragment.
  float Distance = length(PositionVec); // <- godt navn?
  float attenuation = 1.0 / (Attenuation.x + (Attenuation.y * Distance));

  return intensity * attenuation;
}

void main() {
  vec4 x = texture2D(RandomTexture, InterpolatedTextureCoordinates);
  vec4 y = texture2D(PositionDistanceTexture, InterpolatedTextureCoordinates);
  vec4 z = texture2D(NormalTexture, vec2(0.5, 0.5));

  vec4 PositionDistance = texture2D(PositionDistanceTexture, InterpolatedTextureCoordinates);
  vec3 Position = PositionDistance.xyz;
  float Distance = PositionDistance.w;

  vec3 Normal = texture2D(NormalTexture, InterpolatedTextureCoordinates).xyz;

  vec2 TexelSize = vec2(1.0/1000.0, 1.0/400.0); // <- fix!
  float SamplingRadius = 10.0; // <- fix!

  vec2 RandomVector = normalize(texture2D(RandomTexture, InterpolatedTextureCoordinates).xy);

  float KernelRadius = SamplingRadius * (1.0 - Distance);

  vec2 Kernel[4];
  Kernel[0] = vec2(0.0, 1.0);
  Kernel[1] = vec2(1.0, 0.0);
  Kernel[2] = vec2(0.0, -1.0);
  Kernel[3] = vec2(-1.0, 0.0);

  const float SinPi4th = 0.707107; // 45 degrees = sin(PI / 4)

  float occlusion = 0.0;
  for(int i=0; i<4; ++i) {
    vec2 k1 = reflect(Kernel[i], RandomVector);
    vec2 k2 = vec2(k1.x * SinPi4th - k1.y * SinPi4th, k1.x * SinPi4th + k1.y * SinPi4th);
    k1 *= TexelSize;
    k2 *= TexelSize;

    occlusion += SamplePixels(Position, Normal, InterpolatedTextureCoordinates + k1 * KernelRadius);
    occlusion += SamplePixels(Position, Normal, InterpolatedTextureCoordinates + k2 * KernelRadius * 0.75);
    occlusion += SamplePixels(Position, Normal, InterpolatedTextureCoordinates + k1 * KernelRadius * 0.5);
    occlusion += SamplePixels(Position, Normal, InterpolatedTextureCoordinates + k2 * KernelRadius * 0.25);
  }

  gl_FragColor = vec4(occlusion, 0, 0, 1);
}
