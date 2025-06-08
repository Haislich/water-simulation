function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw new Error('Unable to initialize WebGL. Your browser may not support it.');
    }
    return gl;
}

export function loadTextureImage(
    gl: WebGL2RenderingContext,
    src: string,
    textureUnit: number // equivalent to your `TextureUnit.TEXTURE_N()`
): void {
    const image = new Image();

    image.onload = () => {
        const texture = gl.createTexture();
        if (!texture) {
            console.error("Failed to create texture.");
            return;
        }

        gl.activeTexture(textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );
    };

    image.src = src;
}

function main() {
    const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
    const gl = getContext(canvas)
    loadTextureImage(gl, "/textures/dudvmap.png", gl.TEXTURE0)
    loadTextureImage(gl, "/textures/normalmap.png", gl.TEXTURE1)
    loadTextureImage(gl, "/textures/stone-texture.png", gl.TEXTURE2)
}

main()