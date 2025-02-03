// BlockyAnt.js
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotationMat;
  uniform float u_Size;
  void main() {
    gl_Position = u_GlobalRotationMat * u_ModelMatrix * a_Position;
    gl_PointSize = u_Size;
  }
`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotationMat;

var g_shapesList = [];

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotationMat = gl.getUniformLocation(gl.program, 'u_GlobalRotationMat');
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addHtmlUIActions();
  canvas.onmousedown = click;
  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };
  gl.clearColor(0.0, 0.0, 0.0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_clockStart = performance.now() / 1000.0;
var g_clock = performance.now() / 1000.0 - g_clockStart;

function tick() {
  g_clock = performance.now() / 1000.0 - g_clockStart;
  updateAnimation();
  renderAllShapes();
  requestAnimationFrame(tick);
}

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_size = 5;
let g_angle = 30;
let g_animation = true;
let g_upperLock = false;

function addHtmlUIActions() {
  document.getElementById('aniOn').onclick = function () { g_animation = true; };
  document.getElementById('aniOff').onclick = function () { g_animation = false; };

  document.getElementById("upperSlider").addEventListener("mousemove", function () {
    g_upperLock = false;
    if (!g_animation) {
      g_upperAngle = parseFloat(this.value);
    }
  });
  document.getElementById("lowerSlider").addEventListener("mousemove", function () {
    if (!g_animation) {
      g_lowerAngle = parseFloat(this.value);
      g_upperLock = true;
    }
  });
  document.getElementById("rotationSlider").addEventListener("mousemove", function () { g_angle = this.value; renderAllShapes(); });
}

var g_upperAngle = 15;
var g_lowerAngle = 0;

function updateAnimation() {
  if (g_animation) {
    const phase = Math.sin(g_clock * 3); // Slower animation for ant-like movement
    g_upperAngle = 15 * phase;
    g_lowerAngle = -20 * phase;
  }
}

function renderAllShapes() {
  var startTime = performance.now();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  g_shapesList = [];

  var globalRotationMat = new Matrix4().rotate(g_angle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotationMat, false, globalRotationMat.elements);

  var mainColor = [0.3, 0.2, 0.2, 1.0]; // Dark brown for ant body

  // Ant head
  var head = new Cube();
  head.color = mainColor;
  head.matrix.translate(-0.08, 0.05, -0.15);  // Moved up slightly
  head.matrix.scale(0.15, 0.15, 0.15);
  g_shapesList.push(head);

  // Ant thorax (middle segment)
  var thorax = new Cube();
  thorax.color = mainColor;
  thorax.matrix.translate(-0.1, 0, 0);  // Moved up slightly
  thorax.matrix.scale(0.2, 0.15, 0.2);
  g_shapesList.push(thorax);

  // Ant abdomen (rear segment)
  var abdomen = new Cube();
  abdomen.color = mainColor;
  abdomen.matrix.translate(-0.15, -0.03, 0.2);  // Moved up slightly
  abdomen.matrix.scale(0.3, 0.25, 0.35);
  g_shapesList.push(abdomen);

  // Antennae
  createAntenna(0.02, 0.15, -0.2, 1);  // Right antenna
  createAntenna(-0.02, 0.15, -0.2, -1); // Left antenna

  // Ant legs (3 pairs)
  const NUM_LEGS = 3; // Per side
  const LEG_SPACING = 0.2;  // Increased spacing between legs

  for (let i = 0; i < NUM_LEGS; i++) {
    // Right legs
    createLeg(0.12, -0.15 + (i * LEG_SPACING), 0.35, -1);  // Increased length and spread
    // Left legs
    createLeg(-0.12, -0.15 + (i * LEG_SPACING), 0.35, 1);  // Increased length and spread
  }

  // Ant eyes
  const eye = new Cube();
  eye.color = [0, 0, 0, 1]; // Black eyes
  eye.matrix.translate(-0.03, 0.1, -0.22);  // Adjusted for new head position
  eye.matrix.scale(0.03, 0.03, 0.03);
  g_shapesList.push(eye);

  const eye2 = new Cube();
  eye2.color = [0, 0, 0, 1];
  eye2.matrix.translate(0.03, 0.1, -0.22);  // Adjusted for new head position
  eye2.matrix.scale(0.03, 0.03, 0.03);
  g_shapesList.push(eye2);

  // Render all shapes
  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps " + Math.floor(10000 / duration) / 10, "numdot");
}

function createLeg(xOffset, zOffset, length, side) {
  // Coxa (hip joint)
  const coxa = new Cube();
  coxa.color = [0.25, 0.15, 0.15, 1.0];
  coxa.matrix.translate(xOffset, -0.05, zOffset);
  coxa.matrix.rotate(side * (30 + g_upperAngle), 0, 0, 1);  // Increased angle
  coxa.matrix.scale(0.03, 0.03, length / 3);  // Thicker and longer
  g_shapesList.push(coxa);

  // Femur (thigh)
  const femur = new Cube();
  femur.color = [0.3, 0.2, 0.2, 1.0];
  femur.matrix = new Matrix4(coxa.matrix);
  femur.matrix.translate(0, 0, length / 3);
  femur.matrix.rotate(side * (25 + g_lowerAngle), 0, 0, 1);  // Increased angle
  femur.matrix.scale(1, 1, 1.4);  // Longer segment
  g_shapesList.push(femur);

  // Tibia (lower leg)
  const tibia = new Cube();
  tibia.color = [0.35, 0.25, 0.25, 1.0];
  tibia.matrix = new Matrix4(femur.matrix);
  tibia.matrix.translate(0, 0, length / 3 * 1.4);
  tibia.matrix.rotate(side * (15 + g_lowerAngle / 2), 0, 0, 1);  // Increased angle
  tibia.matrix.scale(0.8, 0.8, 1.5);  // Longer segment
  g_shapesList.push(tibia);
}


function createAntenna(xOffset, yOffset, zOffset, side) {
  // Base segment
  const base = new Cube();
  base.color = [0.25, 0.15, 0.15, 1.0];
  base.matrix.translate(xOffset, yOffset, zOffset);
  base.matrix.rotate(side * 30, 1, 0, 0);
  base.matrix.scale(0.01, 0.01, 0.15);
  g_shapesList.push(base);

  // Tip segment
  const tip = new Cube();
  tip.color = [0.3, 0.2, 0.2, 1.0];
  tip.matrix = new Matrix4(base.matrix);
  tip.matrix.translate(0, 0, 1);
  tip.matrix.rotate(side * 30, 1, 0, 0);
  tip.matrix.scale(1, 1, 0.8);
  g_shapesList.push(tip);
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function click(ev) {
  [x, y] = convertCoordinatesToGL(ev);
  let point = new Point();
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_size;
  g_shapesList.push(point);
  renderAllShapes();
}