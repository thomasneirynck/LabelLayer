const STATUS = {
  NOT_INITIALIZED: 0,
  ON_SCREEN: 1,
  OFF_SCREEN: 2
};


class LinkedListNode {
  constructor() {
    this._nextNode = null;
  }
  setNextNode(linkedListNode) {
    this._nextNode = linkedListNode;
  }
  getNextNode() {
    return this._nextNode;
  }
}

const DEFAULT_POSITIONS = [
  //corners
  {
    shiftX: -0,
    shiftY: -1,
    offsetX: 0,
    offsetY: 0
  },
  {
    shiftX: -1,
    shiftY: -1,
    offsetX: 0,
    offsetY: 0
  },
  {
    shiftX: -0,
    shiftY: -0,
    offsetX: 0,
    offsetY: 0
  },
  {
    shiftX: -1,
    shiftY: -0,
    offsetX: 0,
    offsetY: 0
  },
  //cardinals

  {
    shiftX: -0.5,
    shiftY: -1,
    offsetX: 0,
    offsetY: 0
  },
  {
    shiftX: -0.5,
    shiftY: 0,
    offsetX: 0,
    offsetY: 0
  },
  {
    shiftX: -1,
    shiftY: -0.5,
    offsetX: 0,
    offsetY: 0
  },
  {
    shiftX: 0,
    shiftY: -0.5,
    offsetX: 0,
    offsetY: 0
  }
];
class MultiAnchorGenerator {
  constructor(x, y, positions) {
    this._curI = 1;
    this._counterId = 0;
    this._positions = positions || DEFAULT_POSITIONS;
    this._x = x;
    this._y = y;
  }
  makeAnchor() {
    return new Anchor(this._x, this._y);
  }
  getX() {
    return this._x;
  }
  getY() {
    return this._y;
  }
  reset() {
    this._curI = Math.max(this._curI - 1, 0);
    this._counterId = 0;
  }
  hasNext() {
    return (this._counterId < this._positions.length);
  }
  next(anchor) {
    const params = this._positions[this._curI];
    anchor.setParams(params.shiftX, params.shiftY, params.offsetX, params.offsetY, this._curI);
    this._curI = (this._curI + 1) % this._positions.length;
    this._counterId++;
  }
  getAnchorId() {
    return this._curI;
  }
}


class DivPool {
  constructor() {
    this._divs = [];
  }
  getDiv() {
    if (this._divs.length > 0) {
      return this._divs.pop();
    }
    const div = document.createElement('div');
    div.style.position = 'absolute';
    return div;
  }
  returnDiv(div) {
    if (this._divs.length < 1000) {
      this._divs.push(div);
    }
  }
}

class Anchor {
  constructor(x, y) {
    //default is centered position
    this._shiftX = -0.5;
    this._shiftY = -0.5;
    this._offsetX = 0;
    this._offsetY = 0;
    this._anchorId = 0;
    this._x = x;
    this._y = y;
  }

  setParams(sx, sy, ox, oy, anchorId) {
    this._shiftX = sx;
    this._shiftY = sy;
    this._offsetX = ox;
    this._offsetY = oy;
    this._anchorId = anchorId;
  }

  setXY(x, y) {
    if (this._x === x || this._y === y) {
      return false;
    }
    this._x = x;
    this._y = y;
    return true;
  }

  getX() {
    return this._x;
  }

  getY() {
    return this._y;
  }

  getLeft(width) {
    return this._x + width * this._shiftX + this._offsetX;
  }

  getTop(height) {
    return this._y + height * this._shiftY + this._offsetY;
  }
}


class Label extends LinkedListNode {

  constructor(labelLayer, htmlContents, anchorGenerator) {

    super();

    //todo :this doesn't work the way it is supposed to
    this._anchorGenerator = anchorGenerator;
    this._anchor = this._anchorGenerator.makeAnchor();


    this._contents = htmlContents;
    this._labelLayer = labelLayer;
    this._width = -1;
    this._height = -1;
    this._measured = false;
    this._priority = 0;
    this._i = -1;
    this._shouldRemove = false;

    this._domDiv = null;


    this._tmpLabelComp = null;
  }
  removeDomDivReference() {
    const div = this._domDiv;
    this._domDiv = null;
    return div;
  }

