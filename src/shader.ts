export class Shader {
    readonly handle: WebGLShader;

    constructor(
        readonly gl: WebGLRenderingContext,
        readonly type: number, // gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
        readonly source: string
    ) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("Failed to create shader");

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compile error: ${log}`);
        }

        this.handle = shader;
    }
    // TODO: Create a set uniform method
}
export class ShaderProgram {
    readonly program: WebGLProgram;

    constructor(
        readonly gl: WebGLRenderingContext,
        readonly vertexShader: Shader,
        readonly fragmentShader: Shader
    ) {
        const program = gl.createProgram();
        if (!program) throw new Error("Failed to create shader program");

        gl.attachShader(program, vertexShader.handle);
        gl.attachShader(program, fragmentShader.handle);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const log = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Program link error: ${log}`);
        }

        this.program = program;
    }

    use(): void {
        this.gl.useProgram(this.program);
    }
}