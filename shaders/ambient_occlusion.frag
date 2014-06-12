precision mediump float;

const int MAX_KERNEL_SIZE = 128;

const float Radius = 1.0;

varying vec2 InterpolatedPosition;

uniform mat4 ProjectionTransformation, InverseProjectionTransformation, TempViewWorldTransformation;
uniform sampler2D Metadata;
uniform sampler2D Noise;
uniform int KernelSize;
uniform vec3 Kernel[MAX_KERNEL_SIZE];

void main() {
  vec2 TextureCoordinate = InterpolatedPosition*0.5 + 0.5;

  vec4 MetadataItem = texture2D(Metadata, TextureCoordinate);
  float ViewDepth = MetadataItem[3]*20.0; // <- ViewPosZ
  vec3 ViewNormal = (MetadataItem.xyz*2.0)-1.0;

  vec4 FarPlaneNDCPosition = vec4(InterpolatedPosition.xy, 1, 1);
  vec4 FarPlaneViewPosition = InverseProjectionTransformation*FarPlaneNDCPosition;
  vec3 ViewPosition = FarPlaneViewPosition.xyz*ViewDepth;
  vec3 WorldPosition = (TempViewWorldTransformation*vec4(ViewPosition, 1.0)).xyz;

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

  mat4 DEL_ME = ProjectionTransformation;

  float occlusion = 0.0;
  vec3 Sample;
  float black = 0.0;
  for(int i=0; i<MAX_KERNEL_SIZE; i++) {
    if(i >= KernelSize) break;

    // get sample position:
    Sample = KernelBasis * Kernel[i];
    //Sample = Kernel[i];
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
    occlusion += (sampleDepth <= Sample.z ? 1.0 : 0.0)*rangeCheck;
    if(ViewPosition.z*1.1 < sampleDepth) black = 0.5;
  }
  occlusion = (occlusion/float(KernelSize))*2.0;
  gl_FragColor = vec4(0, 1, 1, WorldPosition.z+2.0); // TYDELIGT AT SE AT World.Z ER AFHÆNGIG AF CAM POS :-(

  /*
  float op = (ViewPosition.x > -2.1 && ViewPosition.x < -1.9) ? 0.33 : 0.0;
  op += (ViewPosition.y > -0.95 && ViewPosition.y < -0.85) ? 0.33 : 0.0;
  op += (ViewPosition.z > 6.75 && ViewPosition.z < 6.95) ? 0.33 : 0.0;
  gl_FragColor = vec4(0, 1, 1, op);
  */

  float op = (WorldPosition.x > -2.1 && WorldPosition.x < -1.9) ? 0.33 : 0.0;
  op += (WorldPosition.y > -0.1 && WorldPosition.y < 0.2) ? 0.33 : 0.0;
  op += (WorldPosition.z > -3.1 && WorldPosition.z < -2.9) ? 0.33 : 0.0;
  gl_FragColor = vec4(0, 1, 1, op);

  // gl_FragColor = vec4(0, 1, 1, ViewPosition.z-10.0);
  // Interessant test: Farv alle dem der occluderes DET MINDSTE
}
