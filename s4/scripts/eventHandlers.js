function init() {
  $('.choose').on('change', loadLocalImage);
}

function downloadCanvasImage(event, canvas) {
  const name = prompt('ダウンロード時のファイル名', 'composite.png');
  if (name) {
    let link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = name;
    link.click();
  }
}

function loadLocalImage(e) {
  return filer(e).then((imgSrc) => composite(imgSrc))
    .catch((msg) => alert(msg));
}