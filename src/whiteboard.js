// This class is to handle the utility functions of whiteboard
class Whiteboard {
  constructor() {
    this.canvas = null;
    this.selectedTool = null;
    this.rectangleObj = new WhiteboardRectangle('rectangle');
    this.activeAllObj = new WhiteboardActiveAll();
    this.freeDrawingObj = new WhiteboardFreeDrawing('freeDrawing');
    this.lineObj = new WhiteboardLine('line');
    this.triangleObj = new WhiteboardTriangle('triangle');
    this.circleObj = new WhiteboardCircle('circle');
    this.textObj = new WhiteboardText('text');
    this.gObj = {};
  }

  init(id) {
    this.wbId = id;
    this.attachToolbarHandler(id);
    console.log('====> canvas id ', `canvas${id}`);
    virtualclass.wbWrapper.util.createFabricNewInstance(id);
    // this.attachMouseMovementHandlers();
    virtualclass.keyboard.init(id);
  }

  attachToolbarHandler(id) {
    const allTools = document.querySelectorAll(`#commandToolsWrapper${id} .tool a`);
    for (let i = 0; i < allTools.length; i++) {
      allTools[i].addEventListener('click', this.toolbarHandler.bind(this));
    }
  }

  attachMouseMovementHandlers() {
    console.log('====> init whiteboard add ');
    this.canvas.on('selection:created', this.handlerSelection.bind(this));
    this.canvas.on('selection:cleared', this.handlerSelection.bind(this));
    this.canvas.on('mouse:down', this.handlerMouseDown.bind(this));
    this.canvas.on('mouse:move', this.handlerMouseMove.bind(this));
    this.canvas.on('mouse:up', this.handlerMouseUp.bind(this));
    this.canvas.on('text:editing:exited', (textObj) => { // TODO, this need to be removed
      setTimeout(() => { this.textObj.finalizeText(textObj); }, 0);
    });
  }

  removeMouseMovementHandlers() {
    console.log('====> init whiteboard remove');
    this.canvas.off('mouse:down', this.handlerMouseDown);
    this.canvas.off('mouse:move', this.handlerMouseMove);
    this.canvas.off('mouse:up', this.handlerMouseUp);
    this.canvas.isDrawingMode = false;
    this.canvas.selection = false;
  }

  handlerSelection(event) {
    if (event.selected && this.selectedTool === 'activeAll') {
      console.log('====> mouse down for activeness');
      this.activeAllObj.activeDown = true;
    } else if (event.selected && event.selected[0].type === 'i-text') {
      virtualclass.wbWrapper.gObj.textSelected = event.selected[0];
    } else if (event.deselected) {
      this.activeAllObj.activeDown = false;
      virtualclass.wbWrapper.gObj.textSelected = false;
    }
  }

  handlerMouseDown(o) {
    // We do not need to invoke on clearAll
    if (this.selectedTool && this[`${this.selectedTool}Obj`]) {
      console.log('=====> SUMAN BOGATI MOUSE 1');
      this.mousedown = true;
      const pointer = virtualclass.wb[virtualclass.gObj.currWb].canvas.getPointer(o.e);
      this[`${this.selectedTool}Obj`].mouseDown(pointer, this, o);
    }
  }

  handlerMouseMove(o) {
    const pointer = virtualclass.wb[virtualclass.gObj.currWb].canvas.getPointer(o.e);
    if (this.mousedown && this.selectedTool) {
      console.log('=====> SUMAN BOGATI MOUSE 2');
      this[`${this.selectedTool}Obj`].mouseMove(pointer, this, o);
    }
    virtualclass.wbWrapper.cursor.handle(pointer);
  }

  handlerMouseUp(o) {
    const pointer = virtualclass.wb[virtualclass.gObj.currWb].canvas.getPointer(o.e);
    if (this.mousedown && this.selectedTool) this[`${this.selectedTool}Obj`].mouseUp(pointer, this, o);
    this.mousedown = false;
    console.log('=====> SUMAN BOGATI MOUSE 3');
  }

