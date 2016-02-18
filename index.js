#! /usr/bin/env node

var Promise = require("bluebird");
var sphero = require("sphero");

var SPHERO_MAC_ADDR = process.argv[2];
if (!SPHERO_MAC_ADDR) {
  console.error('Usage:\nindex.js SPHERO_MAC_ADDR');
  process.exit(1);
}

var bb8 = sphero(SPHERO_MAC_ADDR);

// Promisify spero functions
bb8.colorPromise = Promise.promisify(bb8.color);
bb8.getColorPromise = Promise.promisify(bb8.getColor);
bb8.setRawMotorsPromise = Promise.promisify(bb8.setRawMotors);
bb8.setStabilizationPromise = Promise.promisify(bb8.setStabilization);

function nock (color) {
  return bb8.colorPromise(color)
    .then(function () {
      return bb8.setRawMotorsPromise({lmode: 0x02, lpower: 80, rmode: 0x02, rpower: 80})
        .then(function () {
          return bb8.setRawMotorsPromise({lmode: 0x01, lpower: 80, rmode: 0x01, rpower: 80})
            .then(function () {
              return bb8.colorPromise('black')
                .then(function () {
                  // Stop motors
                  return bb8.setRawMotorsPromise({lmode: 0x00, rmode: 0x00});
                });
            }).delay(100); // Delay 100ms the Promise resolution 
        }).delay(100); 
    });
}

function yes () {
  return bb8.getColorPromise()
    .then(function (originalColor) {
      // Nock tree times with green color
      return nock('green')
        .then(function () {
          return nock('green');
        })
        .then(function () {
          return nock('green');
        })
        .then(function () {
          // Stabilize and set back original color
          return bb8.setStabilizationPromise(1)
            .then(function () {
              return bb8.colorPromise(originalColor);
            });
        });
    });
}

bb8.connect(function () {
  // Set blue color to check if its set back
  bb8.colorPromise('blue')
    .delay(200) // Wait 200ms before the party starts
    .then(yes)
    .catch(function (err) {
      // Stabilize in case it throws an error
      console.error(err);
      return bb8.setStabilizationPromise(1);
    });
});
