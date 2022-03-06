var express = require('express');
var router = express.Router();

const ipp = require('ipp');
const fs = require("fs");
const jspdf = require("jspdf");
const multer = require("multer");
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

    const pdf = new jspdf.jsPDF();

    pdf.addImage({imageData: imgData, x: 0, y: 0, width: 104, height: 159});
    pdf.save("download.pdf");

    printPdf(res);
});

router.post('/print-pdf', upload.single('pdf-file'), function (req, res, next) {
    const pdfFile = req.file;
    const requestedPrinter = req.body['printer-name']; // DocuPrint_3055_A4_PDF or LabelWriter_4XL

    if (pdfFile) {
        printPdf(res, requestedPrinter);
    } else {
        res.json({error: 'No file given'});
    }
});

function printPdf(res, printerName = 'LabelWriter_4XL', filename = 'download.pdf') {
    const endpoint = 'http://localhost:631/printers/' + printerName;
    const printer = ipp.Printer(endpoint);

    fs.readFile(filename, function (err, data) {
        const msg = {
            "operation-attributes-tag": {
                "requesting-user-name": "woohuiren",
                "document-format": "application/pdf"
            },
            "job-attributes-tag": {
                "sides": "one-sided",
            },
            data: data
        };

        printer.execute("Print-Job", msg, function (err, printerRes) {
            if (err) {
                res.json({error: err});
            } else {
                res.json({message: printerRes});
            }
        });
    });
}

module.exports = router;
