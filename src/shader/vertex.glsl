attribute vec2 a_position;
uniform mediump vec2 u_resolution;

vec3 rotateByQuaternion(vec3 position, vec4 q) {
    // 四元數乘法公式，用於旋轉一個向量
    vec3 q_xyz = q.xyz;
    float q_w = q.w;

    // 計算旋轉後的位置
    vec3 uv = cross(q_xyz, position);
    vec3 uuv = cross(q_xyz, uv);
    uv *= 2.0 * q_w;
    uuv *= 2.0;

    return position + uv + uuv;
}

void main() {
    gl_PointSize = 10.0; // 設置點的半徑範圍
    vec2 zeroToOne = a_position / u_resolution;
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    // vec4 u_quaternion = vec4(0.34, 0., 0.34, 0.34);
    // vec3 rotatedPosition = rotateByQuaternion(vec3(clipSpace, 0.0), u_quaternion);
    // gl_Position = vec4(rotatedPosition * vec3(1, -1, 1), 1);
}