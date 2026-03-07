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
    const pictureToCanvas = document.getElementById("pictureToCanvas");
    const canvas = document.getElementById("myCanvas");
    const textInput = document.getElementById("textInput");
    const dropZone = document.getElementById("imageDropZone");
    const filePreview = document.getElementById("imageFilePreview");
    const filePreviewName = filePreview.querySelector(".file-preview-name");
    const filePreviewRemove = filePreview.querySelector(".file-preview-remove");
    const submitBtn = document.getElementById("submitImage");
    const clearBtn = document.getElementById("clearCanvas");

    /* ── Toast helper ────────────────────────────────── */
    function showToast(type, title, message) {
        const container = document.getElementById("toastContainer");
        const iconMap = {
            success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
            warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        };

        const toast = document.createElement("div");
        toast.className = "toast toast-" + type;
        toast.innerHTML =
            '<div class="toast-icon">' + iconMap[type] + '</div>' +
            '<div class="toast-body"><div class="toast-title">' + title + '</div><div class="toast-message">' + message + '</div></div>' +
            '<button class="toast-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';

        toast.querySelector(".toast-close").addEventListener("click", function () { removeToast(toast); });
        container.appendChild(toast);
        setTimeout(function () { removeToast(toast); }, 5000);
    }

    function removeToast(el) {
        if (el.classList.contains("removing")) return;
        el.classList.add("removing");
        el.addEventListener("animationend", function () { el.remove(); });
    }

    /* ── Drag & drop for image ───────────────────────── */
    ["dragenter", "dragover"].forEach(function (evt) {
        dropZone.addEventListener(evt, function (e) {
            e.preventDefault();
            dropZone.classList.add("drag-over");
        });
    });

    ["dragleave", "drop"].forEach(function (evt) {
        dropZone.addEventListener(evt, function (e) {
            e.preventDefault();
            dropZone.classList.remove("drag-over");
        });
    });

    dropZone.addEventListener("drop", function (e) {
        var files = e.dataTransfer.files;
        if (files.length) {
            pictureToCanvas.files = files;
            loadImageFile(files[0]);
        }
    });

    /* ── File input change ───────────────────────────── */
    pictureToCanvas.addEventListener("change", function () {
        var file = pictureToCanvas.files[0];
        if (file) loadImageFile(file);
    });

    function loadImageFile(file) {
        filePreviewName.textContent = file.name;
        filePreview.classList.add("visible");

        var fr = new FileReader();
        fr.onload = function () {
            var img = new Image();
            img.onload = function () {
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, 800, 1200);
                canvas.classList.add("has-content");
            };
            img.src = fr.result;
        };
        fr.readAsDataURL(file);
    }

    filePreviewRemove.addEventListener("click", function () {
        pictureToCanvas.value = "";
        filePreview.classList.remove("visible");
    });

    /* ── Clear canvas ────────────────────────────────── */
    clearBtn.addEventListener("click", function () {
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.classList.remove("has-content");
        pictureToCanvas.value = "";
        filePreview.classList.remove("visible");
        textInput.value = "";
        showToast("info", "Cleared", "Canvas has been reset.");
    });

    /* ── Update text on canvas ───────────────────────── */
    document.getElementById("updateText").addEventListener("click", function () {
        var ctx = canvas.getContext("2d");
        var inputTextData = textInput.value;
        var inputTextArray = inputTextData.split("\n");

        ctx.font = "40px serif";
        var yPosition = 70;
        for (var i = 0; i < inputTextArray.length; i++) {
            ctx.fillText(inputTextArray[i], 5, yPosition);
            yPosition += 50;
        }
        canvas.classList.add("has-content");
        showToast("success", "Text Added", "Text has been rendered on the label canvas.");
    });

    /* ── Submit to print ─────────────────────────────── */
    submitBtn.addEventListener("click", function () {
        var imgData = canvas.toDataURL("image/png", 1.0);

        var btnLabel = submitBtn.querySelector(".btn-label");
        var originalText = btnLabel.textContent;
        btnLabel.textContent = "Printing…";
        submitBtn.disabled = true;

        var spinner = document.createElement("span");
        spinner.className = "spinner";
        submitBtn.insertBefore(spinner, submitBtn.firstChild);

        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                // restore button
                btnLabel.textContent = originalText;
                submitBtn.disabled = false;
                if (spinner.parentNode) spinner.remove();

                if (httpRequest.status === 200) {
                    try {
                        var response = JSON.parse(httpRequest.responseText);
                        if (response.error) {
                            showToast("error", "Print Failed", response.error + (response.fullMessage ? ": " + response.fullMessage : ""));
                        } else {
                            showToast("success", "Print Job Sent", "Your label has been sent to the printer.");
                        }
                    } catch (e) {
                        showToast("success", "Print Job Sent", "The print job has been dispatched.");
                    }
                } else {
                    showToast("error", "Request Failed", "Error code: " + httpRequest.status);
                }
            }
        };
        httpRequest.open("POST", "/print", true);
        httpRequest.setRequestHeader("Content-Type", "application/json");
        httpRequest.setRequestHeader("Accept", "application/json");
        httpRequest.send(JSON.stringify({"input-data": imgData.toString()}));
    });
});