  getDOMDiv() {
    return this._domDiv;
  }

  setPriority(priority) {
    return this._priority = priority;
  }

  //the lower the priority nr, the earlier it should be placed
  getPriority() {
    return this._priority;
  }

  setStatus(status) {
    this._status = status;
  }

  getStatus() {
    return this._status;
  }

  getX() {
    return this._anchor.getX();
  }

  getY() {
    return this._anchor.getY();
  }


  clearLastCompLabel() {
    this._lastCompLabel = null;
  }

  intersects(label) {
    const aid = label.getAnchorId();
    if (
    label === this._lastCompLabel &&
    aid === this._lastAnchorId
    ) {
      return this._lastIntersection;
    }
    this._lastCompLabel = label;
    this._lastAnchorId = aid;
    if (
    this.getViewX() + this._width < label.getViewX() ||
    label.getViewX() + label.getWidth() < this.getViewX() ||
    this.getViewY() + this._height < label.getViewY() ||
    label.getViewY() + label.getHeight() < this.getViewY()
    ) {
      this._lastIntersection = false;
      return false;
    }

    this._lastIntersection = true;
    return true;
  }

  getViewX() {
    return this._anchor.getLeft(this._width);
  }

  getViewY() {
    return this._anchor.getTop(this._height);
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  setDomDiv(div) {
    div.innerHTML = this._contents;
    this._domDiv = div;
  }

  dirtyPosition(newX, newY) {
    this._isDirtyPosition = this._anchor.setXY(newX, newY);
  }

  isDirty() {
    return this._isDirtyPosition;
  }

  unDirtyPosition() {
    this._isDirtyPosition = false;
  }

  measure(measureDiv) {
    if (!this._measured) {
      measureDiv.innerHTML = this._contents;
      this._width = measureDiv.offsetWidth;
      this._height = measureDiv.offsetHeight;
      measureDiv.innerHTML = '';
      this._measured = true;
      this._cells = this._labelLayer._createCellsForLabel(this._width, this._height, this);
    }
  }

  getCell() {
    this._i++;
    if (this._i >= this._cells.length) {
      throw new Error('this should never happen');
    }
    return this._cells[this._i];
  }

  unhookAllCells() {
    //unhook all the cells (if any
    this._i = -1;
    if (!this._cells) {
      return;
    }

    for (let i = 0; i < this._cells.length; i++) {
      const cellToRemove = this._cells[i];
      const previousCell = cellToRemove.getPreviousNodeDLL();
      const nextCell = cellToRemove.getNextNodeDLL();
      cellToRemove.setPreviousNodeDLL(null);
      cellToRemove.setNextNodeDLL(null);
      if (previousCell) {
        previousCell.setNextNodeDLL(nextCell);
      }
      if (nextCell) {
        nextCell.setPreviousNodeDLL(previousCell);
      }
    }
  }
  setShouldRemove(remove) {
    this._shouldRemove = remove;
  }

  getShouldRemove() {
    return this._shouldRemove;
  }


  resetAnchor() {
    this._anchorGenerator.reset(this._anchor);
  }


  hasNextAnchor() {
    return this._anchorGenerator.hasNext();
  }

  nextAnchor() {
    this._anchorGenerator.next(this._anchor);
    this._isDirtyPosition = true;
  }

  getAnchorId() {
    return this._anchor._anchorId;
  }
}

class DoublyLinkedListNode {
  constructor() {
    this._nextNodeDLL = null;
    this._previousNodeDLL = null;
  }

  setNextNodeDLL(cell) {
    this._nextNodeDLL = cell;
  }

  getNextNodeDLL() {
    return this._nextNodeDLL;
  }

  setPreviousNodeDLL(cell) {
    this._previousNodeDLL = cell;
  }

