attribute vec2 a_position;
uniform mediump vec2 u_resolution;
uniform mediump float u_radius;

void main() {
    gl_PointSize = u_radius; 
    vec2 zeroToOne = a_position / u_resolution;
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}