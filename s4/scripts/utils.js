// 汎用的なユーティリティ関数を定義

/**
 * 交点を計算する関数
 */
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

export { getCrossPoint };