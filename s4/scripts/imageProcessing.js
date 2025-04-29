var fileData;
function filer(fileEvent) {
  fileData = fileEvent.target.files[0];
  return new Promise((resolve, reject) => {
    if(!fileData.type.match('image.*')) {
      reject('画像を選択してください');
    }
    var reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(fileData);
  });
}

var loadedImage = {};
function loadImage(imgKey, imgSrc) {
  return new Promise((resolve, reject) => {
    if (!imgSrc) return reject('画像データではありません');
    var img = new Image();
    loadedImage[imgKey] = img;
    img.onload = () => resolve('ok');
    img.src = imgSrc;
  });
}

function composite(imgSrc) {
  new Promise((resolve) => resolve(imgSrc))
    .then((val) => loadImage('ss', imgSrc))
    .then(() => drawCanvasSeparater())
    .then(() => drawCanvasClip())
    .catch((msg) => {
      console.error('Error during composite process:', msg);
      alert('画像処理中にエラーが発生しました: ' + msg);
    });
}

function setupCanvas(name, hideFlg = false) {
  var working = 'working';
  $('#' + name).remove();
  $('<div>').attr('id', name).appendTo($('#' + working));
  $('<canvas>').attr('id', name + 'Canvas').appendTo('#' + name);
  if (hideFlg) $('#' + name + 'Canvas').hide();
  var canv = $('#' + name + 'Canvas').get(0);
  $('<button>').html('Download').click((e) => downloadCanvasImage(e, canv)).appendTo($('#' + name));
  return canv;
}

var clipimg, clipline;
const BASE_SIZE = 1000;
const CLIP_LINE_WIDTH_RATIO = 0.02;
const CLIP_LINE_HEIGHT_RATIO = 0.6;
const CLIP_IMG_SCALE_RATIO = 0.3;
function drawCanvasSeparater() {
  const canv = setupCanvas('separater');
  $('<div>').html('青いラインを動かして画像を切り抜きます<br />動かす時に飛び出ている□で角度を変えられます')
    .appendTo($(canv).parent());

  clipimg = new fabric.Image(loadedImage.ss);
  clipimg.scaleToWidth(BASE_SIZE);
  const width = clipimg.getScaledWidth();
  const height = clipimg.getScaledHeight();
  const canvas = new fabric.Canvas('separaterCanvas', {selection: false, preserveObjectStacking: !true});
  canvas.clear();
  canvas.renderAll();
  canvas.setDimensions({width: width, height: height});

  clipimg.scaleToWidth(width * CLIP_IMG_SCALE_RATIO);
  clipimg.set({
    originX: 'center',
    originY: 'center',
    left: width * 0.5,
    top: height * 0.5,
    selectable: false,
    evented: false
  });

  clipline = new fabric.Rect({
    originX: 'left',
    originY: 'center',
    left: width * 0.5,
    top: height * 0.5,
    width: width * CLIP_LINE_WIDTH_RATIO,
    height: height * CLIP_LINE_HEIGHT_RATIO,
    fill: 'rgba(0,0,200,0.3)',
    angle: 0
  });
  clipline.setControlsVisibility({mtr: true,
    ml:false, mr:false, mb:false, mt:false,
    bl:false, br:false, tl:false, tr:false,
  });

  canvas.add(clipimg).add(clipline).renderAll();
  canvas.on('object:moving', () => drawCanvasClip());
  canvas.on('object:rotating', () => drawCanvasClip());
}

