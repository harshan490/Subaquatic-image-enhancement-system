// ============ AURORA WEBGL EFFECT ============

class Aurora {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        
        // Set canvas size immediately
        this.resizeCanvas();
        
        this.gl = canvas.getContext('webgl2', { 
            alpha: true, 
            premultipliedAlpha: true,
            antialias: true 
        });
        
        this.isWebGL2 = !!this.gl;
        
        if (!this.gl) {
            console.warn('WebGL2 not supported, falling back to WebGL1');
            this.gl = canvas.getContext('webgl', { 
                alpha: true, 
                premultipliedAlpha: true 
            });
        }

        if (!this.gl) {
            console.error('WebGL context could not be initialized');
            return;
        }

        console.log('WebGL version:', this.isWebGL2 ? '2.0' : '1.0');

        this.gl.clearColor(0, 0, 0, 0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

        // Options
        this.colorStops = options.colorStops || ['#5227FF', '#292929', '#FF0000'];
        this.amplitude = options.amplitude || 1.0;
        this.blend = options.blend || 0.5;
        this.speed = options.speed || 1.0;

        this.time = 0;
        this.animationId = null;

        this.init();
        this.setupResizeListener();
        this.animate();
    }

    resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }

    init() {
        const vertShader = this.isWebGL2 ? this.VERTEX_SHADER_GL2 : this.VERTEX_SHADER_GL1;
        const fragShader = this.isWebGL2 ? this.FRAGMENT_SHADER_GL2 : this.FRAGMENT_SHADER_GL1;
        
        this.program = this.createProgram(vertShader, fragShader);
        if (!this.program) {
            console.error('Failed to create WebGL program');
            return;
        }
        
        this.createGeometry();
        this.gl.useProgram(this.program);
        
        // Set initial uniform values
        const uResolution = this.gl.getUniformLocation(this.program, 'uResolution');
        this.gl.uniform2f(uResolution, this.canvas.width, this.canvas.height);
    }
    
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(vertexSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentSource, this.gl.FRAGMENT_SHADER);
        
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking failed:', this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const error = this.gl.getShaderInfoLog(shader);
            console.error('Shader compilation failed:', error);
            console.error('Shader source:', source);
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createGeometry() {
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1, -1,
             1,  1,
            -1,  1
        ]);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.positionLocation = positionLocation;
        this.vertexCount = positions.length / 2;
    }

    setupResizeListener() {
        const resize = () => {
            this.resizeCanvas();
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

            const uResolution = this.gl.getUniformLocation(this.program, 'uResolution');
            this.gl.uniform2f(uResolution, this.canvas.width, this.canvas.height);
        };

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        const uResolution = this.gl.getUniformLocation(this.program, 'uResolution');
        this.gl.uniform2f(uResolution, this.canvas.width, this.canvas.height);
        
        window.addEventListener('resize', resize);
        this.resizeListener = resize;
    }

    getColorStopsArray() {
        return this.colorStops.map(hex => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            return [r, g, b];
        });
    }

    animate = () => {
        this.animationId = requestAnimationFrame(this.animate);

        this.time += 0.016 * this.speed;

        this.gl.useProgram(this.program);

        // Update uniforms
        const uTime = this.gl.getUniformLocation(this.program, 'uTime');
        const uAmplitude = this.gl.getUniformLocation(this.program, 'uAmplitude');
        const uBlend = this.gl.getUniformLocation(this.program, 'uBlend');
        const uColorStops = this.gl.getUniformLocation(this.program, 'uColorStops');

        this.gl.uniform1f(uTime, this.time);
        this.gl.uniform1f(uAmplitude, this.amplitude);
        this.gl.uniform1f(uBlend, this.blend);

        // Set color stops
        const colors = this.getColorStopsArray();
        const colorArray = new Float32Array(9);
        colors.forEach((color, i) => {
            colorArray[i * 3] = color[0];
            colorArray[i * 3 + 1] = color[1];
            colorArray[i * 3 + 2] = color[2];
        });
        this.gl.uniform3fv(uColorStops, colorArray);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    };

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
        }
    }

    VERTEX_SHADER_GL2 = `#version 300 es
        in vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    FRAGMENT_SHADER_GL2 = `#version 300 es
        precision highp float;

        uniform float uTime;
        uniform float uAmplitude;
        uniform vec3 uColorStops[3];
        uniform vec2 uResolution;
        uniform float uBlend;

        out vec4 fragColor;

        vec3 permute(vec3 x) {
            return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        float snoise(vec2 v){
            const vec4 C = vec4(
                0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439
            );
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);

            vec3 p = permute(
                permute(i.y + vec3(0.0, i1.y, 1.0))
              + i.x + vec3(0.0, i1.x, 1.0)
            );

            vec3 m = max(
                0.5 - vec3(
                    dot(x0, x0),
                    dot(x12.xy, x12.xy),
                    dot(x12.zw, x12.zw)
                ), 
                0.0
            );
            m = m * m;
            m = m * m;

            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution;
            
            vec3 color0 = uColorStops[0];
            vec3 color1 = uColorStops[1];
            vec3 color2 = uColorStops[2];
            
            vec3 rampColor;
            if (uv.x < 0.5) {
                rampColor = mix(color0, color1, uv.x * 2.0);
            } else {
                rampColor = mix(color1, color2, (uv.x - 0.5) * 2.0);
            }
            
            float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
            height = exp(height);
            height = (uv.y * 2.0 - height + 0.2);
            float intensity = 0.6 * height;
            
            float midPoint = 0.20;
            float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
            
            vec3 auroraColor = intensity * rampColor;
            
            fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
        }
    `;

    VERTEX_SHADER_GL1 = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    FRAGMENT_SHADER_GL1 = `
        precision highp float;

        uniform float uTime;
        uniform float uAmplitude;
        uniform vec3 uColorStops[3];
        uniform vec2 uResolution;
        uniform float uBlend;

        vec3 permute(vec3 x) {
            return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        float snoise(vec2 v){
            const vec4 C = vec4(
                0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439
            );
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);

            vec3 p = permute(
                permute(i.y + vec3(0.0, i1.y, 1.0))
              + i.x + vec3(0.0, i1.x, 1.0)
            );

            vec3 m = max(
                0.5 - vec3(
                    dot(x0, x0),
                    dot(x12.xy, x12.xy),
                    dot(x12.zw, x12.zw)
                ), 
                0.0
            );
            m = m * m;
            m = m * m;

            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution;
            
            vec3 color0 = uColorStops[0];
            vec3 color1 = uColorStops[1];
            vec3 color2 = uColorStops[2];
            
            vec3 rampColor;
            if (uv.x < 0.5) {
                rampColor = mix(color0, color1, uv.x * 2.0);
            } else {
                rampColor = mix(color1, color2, (uv.x - 0.5) * 2.0);
            }
            
            float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
            height = exp(height);
            height = (uv.y * 2.0 - height + 0.2);
            float intensity = 0.6 * height;
            
            float midPoint = 0.20;
            float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
            
            vec3 auroraColor = intensity * rampColor;
            
            gl_FragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
        }
    `;
}
// Initialize Aurora on page load
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('auroraCanvas');
    if (canvas) {
        new Aurora(canvas, {
            colorStops: ['#5227FF', '#292929', '#FF0000'],
            amplitude: 1.0,
            blend: 0.5,
            speed: 1.0
        });
    }
});