  getPreviousNodeDLL() {
    return this._previousNodeDLL;
  }
}


class Cell extends DoublyLinkedListNode {
  constructor(label) {
    super();
    this._label = label;
  }

  getLabel() {
    return this._label;
  }
}

class Grid {


  constructor(width, height) {
    this._width = width;
    this._height = height;

  const targetSize = 128;
    this._cols = Math.round(this._width / targetSize);
    this._rows = Math.round(this._height / targetSize);
    this._cellWidth = Math.round(this._width / this._cols);
    this._cellHeight = Math.round(this._height / this._rows);

    this._cellArray = new Array(this._cols * this._rows);
    for (let i = 0; i < this._cellArray.length; i++) {
      this._cellArray[i] = new Cell(null);
    }
  }

  createCellsForLabel(w, h, label) {

    //create at least one extra cell in every dimension
    const cols = Math.ceil(w / this._cellWidth + 1);
    const rows = Math.ceil(h / this._cellHeight + 1);

    const cells = new Array(cols * rows);
    for (let i = 0; i < cells.length; i++) {
      cells[i] = new Cell(label);
    }

    return cells;
  }

  clearGrid() {
    for (let i = 0; i < this._cellArray.length; i++) {
      this._cellArray[i].setNextNodeDLL(null);
      this._cellArray[i].setPreviousNodeDLL(null);
    }
  }

  isLabelOnScreen(label) {
    if (

    label.getViewX() >= 0 &&
    label.getViewX() + label.getWidth() <= this._width &&
    label.getViewY() >= 0 &&
    label.getViewY() + label.getHeight() <= this._width

    ) {
      return true;
    }
    return false;
  }


  hasConflictsAtAnchors(label) {
    label.resetAnchor();
    while (label.hasNextAnchor()) {
      label.nextAnchor();
      const conflicts = this.hasConflicts(label);
      if (!conflicts) {
        return false;
      }
    }
    return true;
  }

  hasConflicts(label) {

    if (!this.isLabelOnScreen(label)) {
      return true;
    }

    const x = label.getViewX();
    const y = label.getViewY();

    const w = label.getWidth();
    const h = label.getHeight();

    const colStart = Math.max(0, Math.floor(x / this._cellWidth));
    const colEnd = Math.min(Math.ceil((x + w) / this._cellWidth), this._cols);
    const rowStart = Math.max(0, Math.floor(y / this._cellHeight));
    const rowEnd = Math.min(Math.ceil((y + h) / this._cellHeight), this._rows);


    for (let c = colStart; c < colEnd; c++) {
      for (let r = rowStart; r < rowEnd; r++) {
        const index = this.toIndex(c, r);
        const gridCell = this._cellArray[index];
        let cell = gridCell.getNextNodeDLL();
        while (cell) {
          const compLabel = cell.getLabel();
          if (compLabel.intersects(label)) {
            return true;
          }
          cell = cell.getNextNodeDLL();
        }
      }
    }
    return false;

  }


  toIndex(x, y) {
    return x * this._rows + y;
  }

  markLabel(label) {


    const x = label.getViewX();
    const y = label.getViewY();

    const w = label.getWidth();
    const h = label.getHeight();

    const colStart = Math.max(0, Math.floor(x / this._cellWidth));
    const colEnd = Math.min(Math.ceil((x + w) / this._cellWidth), this._cols);
    const rowStart = Math.max(0, Math.floor(y / this._cellHeight));
    const rowEnd = Math.min(Math.ceil((y + h) / this._cellHeight), this._rows);

    for (let c = colStart; c < colEnd; c++) {
      for (let r = rowStart; r < rowEnd; r++) {
        const index = this.toIndex(c, r);
        const gridCell = this._cellArray[index];
        const labelCell = label.getCell();

        const nextCell = gridCell.getNextNodeDLL()
        labelCell.setPreviousNodeDLL(gridCell);
        gridCell.setNextNodeDLL(labelCell);

        labelCell.setNextNodeDLL(nextCell);
        if (nextCell) {
          nextCell.setPreviousNodeDLL(labelCell);
        }
      }
    }


  }