var canvas1, polygon1;
function drawCanvasClip() {
  var cpr = getCrossPoint(clipline.aCoords, clipimg.aCoords);
  var base_size = 1000;

  var fimg = new fabric.Image(loadedImage.ss);
  fimg.scaleToWidth(base_size);
  fimg.setControlsVisibility({
    ml:false, mr:false, mb:false, mt:false,
  });
  var width = fimg.getScaledWidth();
  var height = fimg.getScaledHeight();

  var topleft = {x: 0, y: 0};
  var topright = {x: width, y: 0};
  var bottomright = {x: width, y: height};
  var bottomleft = {x: 0, y: height};
  var p = [topleft, topright, bottomright, bottomleft];
  if (cpr.top && cpr.bottom) {
    p[1].x = width * cpr.top;
    p[2].x = width * cpr.bottom;
  } else if (cpr.left && cpr.right) {
    p[2].y = height * cpr.right;
    p[3].y = height * cpr.left;
  } else if (cpr.top && cpr.left) {
    p[1].x = 0;
    p[2].x = width * cpr.top;
    p[2].y = 0;
    p[3].y = height * cpr.left;
  } else if (cpr.top && cpr.right) {
    p[1].x = width * cpr.top;
    p[2].y = height * cpr.right;
    p[3].x = width;
    p[4] = {x: 0, y: height};
  } else if (cpr.bottom && cpr.left) {
    p[3].x = width * cpr.bottom;
    p[4] = {x: 0, y:height * cpr.left};
  } else if (cpr.bottom && cpr.right) {
    p[2].y = height * cpr.right;
    p[3].x = width * cpr.bottom;
    p[4] = {x: 0, y: height};
  }

  if (!canvas1) {
    var canv = setupCanvas('ss');
    canvas1 = new fabric.Canvas('ssCanvas', {selection: false, preserveObjectStacking: !true});
    canvas1.setDimensions({width: width, height: height});
    canvas1.controlsAboveOverlay = true;
    canvas1.add(fimg);
  }

  canvas1.remove(polygon1);
  polygon1 = new fabric.Polygon(p, {
    left: 0,
    top: 0,
    fill: 'rgba(0,0,0,0)',
    objectCaching: false,
    transparentCorners: false,
    cornerColor: 'blue',
    selectable: false,
    evented: false
  });
  canvas1.clipPath = polygon1;
  canvas1.add(polygon1);
  canvas1.renderAll();

  if (!$('#ss').find('input').length) {
    $('<input>').addClass('rad-button static small dark flat').css({margin:'15px'}).attr('type', 'file').appendTo($('#ss')).change((e) => {
      filer(e)
        .then((imgSrc) => loadImage('ss2', imgSrc))
        .then(() => {
          var new_img = new Image();
          loadedImage.step1 = new_img;
          new_img.onload = () => drawCanvasRemain();
          new_img.src = canvas1.toDataURL({
            format: 'png',
            left: polygon1.left,
            top: polygon1.top,
            width: polygon1.getScaledWidth(),
            height: polygon1.getScaledHeight()
          });
        })
        .catch((msg) => alert(msg));
    }).appendTo($('#ss'));
  }
}

function drawCanvasRemain() {
  const cpr = getCrossPoint(clipline.aCoords, clipimg.aCoords);
  const base_size = 1000;
  const canv = setupCanvas('ss2');

  const fimg = createFabricImage(loadedImage.ss2, base_size);
  const { width, height } = setCanvasDimensions(fimg, canv);

  setupBackgroundCanvas(width, height);
  const polygon = createClippingPolygon(cpr, width, height);

  canvas2 = new fabric.Canvas('ss2Canvas', { selection: false, preserveObjectStacking: true });
  canvas2.clear();
  canvas2.setDimensions({ width, height });
  canvas2.add(polygon);
  canvas2.add(fimg);
  canvas2.clipPath = polygon;
  canvas2.renderAll();

  createCompositeButton();
}

function createFabricImage(image, baseSize) {
  const fimg = new fabric.Image(image);
  fimg.scaleToWidth(baseSize);
  fimg.setControlsVisibility({ ml: false, mr: false, mb: false, mt: false });
  return fimg;
}

function setCanvasDimensions(fimg, canv) {
  const width = fimg.getScaledWidth();
  const height = fimg.getScaledHeight();
  return { width, height };
}

function setupBackgroundCanvas(width, height) {
  $('<canvas>').attr('id', 'step2bg').prependTo($('#ss2'));
  const bgcanvas = new fabric.Canvas('step2bg', { selection: false, preserveObjectStacking: true });
  const bgimg = new fabric.Image(loadedImage.step1);
  bgcanvas.setDimensions({ width, height });
  bgcanvas.add(bgimg).renderAll();
  $('#step2bg').parent().css({ position: 'absolute' });
}

function createClippingPolygon(cpr, width, height) {
  const topleft = { x: 0, y: 0 };
  const topright = { x: width, y: 0 };
  const bottomright = { x: width, y: height };
  const bottomleft = { x: 0, y: height };
  const points = [topleft, topright, bottomright, bottomleft];

  // Adjust points based on cross points (cpr)
  if (cpr.top && cpr.bottom) {
    points[0].x = width * cpr.top;
    points[3].x = width * cpr.bottom;
  } else if (cpr.left && cpr.right) {
    points[0].y = height * cpr.left;
    points[1].y = height * cpr.right;
  }

  return new fabric.Polygon(points, {
    left: 0,
    top: 0,
    fill: 'rgba(0,0,0,0)',
    objectCaching: false,
    transparentCorners: false,
    cornerColor: 'blue',
    selectable: false,
    evented: false
  });
}

function createCompositeButton() {
  $('<button>')
    .html('Composite')
    .css({ margin: '15px' })
    .addClass('rad-button static small dark flat')
    .click(() => {
      try {
        const new_img = new Image();
        loadedImage.step2 = new_img;
        new_img.onload = () => drawCanvasComposite();
        new_img.src = canvas2.toDataURL({ format: 'png' });
      } catch (error) {
        console.error('Error creating composite button:', error);
        alert('ボタン処理中にエラーが発生しました: ' + error.message);
      }
    })
    .appendTo($('#ss2'));
}

