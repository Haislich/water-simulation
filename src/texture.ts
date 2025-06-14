export class StaticTextureObject {
    private texture: WebGLTexture;

    constructor(
        private gl: WebGLRenderingContext,
        public readonly name: string,
        public readonly textureUnit: number,
        width: number,
        height: number,
        data: TexImageSource | Uint8Array | null,
        internalFormat: number = gl.RGBA,
        type: number = gl.UNSIGNED_BYTE,
        filter: number = gl.NEAREST
    ) {
        const tex = gl.createTexture();
        if (!tex) throw new Error("Failed to create texture");
        this.texture = tex;

        gl.bindTexture(gl.TEXTURE_2D, tex);

        if (data instanceof Uint8Array) {
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, internalFormat, type, data);
        } else if (data !== null) {
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, internalFormat, type, data);
        }


        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    bindInput(shader: WebGLProgram): void {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

        const location = this.gl.getUniformLocation(shader, this.name);
        if (location !== null) {
            this.gl.uniform1i(location, this.textureUnit);
        }
    }
}


export class DynamicTextureObject {
    private readTex: WebGLTexture;
    private writeTex: WebGLTexture;
    private framebuffer: WebGLFramebuffer;

    private readIndex = true;

    constructor(
        private gl: WebGLRenderingContext,
        public readonly name: string,
        public readonly textureUnit: number,
        public readonly width: number,
        public readonly height: number,
        internalFormat: number = gl.RGBA,
        type: number = gl.UNSIGNED_BYTE,
        filter: number = gl.NEAREST
    ) {
        this.readTex = this.createTexture(internalFormat, type, filter);
        this.writeTex = this.createTexture(internalFormat, type, filter);

        const fbo = gl.createFramebuffer();
        if (!fbo) throw new Error("Failed to create framebuffer");
        this.framebuffer = fbo;
    }

    private createTexture(internalFormat: number, type: number, filter: number): WebGLTexture {
        const tex = this.gl.createTexture();
        if (!tex) throw new Error("Failed to create texture");

        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, internalFormat, this.width, this.height, 0, internalFormat, type, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, filter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, filter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        return tex;
    }

    private get read(): WebGLTexture {
        return this.readIndex ? this.readTex : this.writeTex;
    }

    private get write(): WebGLTexture {
        return this.readIndex ? this.writeTex : this.readTex;
    }

    private swap(): void {
        this.readIndex = !this.readIndex;
    }

    bindInput(shader: WebGLProgram): void {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.read);

        const location = this.gl.getUniformLocation(shader, this.name);
        if (location !== null) {
            this.gl.uniform1i(location, this.textureUnit);
        }
    }

    renderWithin(draw: () => void): void {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.write, 0);
        this.gl.viewport(0, 0, this.width, this.height);

        draw();

        this.swap();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
}
