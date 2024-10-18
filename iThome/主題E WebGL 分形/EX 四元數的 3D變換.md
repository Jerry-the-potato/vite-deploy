四元數在 3D 變換中的應用
假如你正在繪製 3D 圖形並且需要進行旋轉，四元數將比旋轉矩陣更有效率且穩定。以下是如何在 WebGL 中使用四元數進行 3D 旋轉的基本步驟。

四元數旋轉公式
四元數的旋轉公式可以表現為：

𝑘
q=w+xi+yj+zk
這裡的 w 是實部，x, y, z 是虛部。

一個四元數可以表示為：

q=cos(θ/2)+sin(θ/2)⋅(xi+yj+zk)

其中，theta 是旋轉角度，x, y, z 是旋轉軸的單位向量。

用四元數實現 3D 旋轉的步驟
定義四元數旋轉的 GLSL 代碼： 在頂點著色器中，使用四元數進行旋轉。
glsl
複製程式碼
uniform vec4 u_quaternion;  // 傳遞四元數

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
    vec3 rotatedPosition = rotateByQuaternion(a_position, u_quaternion);  // 應用四元數旋轉
    gl_Position = vec4(rotatedPosition, 1.0);
}
在 JavaScript 中傳遞四元數： 使用 gl.uniform4f 將四元數傳遞到著色器中。
javascript
複製程式碼
function quaternionFromAxisAngle(axis, angle) {
    const halfAngle = angle / 2;
    const sinHalfAngle = Math.sin(halfAngle);
    return [
        axis[0] * sinHalfAngle,  // x
        axis[1] * sinHalfAngle,  // y
        axis[2] * sinHalfAngle,  // z
        Math.cos(halfAngle)      // w
    ];
}

const axis = [0, 1, 0];  // 例如，沿著 Y 軸旋轉
const angle = Math.PI / 4;  // 45 度角
const quaternion = quaternionFromAxisAngle(axis, angle);

const quaternionUniformLocation = gl.getUniformLocation(program, "u_quaternion");
gl.uniform4f(quaternionUniformLocation, quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
四元數旋轉的優點：
避免萬向鎖（gimbal lock）問題：萬向鎖是在 3D 空間旋轉時使用歐拉角的常見問題，四元數能有效避免。
更平滑的插值：四元數能提供更平滑的旋轉插值，特別是在需要從一個旋轉狀態平滑過渡到另一個旋轉狀態時，常見於動畫中。
效率更高：對於多次連續旋轉，四元數比旋轉矩陣更加高效。