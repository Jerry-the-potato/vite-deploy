precision highp float;

uniform sampler2D u_texture;  // 接收上一步的 texture
varying vec2 v_texCoord;  // 傳遞紋理坐標

void main() {
    // 獲取當前像素以及周圍的像素值進行抗鋸齒處理
    vec3 color = texture2D(u_texture, v_texCoord).rgb;

    // 動態應用 FXAA 或其他抗鋸齒技術
    // vec3 antiAliasedColor = applyFXAA(u_texture, v_texCoord);

    // 最終輸出
    gl_FragColor = vec4(color, 1.0);
}