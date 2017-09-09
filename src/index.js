'use strict';

const aframe = require('aframe');
require('aframe-template-component');

aframe.registerPrimitive('a-stage', require('./primitives/a-stage'));
aframe.registerComponent('stagehand', require('./components/stagehand'));
