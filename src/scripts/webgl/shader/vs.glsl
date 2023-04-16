varying vec2 vUv;
varying vec2 vScreenUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

  vScreenUv = (gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}