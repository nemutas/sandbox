uniform sampler2D tImage;
varying vec2 vUv;
varying vec2 vScreenUv;

void main() {
  vec4 tex = texture2D(tImage, vScreenUv);

  gl_FragColor = tex;
}