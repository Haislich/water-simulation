import type { HomogeneousMatrix } from "./matrix";

export interface SceneObject {
    readonly shaders: any;
    readonly textures: any;
    readonly meshes: any;
    // A function for adding meshes
    with_mesh(mesh: any): this;
    with_shader(shader: any): this;
    with_texture(texture: any): this;
    update?(dt: number): void;
    render(view: HomogeneousMatrix, projection: HomogeneousMatrix): void;
}
