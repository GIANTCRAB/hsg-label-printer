const express = require('express');
const router = express.Router();

const ipp = require('ipp');
const fs = require("fs");
const multer = require("multer");
const PDFDocument = require('pdf-lib').PDFDocument;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './')
    },
    filename: function (req, file, cb) {
        cb(null, 'download.pdf')
    },
});
const upload = multer({storage: storage});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/print-pdf', function (req, res, next) {
    res.render('pdf');
});

router.post('/print', function (req, res, next) {
    const imgData = req.body['input-data'];

    PDFDocument.create().then((pdfDoc) => {
        const page = pdfDoc.addPage();

        pdfDoc.embedPng(imgData).then((pngImage) => {
            page.drawImage(pngImage, {
                x: 0,
                y: 0,
                width: 104,
                height: 159,
            });
            pdfDoc.save().then((pdfBytes) => {
                printPdf(res, 'LabelWriter_4XL', pdfBytes);
            });
        });
    });
});

router.post('/print-pdf', upload.single('pdf-file'), function (req, res, next) {
    const pdfFile = req.file;
    const requestedPrinter = req.body['printer-name']; // DocuPrint_3055_A4_PDF or LabelWriter_4XL

    if (pdfFile) {
        const rawData = new Uint8Array(fs.readFileSync('download.pdf'));

        PDFDocument.create().then((pdfDoc) => {
            pdfDoc.embedPdf(rawData).then(() => {
                pdfDoc.save().then(pdfBytes => {
                    printPdf(res, requestedPrinter, pdfBytes);
                });
            });
        });
    } else {
        res.json({error: 'No file given'});
    }
});

function printPdf(res, printerName, fileBytes) {
    const endpoint = 'http://localhost:631/printers/' + printerName;
    const printer = ipp.Printer(endpoint, {});

    const msg = {
        "operation-attributes-tag": {
            "requesting-user-name": "woohuiren",
            "document-format": "application/pdf"
        },
        "job-attributes-tag": {
            "sides": "one-sided"
        },
        data: fileBytes
    };

    printer.execute("Print-Job", msg, function (err, printerRes) {
        if (err) {
            res.json({error: err});
        } else {
            res.json({message: printerRes});
        }
    });
}

module.exports = router;
