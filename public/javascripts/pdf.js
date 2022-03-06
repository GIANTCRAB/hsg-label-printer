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
