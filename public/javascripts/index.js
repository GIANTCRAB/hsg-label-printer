let httpRequest;

const pictureToCanvas = document.getElementById("pictureToCanvas");
const canvas = document.getElementById("myCanvas");
const textInput = document.getElementById("textInput");

pictureToCanvas.onchange = function (event) {
    const fileList = pictureToCanvas.files;
    const file = fileList[0];
    const fr = new FileReader();
    fr.onload = createImage;   // onload fires after reading is complete
    fr.readAsDataURL(file);

    function createImage() {
        const img = new Image();
        img.onload = imageLoaded;
        img.src = fr.result;

        function imageLoaded() {
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, 800, 1200);
        }
    }
}

document.getElementById("updateText")
    .addEventListener("click", function () {
        const ctx = canvas.getContext("2d");
        const inputTextData = textInput.value;
        const inputTextArray = inputTextData.split("\n");

        ctx.font = "40px serif";

        let yPosition = 70;
        for (let text of inputTextArray) {
            ctx.fillText(text, 5, yPosition);
            yPosition += 50;
        }
    });


document.getElementById("submitImage")
    .addEventListener("click", function () {
        const imgData = canvas.toDataURL("image/png", 1.0);

        if (window.XMLHttpRequest) {
            httpRequest = new XMLHttpRequest();

            httpRequest.onreadystatechange = alertContents;
            httpRequest.open('POST', '/print', true);
            httpRequest.setRequestHeader('Content-Type', 'application/json');
            httpRequest.setRequestHeader('Accept', 'application/json');
            httpRequest.send(JSON.stringify({"input-data": imgData.toString()}));
        }
    }, false);

function alertContents() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            alert(httpRequest.responseText);
        } else {
            alert('There was a problem with the request.');
        }
    }
}
