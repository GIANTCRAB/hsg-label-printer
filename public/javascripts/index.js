//    index.js: sends the canvas and text to /print
//    Copyright (C) 2022 Woo Huiren
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as published
//    by the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with this program.  If not, see <https://www.gnu.org/licenses/>.

document.addEventListener("DOMContentLoaded", function () {
    let httpRequest;

    const pictureToCanvas = document.getElementById("pictureToCanvas");
    const canvas = document.getElementById("myCanvas");
    const textInput = document.getElementById("textInput");

    pictureToCanvas.addEventListener("change", function () {
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
    });

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
});
