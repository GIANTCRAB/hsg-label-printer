var express = require('express');
var router = express.Router();

const ipp = require('ipp');
const fs = require("fs");
const jspdf = require("jspdf");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/print', function (req, res, next) {
    const endpoint = 'http://localhost:631/printers/LabelWriter_4XL';
    const printer = ipp.Printer(endpoint);

    const imgData = req.body['input-data'];

    const pdf = new jspdf.jsPDF();

    pdf.addImage({imageData: imgData, x: 0, y: 0, width: 104, height: 159});
    pdf.save("download.pdf");


    fs.readFile("download.pdf", function (err, data) {
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
});


module.exports = router;