  toolbarHandler(ev) {
    this.innerToolbarHandler(ev.currentTarget.parentNode.dataset.tool);
    const activeObject = virtualclass.wb[virtualclass.gObj.currWb].canvas.getActiveObjects();
    if (activeObject.length > 0) {
      virtualclass.wb[virtualclass.gObj.currWb].canvas.discardActiveObject();
      virtualclass.wb[virtualclass.gObj.currWb].canvas.renderAll();
      const encodeData = virtualclass.wbWrapper.protocol.encode('ds', virtualclass.gObj.currWb);
      virtualclass.wbWrapper.msg.send(encodeData);
    }
  }

  selectTool(tool) { // todo, need to improve
    if (tool === 'rectangle' ||  tool === 'line' || tool === 'circle' || tool === 'triangle' || tool === 'text'
      || tool === 'activeAll' ||  tool === 'freeDrawing') {
        this.selectedTool = tool;
    }
  }

  innerToolbarHandler(tool) {
    virtualclass.wbWrapper.util.closeTray();
    this.canvas.isDrawingMode = false;
    const currentTool = tool;
    this.selectTool(tool);
    
    if (tool !== 'rectangle' &&  tool !== 'line' &&  tool !== 'circle' && tool !== 'triangle' && tool !== 'text') {
      this[currentTool]();
    } else if (currentTool === 'text') {
      this.activeAllObj.enable(virtualclass.gObj.currWb, 'i-text');
      this.activeAllObj.disableBut(virtualclass.gObj.currWb, 'i-text');
    } else {
      this.activeAllObj.disable(virtualclass.gObj.currWb);
    }
  }

  shapes() {
    // this.selectedTool = null;
    const shapesElem = document.querySelector(`#shapes${this.wbId}`);
    virtualclass.wbWrapper.util.handleTrayDisplay(shapesElem);
    // const shapesElem = document.querySelector(`#shapes${this.wbId}`);
    // if (shapesElem.classList.contains('openopenTray')) {
    //   //virtualclass.wbWrapper.util.closeShapeContainer(shapesElem);
    //   virtualclass.wbWrapper.util.closeTray(shapesElem);
    // } else {
    //   virtualclass.wbWrapper.util.openTray(shapesElem);
    //   // openShapeContainer
    //   //shapesElem.classList.add('open', 'openTray');
    // }
  }

  stroke(){
    const shapesElem = document.querySelector(`#commandToolsWrapper${this.wbId} .strkSizeList`);
    virtualclass.wbWrapper.util.handleTrayDisplay(shapesElem);
    virtualclass.wbWrapper.util.initActiveElement(`#t_strk${this.wbId} ul`, { type: 'strk', prop: 'stroke' });
  }

  freeDrawing() {
    this.canvas.isDrawingMode = false;
    // this.disable(virtualclass.gObj.currWb);
    this.activeAllObj.disable(virtualclass.gObj.currWb);
    // this.isDrawingMode = true;
  }

  activeAll() {
    this.activeAllObj.enable(virtualclass.gObj.currWb);
    console.log('====> I am being active here ');
  }

  clearAll() {
    const cofirmMessage = virtualclass.lang.getString('clearAllWarnMessageW');
    virtualclass.popup.confirmInput(cofirmMessage, (confirm) => {
      if (confirm){
        this.clear();
        // const whiteboard = virtualclass.wb[virtualclass.gObj.currWb];
        // whiteboard.myPencil = new fabric.PencilBrush(whiteboard.canvas);
        const encodeData = virtualclass.wbWrapper.protocol.encode('cr', virtualclass.gObj.currWb);
        virtualclass.wbWrapper.msg.send(encodeData);
      }
    });
  }

  clear() {
    this.canvas.clear();
    this.replayObjs = [];
    this.canvas._objects = [];
    
  }
}