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

  float kernelRadius = SamplingRadius * (1.0 - Distance);

  vec2 kernel[4];
  kernel[0] = vec2(0.0, 1.0);
  kernel[1] = vec2(1.0, 0.0);
  kernel[2] = vec2(0.0, -1.0);
  kernel[3] = vec2(-1.0, 0.0);

  const float SinPi4th = 0.707107; // 45 degrees = sin(PI / 4)

  float occlusion = 0.0;
  for(int i=0; i<4; ++i) {
    vec2 k1 = reflect(kernel[i], RandomVector);
    vec2 k2 = vec2(k1.x * SinPi4th - k1.y * SinPi4th, k1.x * SinPi4th + k1.y * SinPi4th);
    k1 *= TexelSize;
    k2 *= TexelSize;

    occlusion += SamplePixels(Position, Normal, InterpolatedTextureCoordinates + k1 * kernelRadius);
    occlusion += SamplePixels(Position, Normal, InterpolatedTextureCoordinates + k2 * kernelRadius * 0.75);
    occlusion += SamplePixels(Position, Normal, InterpolatedTextureCoordinates + k1 * kernelRadius * 0.5);
    occlusion += SamplePixels(Position, Normal, InterpolatedTextureCoordinates + k2 * kernelRadius * 0.25);
  }

  gl_FragColor = vec4(occlusion, 0, 0, 1);
  //gl_FragColor = vec4(clamp(y.x, 0.0, 0.5), 0, 0, 1);
  /*
  vec4 x = texture2D(NormalMap, vec2(0.5, 0.5)); // temp hack

  vec2 TextureCoordinate = InterpolatedPosition*0.5 + 0.5;

  vec4 MetadataItem = texture2D(Metadata, TextureCoordinate);
  float ViewDepth = MetadataItem[3]*20.0;
  vec3 ViewNormal = (MetadataItem.xyz*2.0)-1.0;

  if(ViewDepth == 0.0) {
    gl_FragColor = vec4(0, 0, 0, 0);
    return;
  }

  vec4 FarPlaneNDCPosition = vec4(InterpolatedPosition.xy, 1, 1);
  vec4 FarPlaneViewPosition = InverseProjectionTransformation*FarPlaneNDCPosition;
  vec3 ViewPosition = FarPlaneViewPosition.xyz*ViewDepth;

  // Er/bør ViewDepth/ViewPosition.Z det samme? Burde man ikke anvende med w for at gå fra NDC > View?
  // THAT^ Det spørgsmål skal være tydeligt for mig. Så research det godt indtil det er "obvious".
  
  // IDE: Prøv at reducere/isolere problemet:
  // Kan du 50%-farve alle pixels som har occluders LIGE foran deres normal? (drop kernel og alt det)
  
  // Hvad depth skal gemmes i min metadata? Afstand til kameraet eller ViewPosition.z?
  // Damnit. A lot of works to do here :-(
  // Interessant test: Farv alle dem der occluderes DET MINDSTE
  // http://webglfactory.blogspot.dk/2011/05/how-to-convert-world-to-screen.html

  vec2 noiseScale = vec2(1000.0/4.0, 400.0/4.0);

  vec3 Rvec = texture2D(Noise, TextureCoordinate*noiseScale).xyz;
  Rvec = normalize(Rvec); // john-chapman does this
  vec3 Tangent = normalize(Rvec - ViewNormal*dot(Rvec, ViewNormal));
  vec3 Bitangent = cross(Tangent, ViewNormal);
  mat3 KernelBasis = mat3(Tangent, Bitangent, ViewNormal);

  float occlusion = 0.0;
  vec3 Sample;
  float black = 0.0;
  for(int i=0; i<MAX_KERNEL_SIZE; i++) {
    if(i >= KernelSize) break;

    // get sample position:
    Sample = KernelBasis * Kernel[i];
    Sample = ViewPosition + Sample*Radius;

    // project sample position:
    vec4 offset = vec4(Sample, 1.0);
    offset = ProjectionTransformation*offset;
    offset.xy /= offset.w;
    offset.xy = offset.xy * 0.5 + 0.5;

    // get sample depth:
    float sampleDepth = texture2D(Metadata, offset.xy).a*20.0;

    // range check & accumulate:
    float rangeCheck = abs(ViewPosition.z - sampleDepth) < Radius ? 1.0 : 0.0;
    occlusion += (sampleDepth+0.1 <= Sample.z ? 1.0 : 0.0)*rangeCheck;
  }

  occlusion = (occlusion/float(KernelSize));
  gl_FragColor = vec4(0, 0, occlusion, occlusion);
  */
}