function drawCanvasComposite() {
 var canv = setupCanvas('com');
 var fimg = new fabric.Image(loadedImage.step1);
 var fimg2 = new fabric.Image(loadedImage.step2);
 var canvas = new fabric.Canvas('comCanvas', {selection: false, preserveObjectStacking: !true});
 canvas.setDimensions({width:fimg2.getScaledWidth(), height:fimg2.getScaledHeight()});
 canvas.add(fimg).add(fimg2).renderAll();
}

function getCrossPoint(lineACoords, imgACoords) {
  var cp = {};
  var cpr = {};
  var pointA = [Math.floor(lineACoords.tl.x), Math.floor(lineACoords.tl.y)];
  var pointB = [Math.floor(lineACoords.bl.x), Math.floor(lineACoords.bl.y)];
  var imgSideList = [['tl','tr','top'], ['tr','br','right'], ['br','bl','bottom'], ['bl','tl','left']];
  for (var e of imgSideList) {
    var pointC = [Math.floor(imgACoords[e[0]].x), Math.floor(imgACoords[e[0]].y)];
    var pointD = [Math.floor(imgACoords[e[1]].x), Math.floor(imgACoords[e[1]].y)];
    var cross_point = _getCrossPoint(pointA, pointB, pointC, pointD);
    if (cross_point.length > 0) {
      if (e[2] == 'top' && (cross_point[0] < pointC[0] || cross_point[0] > pointD[0])) cross_point = [];
      if (e[2] == 'top' && (cross_point[1] < pointC[1] || cross_point[1] > pointD[1])) cross_point = [];
      if (e[2] == 'right' && (cross_point[0] < pointC[0] || cross_point[0] > pointD[0])) cross_point = [];
      if (e[2] == 'right' && (cross_point[1] < pointC[1] || cross_point[1] > pointD[1])) cross_point = [];
      if (e[2] == 'bottom' && (cross_point[0] < pointD[0] || cross_point[0] > pointC[0])) cross_point = [];
      if (e[2] == 'bottom' && (cross_point[1] < pointD[1] || cross_point[1] > pointC[1])) cross_point = [];
      if (e[2] == 'left' && (cross_point[0] < pointD[0] || cross_point[0] > pointC[0])) cross_point = [];
      if (e[2] == 'left' && (cross_point[1] < pointD[1] || cross_point[1] > pointC[1])) cross_point = [];
      if (cross_point.length && (e[2] == 'top' || e[2] == 'bottom')) cross_point[1] = pointC[1];
      if (cross_point.length && (e[2] == 'right' || e[2] == 'left')) cross_point[0] = pointC[0];
    }
    cp[e[2]] = cross_point;
    if (cross_point.length > 0) {
      if (e[2] == 'top') cpr[e[2]] = Math.floor((cross_point[0] - pointC[0]) / (pointD[0] - pointC[0]) * 100) / 100;
      if (e[2] == 'bottom') cpr[e[2]] = Math.floor((cross_point[0] - pointD[0]) / (pointC[0] - pointD[0]) * 100) / 100;
      if (e[2] == 'right') cpr[e[2]] = Math.floor((cross_point[1] - pointC[1]) / (pointD[1] - pointC[1]) * 100) / 100;
      if (e[2] == 'left') cpr[e[2]] = Math.floor((cross_point[1] - pointD[1]) / (pointC[1] - pointD[1]) * 100) / 100;
    }
  }
  return cpr;
}

function _getCrossPoint(pointA, pointB, pointC, pointD) {
  pointA = [Math.floor(pointA[0]),Math.floor(pointA[1])];
  pointB = [Math.floor(pointB[0]),Math.floor(pointB[1])];
  pointC = [Math.floor(pointC[0]),Math.floor(pointC[1])];
  pointD = [Math.floor(pointD[0]),Math.floor(pointD[1])];
  var cross_point = [];
  var bunbo = (pointB[0] - pointA[0]) * (pointD[1] - pointC[1]) - (pointB[1] - pointA[1]) * (pointD[0] - pointC[0]);

  if (bunbo == 0) return cross_point;

  var vectorAC = [(pointC[0] - pointA[0]), (pointC[1] - pointA[1])];
  var r = ((pointD[1] - pointC[1]) * vectorAC[0] - (pointD[0] - pointC[0]) * vectorAC[1]) / bunbo;
  var s = ((pointB[1] - pointA[1]) * vectorAC[0] - (pointB[0] - pointA[0]) * vectorAC[1]) / bunbo;

  var distance = [(pointB[0] - pointA[0]) * r, (pointB[1] - pointA[1]) * r];
  cross_point = [parseInt(pointA[0] + distance[0]), parseInt(pointA[1] + distance[1])];

  return cross_point;
}
