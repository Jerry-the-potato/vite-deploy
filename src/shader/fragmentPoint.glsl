precision mediump float;
uniform vec2 u_resolution;
uniform float u_radius;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);  // 計算當前像素相對於點中心的座標
    float dist = length(coord);  // 計算當前像素與點中心的距離
    float edge = min(2.0 / u_radius, 0.2);
    float radius = 0.5; // 在點相對空間中，gl_PointSize默認範圍[0, 1]
    float alpha = smoothstep(radius - edge, radius + edge * 0.1, dist);  // 使用 smoothstep 來處理反鋸齒
    
    if (dist > radius) {
        discard;  // 如果超過半徑，丟棄該片段
    }
    // gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    gl_FragColor = vec4(vec3(1.0, gl_FragCoord.xy / u_resolution), 1.0 - alpha);  // 顏色為紅色，帶有反鋸齒效果的透明度
}