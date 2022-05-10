//    index.js: main page for world's best printer application
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

const express = require('express');
const router = express.Router();

const ipp = require('ipp');
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const PDFDocument = require('pdf-lib').PDFDocument;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../'))
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
        const page = pdfDoc.addPage([295, 452]);

        pdfDoc.embedPng(imgData).then((pngImage) => {
            page.drawImage(pngImage, {
                x: 0,
                y: 0,
                width: 295,
                height: 452,
            });
            pdfDoc.save().then((pdfBytes) => {
                printPdf(res, 'LabelWriter_4XL', pdfBytes);
            }).catch(error => {
                res.json({error: 'Save issue', fullMessage: error.toString()});
            });
        }).catch(error => {
            res.json({error: 'Embed image issue', fullMessage: error.toString()});
        });
    }).catch(error => {
        res.json({error: 'PDF issue', fullMessage: error.toString()});
    });
});

router.post('/print-pdf', upload.single('pdf-file'), function (req, res, next) {
    const pdfFile = req.file;
    const requestedPrinter = req.body['printer-name']; // DocuPrint_3055_A4_PDF or LabelWriter_4XL

    if (pdfFile) {
        const rawData = new Uint8Array(fs.readFileSync(path.join(__dirname, '../', 'download.pdf')));
        PDFDocument.load(rawData).then((pdfDoc) => {
            pdfDoc.save().then(pdfBytes => {
                printPdf(res, requestedPrinter, pdfBytes);
            }).catch(error => {
                res.json({error: 'Save issue', fullMessage: error.toString()});
            });
        }).catch(error => {
            res.json({error: 'Loading pdf issue', fullMessage: error.toString()});
        });
    } else {
        res.json({error: 'No file given'});
    }
});

/**
 * @param {Response<*, Record<string, *>>} res
 * @param {string|{max, type: string}} printerName
 * @param {Uint8Array} fileBytes
 */
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
        data: new Buffer.from(fileBytes)
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
