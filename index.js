#! /usr/bin/env node

var sphero = require("sphero");

var SPHERO_MAC_ADDR = process.argv[2];
if (!SPHERO_MAC_ADDR) {
  console.error('Usage:\nindex.js SPHERO_MAC_ADDR');
  process.exit(1);
}

function changeRedColorTill255 (color, timeout, callback) {
  if (color < 255) {
    bb8.color({ red: color, green: 0, blue: 0 }, function () {
      setTimeout(function () {
        changeRedColorTill255(color+2, timeout, callback);
      }, timeout);
    });
  } else {
    callback();
  }
}

function blush () {
  // TODO: Handle errors
  bb8.setStabilization(0, function (err, data) {
    // Para volver luego al color original
    bb8.getColor(function (err, oldColor) {
      
      bb8.setRawMotors({lmode: 0x02, lpower: 120, rmode: 0x02, rpower: 120});
      
      // Tras 3 segundos
      setTimeout(function () {
        bb8.setRawMotors({lmode: 0x03, rmode: 0x03});
        changeRedColorTill255(0, 100, function () {
          // After changing to RED
          
        });
      }, 150);
    });
  });
}

var bb8 = sphero(SPHERO_MAC_ADDR);

bb8.on("error", function (err, data) {
  console.error(err, data);
});

bb8.connect(function () {
  blush();
});
