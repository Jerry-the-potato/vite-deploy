attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // 將位置轉換為紋理坐標
    v_texCoord = (a_position + 1.0) * 0.5; // 轉換 [-1,1] 到 [0,1]
}