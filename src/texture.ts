export class Texture {
    static framebuffer: WebGLFramebuffer | null = null;
    static renderbuffer: WebGLRenderbuffer | null = null;
    static renderbufferSize: { width: number; height: number } | null = null;

    private _id: WebGLTexture;
    public get id() { return this._id; }
    public width: number;
    public height: number;

    constructor(
        private gl: WebGL2RenderingContext,
        width: number,
        height: number
    ) {
        this.width = width;
        this.height = height;

        this._id = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this._id);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA32F,
            width,
            height,
            0,
            gl.RGBA,
            gl.FLOAT,
            null
        );
    }

    bind(unit = 0): void {
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    }

    unbind(unit = 0): void {
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    canDrawTo(): boolean {
        const gl = this.gl;
        const fb = Texture.framebuffer ??= gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
        const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return complete;
    }

    drawTo(callback: () => void): void {
        const gl = this.gl;
        const prevViewport = gl.getParameter(gl.VIEWPORT);
        const fb = Texture.framebuffer ??= gl.createFramebuffer();
        const rb = Texture.renderbuffer ??= gl.createRenderbuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.bindRenderbuffer(gl.RENDERBUFFER, rb);

        if (
            !Texture.renderbufferSize ||
            Texture.renderbufferSize.width !== this.width ||
            Texture.renderbufferSize.height !== this.height
        ) {
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
            Texture.renderbufferSize = { width: this.width, height: this.height };
        }

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error('Framebuffer incomplete. Cannot draw to texture.');
        }

        gl.viewport(0, 0, this.width, this.height);
        callback();
        gl.viewport(prevViewport[0], prevViewport[1], prevViewport[2], prevViewport[3]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    swapWith(other: Texture): void {
        [this._id, other._id] = [other.id, this.id];
        [this.width, other.width] = [other.width, this.width];
        [this.height, other.height] = [other.height, this.height];
    }
}
