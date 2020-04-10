export default class Queue {
  constructor() {
    this._queue = {
      playing: 0,
      next: false,
      elements: [],
    }
  }

  add(element) {
    this._queue.elements.push(element)
  }

  getFirst() {
    return this._queue.elements[0]
  }

  getLength() {
    return this._queue.elements.length
  }

  goNext() {
    let nextIndex = 0

    if (this.getQueue().length > 1) {
      nextIndex = this.getPlaying() + 1
    }

    console.log(this.getPlaying(), nextIndex, this.getLength())

    this.setPlaying(nextIndex)

    return this._queue.elements[nextIndex]
  }

  isFirst() {
    return this._queue.elements.length === 1
  }

  setPlaying(index) {
    this._queue.playing = index
  }

  getPlaying() {
    return this._queue.playing
  }

  setQueue(queue) {
    this._queue.elements = queue
  }

  getQueue() {
    return this._queue.elements
  }

  remove(index) {
    this._queue.elements = this._queue.elements.filter(
      (_element, elementIndex) => elementIndex !== index
    )
  }
}
