precision highp float;

uniform mediump vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform float u_transform;

float rand(float s) {
  return fract(sin(s*12.9898) * 43758.5453);
}

void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    // 將屏幕坐標轉換為複數平面坐標
    vec2 c = (gl_FragCoord.xy - u_resolution * 0.5) / u_zoom + u_offset;
    // vec2 c = (gl_FragCoord.xy - u_resolution * 0.5) / u_zoom + u_offset;
    c.y *= -1.0; // 翻轉 y 軸

    // 反鋸齒 & 隨機取樣
    const float AA_LEVEL = 2.0;
    for (float I = 0.; I < AA_LEVEL; I++) {
        
        float dx = u_offset.x - floor(u_offset.x);
        float dy = u_offset.y - floor(u_offset.y);
        vec2 dc = vec2(rand(dx * I * 0.54321 ), rand(dy * I * 0.12345 )) / u_zoom;
        if(I == 0.0) dc *= 0.0;
        vec2 z = vec2(0.0);
        float iteration = 0.0;
        const float max_iterations = 100.0;

        // 比較迭代前後的差異進行顏色渲染
        vec3 sum = vec3(0.0, 0.0, 0.0);
        vec2 pz = z;
        vec2 ppz = z;

        // Burning Ship 分形迭代
        iteration = max_iterations;
        for (float i = 0.0; i < max_iterations; i++) {
            if(i < u_transform) z = vec2(abs(z.x), abs(z.y)); // 將實部與虛部取絕對值
            z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c + dc;
            
            if (length(z) > 4.0){
                iteration = i;
                break; // 如果距離超過閾值，退出迴圈
            }
            ppz = pz;
            pz = z;
            sum.x += dot(z - pz, pz - ppz);
            sum.y += dot(z - pz, z - pz);
            sum.z += dot(z - ppz, pz - ppz);
        }

        // 計算顏色
        // float color = 0.1 + 0.7 * (iteration / max_iterations);
        // gl_FragColor = vec4(vec3(color, color * 0.75, color * 0.25), 1.0);
        if(iteration < max_iterations){
            float n1 = sin((iteration) * 0.15) * 0.35 + 0.65;
            float n2 = cos((iteration) * 1.50) * 0.15 + 0.65;
            color+= vec3(clamp(vec3(n1, n2, (n1 + n2) / 2.0), 0.0, 1.0));
        }
        else{
            sum = abs(sum) / max_iterations;
            vec3 color = sin(abs(sum * 5.0)) * 0.45 + 0.5;
            color+= vec3(clamp(color, 0.0, 1.0));
            if(I == 0.) break;
        }
    }

    color /= AA_LEVEL;
    float width = 1.0 / u_zoom;
    // float axisX = smoothstep(0.0, width, abs(c.y)); // 控制Y軸的寬度
    // float axisY = smoothstep(0.0, width, abs(c.x)); // 控制X軸的寬度
     // 使用硬邊界
    float axisX = step(width / 2.0, abs(c.y));
    float axisY = step(width / 2.0, abs(c.x));
    
    vec3 axisColor = vec3(0.0, 0.0, 0.0); // 藍色
    
    // vec3 finalColor = mix(color1, color2, grid); // 根據 grid 的值進行顏色混合
    vec3 finalColor = mix(axisColor, color, (axisX + axisY) / 2.0);
    gl_FragColor = vec4(finalColor, 1.0);
    // gl_FragColor.rgb = mix(axisColor, gl_FragColor.rgb, (axisX + axisY) / 2.0);
}