export default class Queue {
  constructor() {
    this._queue = []
  }

  add(element) {
    this._queue.push(element)
  }

  getFirst() {
    return this._queue[0]
  }

  getLength() {
    return this._queue.length
  }

  getNext() {
    return this._queue[1]
  }

  isFirst() {
    return this._queue.length === 1
  }

  index() {
    return this._queue
  }

  remove(index) {
    this._queue = this._queue.filter(
      (_element, elementIndex) => elementIndex !== index
    )
  }
}
