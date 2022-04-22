# HSG Label Printer

## Label printer
You need the drivers!

* `sudo apt-get install dymo-cups-drivers`
* configure printer:
* Select from Database
* -> DYMO
* ---> LabelWriter 4XL

## Xerox Printer

* `sudo apt-get install printer-driver-fujixerox`

## Epson printer

* `sudo apt-get install printer-driver-escpr`

## How it works
HTML canvas -> ExpressJS -> converts image url to pdf -> print!

## Usage

```
npm install
npm start
```

now server runs on port 3000

## License

This software is licensed under AGPLv3. More details can be found in the [LICENSE file](LICENSE.md).
