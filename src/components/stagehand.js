'use strict';

const B = require('bluebird');

module.exports = {
  schema: {
    addAssets: { type: 'string', default: '' },
    cue: { type: 'string', default: '' },
    removeAssets: { type: 'string', default: '' },
    stageData: { type: 'string', default: '' },
    stageInsert: { type: 'string', default: 'beforeend' },
    stageType: { type: 'string', default: '' },
    stageSelector: { type: 'string', default: 'a-stage' },
    stageSrc: { type: 'string', default: '' }
  },

  init() {
    const addExists = this.data.addAssets.length > 0;
    const cueExists = this.data.cue.length > 0;
    const removeExists = this.data.removeAssets.length > 0;
    const stageExists = this.data.stageSrc.length > 0;

    this.doNothing = !cueExists || (!addExists && !removeExists && !stageExists);

    if (this.doNothing) { return; }

    const emit = (event) => {
      this.el.emit(event);

      return B.resolve();
    };

    let add = () => B.resolve('addedAssets');

    let remove = () => B.resolve('removedAssets');

    let stage = () => B.resolve('stageLoaded');

    if (addExists) {
      add = () => B.resolve('addedAssets');
    }

    if (removeExists) {
      const assets = document.querySelector('a-assets');
      const removeAsset = (asset) => assets.removeChild(asset);

      let assetList = null;

      if (this.data.removeAssets === 'all') {
        assetList = assets.querySelectorAll('*');
      } else {
        assetList = JSON.parse(this.data.removeAssets);
      }

      remove = () => B.join('removedAssets', B.map(assetList, removeAsset, { concurrency: 3 }));
    }

    if (stageExists) {
      const stageElement = document.querySelector(this.data.stageSelector);

      stage = () => {
        stageElement.setAttribute('template', {
          data: this.data.stageData,
          insert: this.data.stageInsert,
          type: this.data.stageType,
          src: this.data.stageSrc
        });

        return B.resolve('stageLoaded');
      };
    }

    this.eventHandler = () => add().then(emit).then(stage).then(emit).then(remove).spread(emit);

    this.el.addEventListener(this.data.cue, this.eventHandler);
  },

  remove() {
    if (this.doNothing) { return; }

    this.el.removeEventListener(this.data.cue, this.eventHandler);
  }
};
