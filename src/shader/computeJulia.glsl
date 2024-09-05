layout (local_size_x = 16, local_size_y = 16) in;

uniform vec2 u_resolution;
uniform vec2 u_c;  // Julia set parameter
uniform int maxIterations;

layout (rgba32f, binding = 0) uniform image2D img_output;

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

void main() {
    ivec2 pixel_coords = ivec2(gl_GlobalInvocationID.xy);
    vec2 uv = vec2(pixel_coords) / u_resolution;
    vec2 z = uv * 2.0 - 1.0;

    int i;
    for(i = 0; i < maxIterations; i++) {
        z = complexMul(z, z) + u_c;
        if(dot(z, z) > 4.0) break;
    }

    float intensity = float(i) / float(maxIterations);
    vec4 color = vec4(vec3(intensity), 1.0);

    imageStore(img_output, pixel_coords, color);
}