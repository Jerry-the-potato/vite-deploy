precision mediump float;
uniform vec4 u_color;
uniform vec2 u_resolution;

void main() {
    gl_FragColor = u_color * vec4(gl_FragCoord.xy / u_resolution, 1.0, 0.0);
}