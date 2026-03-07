//    pdf.js: sends the PDF file that is submitted to /print-pdf
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
    var pdfUpload = document.getElementById("pdfUpload");
    var dropZone = document.getElementById("pdfDropZone");
    var filePreview = document.getElementById("pdfFilePreview");
    var filePreviewName = filePreview.querySelector(".file-preview-name");
    var filePreviewRemove = filePreview.querySelector(".file-preview-remove");
    var submitBtn = document.getElementById("submitPdf");
    var printerOptions = document.querySelectorAll(".printer-option");

    /* ── Toast helper ────────────────────────────────── */
    function showToast(type, title, message) {
        var container = document.getElementById("toastContainer");
        var iconMap = {
            success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
            warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        };

        var toast = document.createElement("div");
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

    /* ── Printer radio card selection ────────────────── */
    printerOptions.forEach(function (option) {
        var radio = option.querySelector('input[type="radio"]');
        radio.addEventListener("change", function () {
            printerOptions.forEach(function (o) { o.classList.remove("selected"); });
            option.classList.add("selected");
        });
    });

    /* ── Drag & drop for PDF ─────────────────────────── */
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
            pdfUpload.files = files;
            showFilePreview(files[0]);
        }
    });

    pdfUpload.addEventListener("change", function () {
        var file = pdfUpload.files[0];
        if (file) showFilePreview(file);
    });

    function showFilePreview(file) {
        filePreviewName.textContent = file.name;
        filePreview.classList.add("visible");
    }

    filePreviewRemove.addEventListener("click", function () {
        pdfUpload.value = "";
        filePreview.classList.remove("visible");
    });

    /* ── Submit to print ─────────────────────────────── */
    submitBtn.addEventListener("click", function () {
        var file = pdfUpload.files[0];
        var selectedRadio = document.querySelector('input[name="printer-name"]:checked');
        var requestedPrinter = selectedRadio ? selectedRadio.value : "";

        if (!file) {
            showToast("warning", "No File", "Please upload a PDF file first.");
            return;
        }

        var btnLabel = submitBtn.querySelector(".btn-label");
        var originalText = btnLabel.textContent;
        btnLabel.textContent = "Printing…";
        submitBtn.disabled = true;

        var spinner = document.createElement("span");
        spinner.className = "spinner";
        submitBtn.insertBefore(spinner, submitBtn.firstChild);

        var formData = new FormData();
        formData.append("pdf-file", file);
        formData.append("printer-name", requestedPrinter);

        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                btnLabel.textContent = originalText;
                submitBtn.disabled = false;
                if (spinner.parentNode) spinner.remove();

                if (httpRequest.status === 200) {
                    try {
                        var response = JSON.parse(httpRequest.responseText);
                        if (response.error) {
                            showToast("error", "Print Failed", typeof response.error === "string" ? response.error : JSON.stringify(response.error));
                        } else {
                            showToast("success", "Print Job Sent", "Your PDF has been sent to the printer.");
                        }
                    } catch (e) {
                        showToast("success", "Print Job Sent", "The print job has been dispatched.");
                    }
                } else {
                    showToast("error", "Request Failed", "Error code: " + httpRequest.status);
                }
            }
        };
        httpRequest.open("POST", "/print-pdf", true);
        httpRequest.setRequestHeader("Accept", "application/json");
        httpRequest.send(formData);
    });
});
