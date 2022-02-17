/* QRコードの読み取り結果をresolveするPromiseを返す */
function qrParse(video, canvasSize) {
    console.log("qrParse: start...");
    /* キャンバスを作成する */
    let canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    console.log("qrParse: canvas=" + canvas);
    const render = canvas.getContext("2d");
    console.log("qrParse: render=" + render);

    return new Promise((resolve) => {
        /* 100ms毎にカメラ画像のスナップショットを作成してQRコードの読み取りを試行するループを開始する */
        const loop = setInterval(() => {
            /* カメラ画像から非表示キャンバスにスナップショットを描画する */
            render.drawImage(video, 0, 0, canvas.width, canvas.height);
            /* 非表示キャンバスのスナップショットからQRコードの読み取りを試行する */
            const img = render.getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(img.data, img.width, img.height);
            console.log("loop: canvas.width=" + canvas.width + " canvas.height=" + canvas.height + " result=" + result);
            if (result) {
                if (result.data) {
                    /* QRコードの読み取りに成功した場合 */
                    /* ループを止める */
                    clearInterval(loop);
                    /* QRコード読み取り結果をresolveする */
                    resolve(result.data);
                }
            }
        }, 100);
    });
}

/* カメラからQRコードを読み取る */
async function qrReadByCamera(videoId, outputId, mode, canvasSize) {
    /* カメラを準備する */
    const video = document.getElementById(videoId);
    const options = {
        audio: false,
        video: {
            facingMode: mode,
            width: { min: 0, max: video.clientWidth },
            height: { min: 0, max: video.clientHeight },
            aspectRatio: video.clientWidth / video.clientHeight
        }
    };
    if (video.srcObject) {
        video.srcObject.getVideoTracks().forEach(function (camera) { camera.stop(); });
    }
    video.srcObject = await navigator.mediaDevices.getUserMedia(options);
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    /* QRコードの読み取りを待って結果を表示する */
    console.log("qrReadByCamera: call qrParse...");
    const qrdata = await qrParse(video, canvasSize);
    $('#' + outputId).val(qrdata).trigger('change');
}