  draw(context2d) {
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        const index = this.toIndex(c, r);
        const cell = this._cellArray[index];
        context2d.fillStyle = cell.getNextNodeDLL() === null ? 'rgba(0,255,0, 0.02)' : 'rgba(255,0,0,0.02)';
        context2d.strokeStyle = cell.getNextNodeDLL() === null ? 'rgba(0,255,0, 0.2)' : 'rgba(255,0,0,0.2)';
        context2d.fillRect(c * this._cellWidth, r * this._cellHeight, this._cellWidth, this._cellHeight);
        context2d.strokeRect(c * this._cellWidth, r * this._cellHeight, this._cellWidth, this._cellHeight);
      }
    }
  }


}


class LabelLayer extends LinkedListNode {

  constructor(container) {

    super();
    this._containerDiv = container;

    //div to place labels in
    this._labelDiv = document.createElement('div');
    this._labelDiv.style.position = 'absolute';
    this._labelDiv.style.left = 0;
    this._labelDiv.style.top = 0;
    this._labelDiv.style.overflow = 'hidden';
    this._containerDiv.appendChild(this._labelDiv);

    //div to measure labels in
    this._measureDiv = document.createElement('div');
    this._measureDiv.style.position = 'absolute';
    this._measureDiv.style.visibility = 'hidden';
    this._measureDiv.style.left = 0;
    this._measureDiv.style.top = 0;
    this._containerDiv.appendChild(this._measureDiv);


    //dom management buffers
    this._labelsToRemoveFromDOM = [];
    this._labelsToAddToDOM = [];
    this._labelsToChangePositionForInDOM = [];


    //grids
    this._width = 0;
    this._height = 0;
    this._gridFront = null;
    this._gridBack = null;

    //divver
    this._divPool = new DivPool();


    //draw state
    this._rafHandle = -1;

    //sizer
    this._updateSize = () => {

      const newWidth = this._containerDiv.clientWidth;
      const newHeight = this._containerDiv.clientHeight;

      if (this._width === newWidth && this._height === newHeight) {
        return;
      }

      this._width = newWidth;
      this._height = newHeight;
      this._labelDiv.style.width = this._width + 'px';
      this._labelDiv.style.height = this._height + 'px';

      //copy the grids in here...
      if (this._gridFront) {
        this._gridFront.clearGrid();
        this._gridBack.clearGrid();
      }
      this._gridFront = new Grid(this._width, this._height);
      this._gridBack = new Grid(this._width, this._height);

      this._invalidate();

    };
    window.addEventListener('resize', this._updateSize);
    this._updateSize();


  }

  destroy() {
    this.setNextNode(null);
    window.removeEventListener('resize', this._updateSize);
    this._containerDiv.innerHTML = null;
  }

  resize() {
    this._updateSize();
  }

  createLabel(x, y, htmlContents, priority) {
    const anchorGenerator = new MultiAnchorGenerator(x, y);
    return this._createAndAddLabel(htmlContents, priority, anchorGenerator);
  }

  _createAndAddLabel(htmlContents, priority, anchorGenerator) {
    const labelHandle = new Label(this, htmlContents, anchorGenerator);
    labelHandle.setPriority(priority);
    labelHandle.setStatus(STATUS.NOT_INITIALIZED);
    this._addLabel(labelHandle);
    return labelHandle;
  }

  addLabel(labelHandle) {
    labelHandle.setShouldRemove(false);
    this._addLabel(labelHandle);
  }

  moveLabel(labelHandle, x, y) {
    labelHandle.dirtyPosition(x, y);
    this._invalidate();
  }

  removeLabel(labelHandle) {
    labelHandle.setShouldRemove(true);
    this._invalidate();
  }

  getVisibleLabels() {

    let visibleLabels = [];
    let node = this.getNextNode();
    while (node) {
      if (node.getStatus() === STATUS.ON_SCREEN) {
        visibleLabels.push(node);
      }
      node = node.getNextNode();
    }
    return visibleLabels;
  }

