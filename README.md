<h1 align="center">Welcome to batari-basic 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/haroldo-ok/batari-basic-js#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/haroldo-ok/batari-basic-js/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/haroldo-ok/batari-basic-js/blob/master/LICENSE" target="_blank">
    <img alt="License: GPL--3.0" src="https://img.shields.io/github/license/haroldo-ok/batari-basic" />
  </a>
  <a href="https://twitter.com/Haroldo0k" target="_blank">
    <img alt="Twitter: Haroldo0k" src="https://img.shields.io/twitter/follow/Haroldo0k.svg?style=social" />
  </a>
</p>

> Compiles Batari Basic source files from a JS environment.

### 🏠 [Homepage](https://github.com/haroldo-ok/batari-basic-js#readme)

## Install

```sh
npm install batari-basic
```

## Usage

``` javascript
const bBasic = require('batari-basic');
const fs = require('fs');

const HELLO_WORLD = `
 rem Hello World

 playfield:
................................
......X.X.XXX.X...X...XXX.......
......X.X.X...X...X...X.X.......
......XXX.XX..X...X...X.X.......
......X.X.X...X...X...X.X.......
......X.X.XXX.XXX.XXX.XXX.......
................................
.....X...X.XXX.XX..X...XX.......
.....X...X.X.X.X.X.X...X.X......
.....X.X.X.X.X.XX..X...X.X......
.....XX.XX.XXX.X.X.XXX.XX.......
end

 COLUPF = 22
 COLUBK = 2

mainloop
 drawscreen
 score = score + 1
 goto mainloop
`;

const binaries = bBasic(HELLO_WORLD);
fs.writeFileSync('example.bin', Buffer.from(binaries.output));
```

The  `bBasic(code)` function receives, as a parameter, a string containing the source code to compile, and returns an object three keys:

* `output` is the compiled Atari 2600 ROM, as a `Uint8Array` containing its bytes.
* `listings` is an string containing the generated ASM listings;
* `symbolmap` is an string mapping addresses to symbols, often used by debugging emulators.

## Run tests

```sh
npm run test
```

## Author

👤 **Haroldo O. Pinheiro**

* Website: http://www.haroldo-ok.com/
* Twitter: [@Haroldo0k](https://twitter.com/Haroldo0k)
* Github: [@haroldo-ok](https://github.com/haroldo-ok)
* LinkedIn: [@haroldo-ok](https://linkedin.com/in/haroldo-ok)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/haroldo-ok/batari-basic-js/issues). You can also take a look at the [contributing guide](https://github.com/haroldo-ok/batari-basic-js/blob/master/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [Haroldo O. Pinheiro](https://github.com/haroldo-ok).<br />
This project is [GPL--3.0](https://github.com/haroldo-ok/batari-basic-js/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_