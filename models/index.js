'use strict';

class Index {
  constructor(title, content) {
    this.title = title;
    this.content = content;
  }
  get json() {
    return JSON.stringify({title: this.title, content: this.content});
  }
}

module.exports = {
  Index
};
