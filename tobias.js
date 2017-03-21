export class Tobias {
  constructor() {
    this.subscribers = []
  }
  listen (regex, callback) {
    this.subscribers.push({
      type: 'listen',
      regex: regex, 
      callback: callback
    })
  }
  speak (regex, callback) {
    this.subscribers.push({
      type: 'speak',
      regex: regex, 
      callback: callback
    })  
  }
}