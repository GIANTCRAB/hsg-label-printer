# HSG Printer

## Configuration
Get the necessary drivers for the listed printers. Thereafter, set up the printers in CUPs. 

You can configure where this web service runs using `.env`. A sample env file has been provided in `.env.sample`. Copy it as `.env`.

A handy systemd file `node-printer.service` has also been provided. You can copy it into systemd services using `sudo cp node-printer.service /etc/systemd/system/`. 

## DYMO Label printer

* `sudo apt-get install dymo-cups-drivers`

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

By default, the server runs on port 3000. If configured, the port will run as stated in `.env`.

## Contributors

* [GIANTCRAB](https://github.com/GIANTCRAB)
* [icedwater](https://github.com/icedwater) 

## License

This software is licensed under AGPLv3. More details can be found in the [LICENSE file](LICENSE.md).