  getLabelCenter(labelHandle, out) {
    out.x = labelHandle.getViewX() + labelHandle.getWidth() / 2;
    out.y = labelHandle.getViewY() + labelHandle.getHeight() / 2;
  }


  changeLabelPriority(labelToMove, newPriority) {

    if (labelToMove.getPriority() === newPriority) {
      return;
    }

    let previousNode = this;
    let node = previousNode.getNextNode();

    let nodeBeforeTarget = null;
    let nodeToInsertOn = null;

    while (node) {

      if (node === labelToMove) {
        nodeBeforeTarget = previousNode;
      }
      const nextNode = node.getNextNode();
      const foundInsertionNode = !nodeToInsertOn && (nextNode === null || node.getPriority() <= newPriority);
      if (foundInsertionNode) {
        nodeToInsertOn = previousNode;
      }

      if (nodeBeforeTarget && nodeToInsertOn) {
        if (labelToMove !== nodeToInsertOn) {
          //remove the node
          const nextAfterTarget = labelToMove.getNextNode();
          labelToMove.setNextNode(null);
          nodeBeforeTarget.setNextNode(nextAfterTarget);

          //and insert into new position
          const next = nodeToInsertOn.getNextNode();
          labelToMove.setNextNode(next);
          nodeToInsertOn.setNextNode(labelToMove);

        }
        break;
      }

      previousNode = node;
      node = previousNode.getNextNode();

    }

    labelToMove.setPriority(newPriority);
    this._invalidate();
  }

  _drawGrid(context) {
    this._gridFront.draw(context);
  }

  _invalidate() {
    if (this._rafHandle > -1) {
      return;
    }
    this._rafHandle = requestAnimationFrame(() => {
      this._rafHandle = -1;
      // const bef = Date.now();
      this._updateStateOfAllLabels();
      // console.log('timing: ', Date.now() - bef);
    });
  }

  _canAddToScreenAndMark(label, shouldCheck) {
    if (shouldCheck) {
      if (this._gridFront.hasConflictsAtAnchors(label)) {
        return false;
      } else {
        this._gridFront.markLabel(label);
        return true;
      }
    } else {
      if (label.getStatus() === STATUS.ON_SCREEN) {
        this._gridFront.markLabel(label);
        return true;
      } else {
        return false;
      }
    }

  }

