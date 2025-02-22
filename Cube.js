class Cube{
    constructor(){
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
    render(){
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //front of cube;
        drawTriangle3D([
            0.0, 0.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, 0.0, 0.0
        ]);
        drawTriangle3D([
            0.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            1.0, 1.0, 0.0
        ]);

        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);

        //top
        drawTriangle3D([
            0, 1, 0,
            0, 1, 1,
            1, 1, 1
        ]);
        drawTriangle3D([
            0, 1, 0,
            1, 1, 1,
            1, 1, 0
        ]);

        gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
        //right side
        drawTriangle3D([
            1, 0, 0,
            1, 1, 0,
            1, 1, 1
        ]);

        drawTriangle3D([
            1, 0, 0,
            1, 1, 1,
            1, 0, 1
        ]);

        //bottom

        gl.uniform4f(u_FragColor, rgba[0] * .7, rgba[1] * .7, rgba[2] * .7, rgba[3]);
        drawTriangle3D([
            1, 0, 0,
            0, 0, 1,
            1, 0, 1
        ]);

        drawTriangle3D([
            0, 0, 0,
            0, 0, 1,
            1, 0, 0
        ]);

        //left side

        drawTriangle3D([
            0, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);

        drawTriangle3D([
            0, 1, 0,
            0, 1, 1,
            0, 0, 1
        ]);

        //back
        gl.uniform4f(u_FragColor, rgba[0] * .5, rgba[1] * .5, rgba[2] * .5, rgba[3]);
        drawTriangle3D([
            0, 1, 1,
            1, 1, 1,
            0, 0, 1
        ]);

        drawTriangle3D([
            1, 1, 1,
            1, 0, 1,
            0, 0, 1
        ]);

    }
}