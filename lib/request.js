function Request(url) {
  this.url = url;
  this.transport = new XMLHttpRequest();
  this.transport.onreadystatechange = this.checkState.bind(this);
}

Request.prototype = {
  execute: function() {
    this.transport.open('GET', this.url, true);
    this.transport.send();
  },
  checkState: function() {
    if(this.transport.readyState == 4) {
      this.onCompletion(this.transport.responseText);
    }
  }
};
