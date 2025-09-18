precision mediump float;
precision mediump int;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 vUv;

// Simplex-like noise (hash based)
float hash(vec2 p) {
  // Single float hash based on dot product to avoid returning a vec2
  float h = sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123;
  return -1.0 + 2.0 * fract(h);
}

float noise(in vec2 p){
  const float K1 = 0.366025404; // (sqrt(3)-1)/2;
  const float K2 = 0.211324865; // (3-sqrt(3))/6;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0*K2;
  float h1 = max(0.5 - dot(a,a), 0.0);
  float h2 = max(0.5 - dot(b,b), 0.0);
  float h3 = max(0.5 - dot(c,c), 0.0);
  float n = h1*h1*h1*h1*hash(i) + h2*h2*h2*h2*hash(i + o) + h3*h3*h3*h3*hash(i + 1.0);
  return n*2.0;
}

void main() {
  vec2 uv = vUv;
  vec2 res = u_resolution;
  float aspect = res.x / max(res.y, 1.0);

  // Distortion field
  float t = u_time * 0.3;
  vec2 p = uv*2.0 - 1.0;
  p.x *= aspect;

  float n1 = noise(uv*3.0 + t);
  float n2 = noise(uv*5.0 - t*1.2);
  float n = (n1*0.6 + n2*0.4);

  // Mouse-driven parallax highlight
  vec2 m = u_mouse*2.0 - 1.0;
  m.x *= aspect;
  float highlight = smoothstep(0.9, 1.0, 1.0 - distance(p, m + vec2(0.1*sin(t*2.0), 0.1*cos(t*1.6))));

  // Base glass tint (neutral near-black, no blue)
  vec3 baseCol = vec3(0.055, 0.055, 0.06);

  // Gloss pass (neutral grayscale highlights)
  float gloss = smoothstep(0.3, 1.0, n*0.5 + 0.5) * 0.6 + highlight*0.9;
  vec3 glossCol = mix(vec3(0.35), vec3(0.95), gloss*0.25);

  // Subtle gradient background (near-black)
  float v = smoothstep(0.0, 1.0, uv.y);
  vec3 bg = mix(vec3(0.0), vec3(0.02), v);

  // Combine with refraction-ish wobble
  float wobble = n*0.015;
  vec3 color = mix(bg, baseCol + glossCol*0.2, 0.6) + wobble;

  // Vignette
  float d = distance(uv, vec2(0.5));
  color *= 1.0 - smoothstep(0.6, 0.95, d);

  gl_FragColor = vec4(color, 0.9);
}
