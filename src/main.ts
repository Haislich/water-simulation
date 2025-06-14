
function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw new Error('Unable to initialize WebGL. Your browser may not support it.');
    }
    return gl;
}

window.onload = () => {
    const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
    const gl = getContext(canvas);
    var vertexBuffer
};



import { vec3, vec2 } from 'gl-matrix';

export function createPlaneMesh(gl: WebGLRenderingContext) {
    // Define the plane dimensions and detail
    // The plane will be centered at the origin and extend from -1 to 1 in both X and Y directions
    // The detail level determines how many subdivisions the plane will have
    // This will create a 2x2 plane with 1x1 subdivisions, resulting in 4 vertices and 2 triangles
    // Each quad will be made of two triangles
    const detailX = 1;
    const detailY = 1;
    // Arrays to hold vertex attributes
    const positions: number[] = [];
    const indices: number[] = [];
    const texCoords: number[] = [];
    const normals: number[] = [];

    for (let y = 0; y <= detailY; y++) {

        const t = y / detailY;
        for (let x = 0; x <= detailX; x++) {
            const s = x / detailX;

            // Position in [-1, 1] range
            positions.push(2 * s - 1, 2 * t - 1, 0);
            // Texture coordinates in [0, 1]
            texCoords.push(s, t);
            // Flat normal facing +Z
            normals.push(0, 0, 1);

            // Generate two triangles per quad
            if (x < detailX && y < detailY) {
                const i = x + y * (detailX + 1);
                indices.push(i, i + 1, i + detailX + 1);
                indices.push(i + detailX + 1, i + 1, i + detailX + 2);
            }
        }
    }
    console.log(positions, indices, texCoords, normals);
    // Create and upload a buffer
    function createBuffer(target: number, data: number[], usage = gl.STATIC_DRAW) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, new Float32Array(data), usage);
        return buffer;
    }

    const positionBuffer = createBuffer(gl.ARRAY_BUFFER, positions);
    const texCoordBuffer = createBuffer(gl.ARRAY_BUFFER, texCoords);
    const normalBuffer = createBuffer(gl.ARRAY_BUFFER, normals);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        positionBuffer,
        texCoordBuffer,
        normalBuffer,
        indexBuffer,
        vertexCount: indices.length,
    };
}
export function createPingPongTextures(gl: WebGLRenderingContext, width = 256, height = 256) {
    // Try using full float textures
    const floatExt = gl.getExtension('OES_texture_float');
    const floatLinearExt = gl.getExtension('OES_texture_float_linear');

    let type: GLenum = gl.FLOAT;
    let filter = floatLinearExt ? gl.LINEAR : gl.NEAREST;

    // Check renderability
    function canRenderTo(type: number, filter: number): boolean {
        const tex = gl.createTexture();
        const fbo = gl.createFramebuffer();

        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

        const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;

        // Cleanup
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(fbo);
        gl.deleteTexture(tex);

        return complete;
    }

    // If full float is unsupported for rendering, fallback to half-float
    if (!canRenderTo(type, filter)) {
        const halfFloatExt = gl.getExtension('OES_texture_half_float');
        const halfFloatLinearExt = gl.getExtension('OES_texture_half_float_linear');

        if (!halfFloatExt) {
            throw new Error('Neither full nor half float rendering is supported');
        }

        type = halfFloatExt.HALF_FLOAT_OES;
        filter = halfFloatLinearExt ? gl.LINEAR : gl.NEAREST;

        if (!canRenderTo(type, filter)) {
            throw new Error('Half-float rendering not supported on this browser/GPU');
        }
    }

    // Create the actual ping-pong textures
    function createTexture(): WebGLTexture {
        const tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
        return tex;
    }

    const textureA = createTexture();
    const textureB = createTexture();

    return { textureA, textureB, type, filter };
}

export function createShaderProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
    // Compile a shader of given type
    function compileShader(type: number, source: string): WebGLShader {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error("Shader compile error:\n" + gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    // Compile and link program
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Program link error:\n" + gl.getProgramInfoLog(program));
    }

    // Detect all uniform sampler names (need uniform1i)
    const isSampler: Record<string, boolean> = {};
    const combinedSource = vertexSource + '\n' + fragmentSource;
    const regex = /uniform\s+sampler(?:2D|Cube|3D)?\s+(\w+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(combinedSource)) && match != null) {

        isSampler[match[1]] = true;
    }

    // Return program and helper methods
    return {
        program,

        use() {
            gl.useProgram(program);
        },

        setUniforms(values: Record<string, any>) {
            this.use();
            for (const name in values) {
                const location = gl.getUniformLocation(program, name);
                if (!location) continue;
                const value = values[name];
                if (isSampler[name]) {
                    gl.uniform1i(location, value);
                } else if (typeof value === 'number') {
                    gl.uniform1f(location, value);
                } else if (Array.isArray(value)) {
                    switch (value.length) {
                        case 1: gl.uniform1f(location, value[0]); break;
                        case 2: gl.uniform2f(location, value[0], value[1]); break;
                        case 3: gl.uniform3f(location, value[0], value[1], value[2]); break;
                        case 4: gl.uniform4f(location, value[0], value[1], value[2], value[3]); break;
                        case 9: gl.uniformMatrix3fv(location, false, value); break;
                        case 16: gl.uniformMatrix4fv(location, false, value); break;
                    }
                }
            }
        }
    };
}
