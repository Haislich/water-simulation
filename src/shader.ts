export class Shader {
    private program: WebGLProgram;

    constructor(private gl: WebGLRenderingContext, vertexSrc: string, fragmentSrc: string) {

        const vs = this.compileShader(gl.VERTEX_SHADER, vertexSrc);
        const fs = this.compileShader(gl.FRAGMENT_SHADER, fragmentSrc);

        this.program = gl.createProgram()!;
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const log = gl.getProgramInfoLog(this.program);
            throw new Error(`Shader program link failed:\n${log}`);
        }
    }

    private compileShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const log = this.gl.getShaderInfoLog(shader);
            throw new Error(`Shader compile error (${type === this.gl.VERTEX_SHADER ? 'vertex' : 'fragment'}):\n${log}`);
        }

        return shader;
    }

    use(): void {
        this.gl.useProgram(this.program);
    }

    getAttribLocation(name: string): number {
        return this.gl.getAttribLocation(this.program, name);
    }

    setUniform1f(name: string, x: number): void {
        const loc = this.gl.getUniformLocation(this.program, name);
        if (loc) this.gl.uniform1f(loc, x);
    }

    setUniform1i(name: string, x: number): void {
        const loc = this.gl.getUniformLocation(this.program, name);
        if (loc) this.gl.uniform1i(loc, x);
    }

    setUniform2f(name: string, x: number, y: number): void {
        const loc = this.gl.getUniformLocation(this.program, name);
        if (loc) this.gl.uniform2f(loc, x, y);
    }

    setUniform3f(name: string, x: number, y: number, z: number): void {
        const loc = this.gl.getUniformLocation(this.program, name);
        if (loc) this.gl.uniform3f(loc, x, y, z);
    }

    setUniformMatrix4fv(name: string, matrix: Float32Array): void {
        const loc = this.gl.getUniformLocation(this.program, name);
        if (loc) this.gl.uniformMatrix4fv(loc, false, matrix);
    }

}
