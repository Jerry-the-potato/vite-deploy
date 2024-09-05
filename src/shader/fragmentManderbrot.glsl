precision highp float;

uniform mediump vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;

struct DoubleVec2 {
    float high;
    float low;
};

float decimalPlaces = 30.0;
float scale = pow(10.0, decimalPlaces);
float scaleReverse = pow(10.0, -decimalPlaces);
float scaleSqrt = pow(10.0, decimalPlaces / 2.0);

float getHigh(float value){
    float scaledValue = value * scale;
    float truncatedValue = floor(scaledValue);
    float result = truncatedValue * scaleReverse;
    return result;
    // return value;
}

// 雙精度加法
DoubleVec2 dadd(DoubleVec2 a, DoubleVec2 b) {
    // 使用高位和低位加法
    float sumHigh = getHigh(a.high + b.high);
    float sumLow = a.low + b.low;

    // 計算進位
    float carry = floor(sumLow) * scaleReverse;

    // 分配尾數
    DoubleVec2 result;
    result.high = sumHigh + 0.0;
    result.low = sumLow - floor(sumLow);

    if(floor(sumLow) > 1.0) result.high = 0.0;

    return result;
}

//雙精度減法
DoubleVec2 dminus(DoubleVec2 a, DoubleVec2 b) {
    float sumHigh = getHigh(a.high - b.high);
    float sumLow = a.low - b.low;
    
    // 分配尾數
    DoubleVec2 result;
    result.high = sumHigh + 0.0;
    result.low = sumLow - floor(sumLow);

    return result;
}

float fmul(float a, float b){
    float left = (a * scaleSqrt - floor(a * scaleSqrt)) ;
    float right = (b * scaleSqrt - floor(b * scaleSqrt)) ;
    return left * right;
}

// 雙精度乘法
DoubleVec2 dmul(DoubleVec2 a, DoubleVec2 b) {

    // 0, 1, 2 表示單位，有多少次 2^(24)
    // 其中 high 是 0，low 是 1，因此2會進位到1，1會進位到0
    float hh0 = a.high * b.high; // 標準乘法
    float hh1 = fmul(a.high, b.high); // 溢出小數
    float hl1 = a.high * b.low + a.low * b.high; // 高位進位
    float ll2 = a.low * b.low; // 低位進位

    // 單位: n0 = n1 * scaleReverse; n1 = n2 * scaleReverse;
    float high0 = hh0;
    float low1 = hh1 + hl1 + floor(ll2) * scaleReverse;
    // 返回結果
    DoubleVec2 result;
    result.high = getHigh(high0 + floor(low1) * scaleReverse);
    result.low = low1 - floor(low1);

    return result;
}


float getExponent(float num){
    float exponent = floor(log(abs(num)) / log(10.0));
    return pow(10.0, exponent);
}

// 雙精度除單精度
DoubleVec2 ddiv(DoubleVec2 a, float b) {

    float e = getExponent(b);
    float hh0 = a.high / b;
    float hh1 = (a.high) / floor(b / e) / e;
    float hl1 = a.low / b;

    float high0 = hh0;
    float low1 = hh1 + hl1;

    DoubleVec2 result;
    result.high = getHigh(high0 + floor(low1) * scaleReverse);
    result.low = low1 - floor(low1);

    // if(low1 > 0.8) result.high = 0.0;
    // if(floor(a.high / 100.0) * 100.0 == a.high) result.high = 0.0;

    // if(hh0 / scaleReverse == hh1){
    //     result.low = hh1;
    // }
    // else{
    //     // result.low = hh1;
    // }



    return result;
}

// 將單精度浮點數轉換為倍精度結構
DoubleVec2 floatToDoubleVec2(float f) {
    DoubleVec2 result;
    result.high = f;
    result.low = 0.0;
    return result;
}

// 將 DoubleVec2 結構轉換為單一浮點數
float DoubleVec2ToFloat(DoubleVec2 d) {
    return d.high;
}

// 161789956.22774595
// 161789956.22774595
// 546041102.2686427
// 31958509.872147348

// 2623956791.0043197
// 802316031.8259898
// 75031682.7451647

void main(){

    const bool isDouble = true;
    const bool isDouble2 = false;
    if(isDouble2){
        
        DoubleVec2 cX = floatToDoubleVec2(gl_FragCoord.x - u_resolution.x * 0.5 + u_offset.x);
        DoubleVec2 cY = floatToDoubleVec2(gl_FragCoord.y - u_resolution.y * 0.5 + u_offset.y);
        cX = ddiv(cX, u_zoom);
        cY = ddiv(cY, u_zoom);
        // if(u_offset.x > floor(u_offset.x)) return;

        // if(cX.low == 0.0 && cY.low == 0.0) return;
        // if(gl_FragCoord.x < 500.0) return;
        // if(pow(10.0, -44.) == 0.0) return;
        
        DoubleVec2 zX = floatToDoubleVec2(0.0);
        DoubleVec2 zY = floatToDoubleVec2(0.0);

        for (float i = 0.0; i < 100.0; i++) {

            // z = z^2 + c
            DoubleVec2 zX2 = dmul(zX, zX);
            DoubleVec2 zY2 = dmul(zY, zY);
            DoubleVec2 zXY = dmul(zX, zY);

            zX = dadd(dminus(zX2, zY2), cX);
            zY = dadd(dadd(zXY, zXY), cY);

            // if(zX.low == 0.0 && zY.low == 0.0) return;

            // 使用倍精度計算長度
            DoubleVec2 len2 = dadd(dmul(zX, zX), dmul(zY, zY));
            if (DoubleVec2ToFloat(len2) > 4.0) {
                float color = i / 100.0;
                gl_FragColor = vec4(color * 0.9, color * 0.8, color * 0.25, 1.0);
                break;
            }
        }
        return;
    }

    vec2 c = (gl_FragCoord.xy - u_resolution * 0.5) / u_zoom + u_offset;
    // vec2 c = (gl_FragCoord.xy - u_resolution * 0.5  + u_offset) / u_zoom;
    vec2 z = vec2(0.0, 0.0);
    
    for (float i = 0.0; i < 100.0; i++) {

        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if (length(z) > 2.0){
            float color = i / 100.0;
            gl_FragColor = vec4(color, color * 0.5, color * 0.25, 1.0);
            break;
        }
    }
}
