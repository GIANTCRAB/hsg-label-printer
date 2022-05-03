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

document.getElementById("submitPdf")
    .addEventListener("click", function () {
        const file = document.getElementById("pdfUpload").files[0];
        const printerOptions = document.getElementById("printerName");
        const requestedPrinter = printerOptions.options[printerOptions.selectedIndex].value;
        if (window.XMLHttpRequest && file) {

            httpRequest = new XMLHttpRequest();

            httpRequest.onreadystatechange = alertContents;
            httpRequest.open('POST', '/print-pdf', true);
            httpRequest.setRequestHeader('Accept', 'application/json');
            const formData = new FormData();
            formData.append("pdf-file", file);
            formData.append("printer-name", requestedPrinter);
            httpRequest.send(formData);
        }
    });


function alertContents() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            alert(httpRequest.responseText);
        } else {
            alert('There was a problem with the request.');
        }
    }
}