  _updateStateOfAllLabels() {

      const tmp = this._gridBack;
      this._gridBack = this._gridFront;
      this._gridFront = tmp;
      this._gridFront.clearGrid();

      let previousNode = this;
      let label = previousNode.getNextNode();


      let shouldCheckForConflicts = false;
      while (label) {

        const labelStatus = label.getStatus();
        const shouldRemove = label.getShouldRemove();

        shouldCheckForConflicts = shouldCheckForConflicts ||
        labelStatus === STATUS.NOT_INITIALIZED ||
        (labelStatus === STATUS.ON_SCREEN && label.isDirty()) ||
        (labelStatus === STATUS.OFF_SCREEN && label.isDirty());

        label.clearLastCompLabel();
        label.unhookAllCells();

        if (shouldRemove) {
          const nextLabel = label.getNextNode();
          label.setNextNode(null);
          previousNode.setNextNode(nextLabel);
          if (labelStatus === STATUS.ON_SCREEN) {
            label.setStatus(STATUS.OFF_SCREEN);
            this._labelsToRemoveFromDOM.push(label);
          }
          label = nextLabel;
        } else {
          if (labelStatus === STATUS.NOT_INITIALIZED) {
            label.measure(this._measureDiv);
            if (this._canAddToScreenAndMark(label, shouldCheckForConflicts)) {
              label.setStatus(STATUS.ON_SCREEN);
              this._labelsToAddToDOM.push(label);
            } else {
              label.setStatus(STATUS.OFF_SCREEN);
            }
          } else if (labelStatus === STATUS.OFF_SCREEN) {
            //check if can add
            if (this._canAddToScreenAndMark(label, shouldCheckForConflicts)) {
              label.setStatus(STATUS.ON_SCREEN);
              this._labelsToAddToDOM.push(label);
            }
          } else if (labelStatus === STATUS.ON_SCREEN) {
            if (this._canAddToScreenAndMark(label, shouldCheckForConflicts)) {
              if (label.isDirty()) {
                this._labelsToChangePositionForInDOM.push(label);
                label.unDirtyPosition();
              }
            } else {
              label.setStatus(STATUS.OFF_SCREEN);
              this._labelsToRemoveFromDOM.push(label);
            }
          }

          label.clearLastCompLabel();
          previousNode = label;
          label = label.getNextNode();
        }
      }

      let labelToRemove = this._labelsToRemoveFromDOM.pop();
      while (labelToRemove) {
        this._labelDiv.removeChild(labelToRemove.getDOMDiv());
        const div = labelToRemove.removeDomDivReference();
        this._divPool.returnDiv(div);
        labelToRemove = this._labelsToRemoveFromDOM.pop();
      }

      let labelToAdd = this._labelsToAddToDOM.pop();
      while (labelToAdd) {
        const div = this._divPool.getDiv();
        labelToAdd.setDomDiv(div);
        div.style.left = labelToAdd.getViewX() + 'px';
        div.style.top = labelToAdd.getViewY() + 'px';
        div.style.width = labelToAdd.getWidth() + 1 + 'px';//ugh, how to measure borders?
        div.style.height = labelToAdd.getHeight() + 1 + 'px';//ugh, how to measure borders?
        this._labelDiv.appendChild(div);
        labelToAdd = this._labelsToAddToDOM.pop();
      }

      let labelToChangePositionFor = this._labelsToChangePositionForInDOM.pop();
      while (labelToChangePositionFor) {
        const div = labelToChangePositionFor.getDOMDiv();
        div.style.left = labelToChangePositionFor.getViewX() + 'px';
        div.style.top = labelToChangePositionFor.getViewY() + 'px';
        labelToChangePositionFor = this._labelsToChangePositionForInDOM.pop();
      }

  }

  /**
   * sorted insert
   * @param headLL
   * @param nodeToInsert
   * @return {*} new head of LL
   * @private
   */
  _addTolinkedList(headLL, nodeToInsert) {

    if (headLL === null) {
      return nodeToInsert;
    }

    //is this a new head?
    if (headLL.getPriority() <= nodeToInsert.getPriority()) {
      nodeToInsert.setNextNode(headLL);
      return nodeToInsert;
    }

    //not new head, so anywhere else
    let currentNode = headLL;
    while (currentNode) {
      let nextNode = currentNode.getNextNode();
      const shouldInsert = nextNode === null || nextNode.getPriority() <= nodeToInsert.getPriority();
      if (shouldInsert) {
        currentNode.setNextNode(nodeToInsert);
        nodeToInsert.setNextNode(nextNode);
        break;
      }
      currentNode = nextNode;
    }
    return headLL;
  }

  _dumpLabelList(property) {
    const labels = [];
    let label = this.getNextNode();
    while (label) {
      let thing;
      if (property) {
        thing = label[property];
      } else {
        thing = label;
      }
      labels.push(thing);
      label = label.getNextNode();
    }
    return labels;

  }

  _addLabel(labelHandle) {
    labelHandle.setStatus(STATUS.NOT_INITIALIZED);
    this._addToAllLabelList(labelHandle);
    this._invalidate();
    return labelHandle;
  }


  _addToAllLabelList(labelToAdd) {
    const newHead = this._addTolinkedList(this.getNextNode(), labelToAdd);
    this.setNextNode(newHead);
  }

  _createCellsForLabel(width, height, label) {
    return this._gridFront.createCellsForLabel(width, height, label);
  }

  scaleOnPoint(sx, sy, pX, pY) {

    const tx = pX - (pX * sx);
    const ty = pY - (pY * sy);

    let label = this.getNextNode();
    while (label) {
      const nx = label.getX() * sx + tx;
      const ny = label.getY() * sy + ty;
      this.moveLabel(label, nx, ny);
      label = label.getNextNode();
    }
  }


}

window.LabelLayer = LabelLayer;