// Set up WebGL context and canvas element
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// Create shader program
const vertexShaderSource = `
  // vertex shader code here
`;
const fragmentShaderSource = `
  // fragment shader code here
`;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Load 3D object and texture
const objUrl = 'cube.obj';
const textureUrl = 'cube.png';
const objLoader = new THREE.OBJLoader();
const textureLoader = new THREE.TextureLoader();
let obj, texture;
objLoader.load(objUrl, (result) => {
  obj = result;
  textureLoader.load(textureUrl, (result) => {
    texture = result;
    init();
  });
});

// Initialize WebGL
function init() {
  // Create buffer for object data
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.textureCoords), gl.STATIC_DRAW);

  // Set up camera and projection matrix
  const fieldOfView = 45 * Math.PI / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  const modelViewMatrix = mat4.create();

  // Set up texture
  const textureId = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureId);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.generateMipmap(gl.TEXTURE_2D);

  // Set up user interaction
  let isAnimating = true;
  canvas.addEventListener('mousedown', () => {
    isAnimating = !isAnimating;
  });
  document.addEventListener('keydown', (event) => {
    if (event.keyCode === 32) {
      isAnimating = !isAnimating;
    }
  });

  // Render loop
  let then = 0;
  function render(now) {
    now *= 0.001;
    const deltaTime = now - then;
    then = now;

    if (isAnimating) {
      mat4.rotate(modelViewMatrix, modelViewMatrix, deltaTime, [0, 1, 0]);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    const textureCoordAttributeLocation = gl.getAttribLocation(program, 'a_textureCoord');
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoordAttributeLocation);

    const textureUniformLocation = gl.getUniformLocation(program, 'u_texture');
    gl.uniform1i(textureUniformLocation, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureId);

    const projectionMatrixUniformLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
    gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
    const modelViewMatrixUniformLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, obj.vertices.length / 3);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}