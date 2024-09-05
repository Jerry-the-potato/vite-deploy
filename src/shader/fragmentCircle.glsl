precision mediump float;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_radius;
uniform vec4 u_color;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec2 aspectRatio = vec2(u_resolution.x / u_resolution.y, 1.0);

    float dist = distance(st * aspectRatio, u_center * aspectRatio);
    if (dist < u_radius) {
        gl_FragColor = u_color;
    } else {
        discard;
    }
}