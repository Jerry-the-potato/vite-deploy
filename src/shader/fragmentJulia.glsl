precision highp float;

uniform mediump vec2 u_resolution; // 畫布的解析度
uniform vec2 u_offset;
uniform float u_zoom;
uniform vec2 u_c; // 常數c的值 

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

void main() {
    vec2 z = (gl_FragCoord.xy - u_resolution * 0.5) / u_zoom + u_offset;
    const int maxIterations = 100;
    for(int i = 0; i < maxIterations; i++) {
        z = complexMul(z, z) + u_c + u_offset;
        if(dot(z, z) > 4.0){
            float color = 0.1 + 0.7 * float(i) / float(maxIterations);
            gl_FragColor = vec4(vec3(color), 1.0);

            float n1 = (sin(pow(float(i), 0.6) * 50.0 / 100.0) * 0.35) + 0.65;
            float n2 = (cos(pow(float(i), 0.6) * 50.0 / 100.0) * 0.35) + 0.65;
            gl_FragColor = vec4(clamp(vec3(n1, 0.85 * n1, 0.55 * n1), 0.0, 1.0), 1.0);
            break;
        }
    }
}