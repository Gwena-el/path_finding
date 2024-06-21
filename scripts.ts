var canvas = document.getElementById("canvas") as HTMLCanvasElement;
var ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

var nodeSize = 20, nodePerWidth = 25, nodePerHeight = 25;
var nodes = createArray();
var startNode = { x: -1, y: -1 }, endNode = { x: -1, y: -1 };
var testNodes;

function createArray() {
    let nodes = [];
    for (var y = 0; y < nodePerHeight; y++) {
        for (var x = 0; x < nodePerWidth; x++) {
            let node = {
                x: x,
                y: y,
                obstacle: false,
                visited: false,
                global: Infinity,
                local: Infinity,
                neighbours: getNeighbours(x, y),
                parent: -1
            }
            nodes.push(node);
        }
    }
    return nodes;
}

function drawGrid() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    var border = 2;
    var nodesLength = nodes.length;
    // Draw connection behind nodes
    for(var c = 0; c<nodesLength; c++){
	if(!nodes[c].obstacle){
	    ctx.strokeStyle = "#3412A0";
	    ctx.lineWidth = 2;
	    connection(c);
	}
    }
    // Draw nodes
    for (var i = 0; i < nodesLength; i++) {
        let x = nodes[i].x;
        let y = nodes[i].y;
	// Nodes Colors
	if(nodes[i].obstacle == true){
	    ctx.fillStyle = "#313131";    // grey
	}else{
	    ctx.fillStyle = "#3412A0";    // blue
	}	
	// Draw starting node
	if(nodes[i].x == startNode.x && nodes[i].y == startNode.y){
	    ctx.fillStyle = "#FFF500";    // yellow
	}
	// Draw ending node
	if(nodes[i].x == endNode.x && nodes[i].y == endNode.y){
	    ctx.fillStyle = "#FF6A00";    // orange
	}
        ctx.fillRect(
	    x * nodeSize + border,
	    y * nodeSize + border,
	    nodeSize - (border*2),
	    nodeSize - (border*2)
	);
        ctx.stroke()	
    }
    if(!(startNode.x == -1 && startNode.y == -1) && !(endNode.x == -1 && endNode.y == -1)){
	// reset all nodes
	for(var x = 0; x < nodePerWidth; x++)  {
	    for(var y = 0; y < nodePerHeight; y++){
		nodes[y * nodePerWidth + x].visited = false;
		nodes[y * nodePerWidth + x].global = Infinity;
		nodes[y * nodePerWidth + x].local = Infinity;
		nodes[y * nodePerWidth + x].parent = -1;
	    }
	}
	defineStart();
	aStar();
    }
}

function drawLine(x:number, y:number, xe:number, ye:number){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(xe, ye);
    ctx.stroke();
}

function getNeighbours(x:number, y: number){
    let neighbours = [];
    if(y > 0){
	let index = (y - 1) * nodePerWidth + x;
	neighbours.push(index);
    }
    if(y < nodePerHeight-1){
	let index = (y + 1) * nodePerWidth + x;
	neighbours.push(index);
    }
    if(x > 0){
	let index = y * nodePerWidth + x-1;
	neighbours.push(index);
    }
    if(x < nodePerWidth-1){
	let index = y * nodePerWidth + x+1;
	neighbours.push(index);
    }
    return neighbours;
}

function connection(index: number){
    let neighbours = nodes[index].neighbours;
    var nLength = neighbours.length;
    var x = (nodes[index].x*nodeSize) + (nodeSize/2);
    var y = (nodes[index].y*nodeSize) + (nodeSize/2);
    for(var i= 0; i<nLength; i++){
	var nx = (nodes[neighbours[i]].x*nodeSize) + (nodeSize/2);
	var ny = (nodes[neighbours[i]].y*nodeSize) + (nodeSize/2);
	if(!nodes[neighbours[i]].obstacle){
	    drawLine(x, y, nx, ny);
	}
    }
}

function getMousePos(evt){
    let rect = canvas.getBoundingClientRect();
    return {
	x: evt.clientX - rect.left,
	y: evt.clientY - rect.top,
    }
}

function selectNode(event){
    let mousePos = getMousePos(event);
    let x = Math.floor(mousePos.x/nodeSize);
    let y = Math.floor(mousePos.y/nodeSize);
    let index = y * nodePerWidth + x;
    if(event.ctrlKey){
	// start point
	if(startNode.x == -1 && startNode.y == -1){
	    startNode = {x: x, y: y}
	}else if(startNode.x == x && startNode.y == y){
	    startNode = {x: -1, y: -1}
	}else{
	    startNode = {x: x, y: y}
	}
    }else if(event.shiftKey){
	// end point
	if(endNode.x == -1 && endNode.y == -1){
	    endNode = {x: x, y: y}
	}else if(endNode.x == x && endNode.y == y){
	    endNode = {x: -1, y: -1}
	}else{
	    endNode = {x: x, y: y}
	}
    }else{
	// obstacle
	if(!nodes[index].obstacle){
	    nodes[index].obstacle = true;
	}else{
	    nodes[index].obstacle = false;
	}
    }
    drawGrid();
}

function defineStart(){
    // if exist defines starting node
    let i = startNode.y * nodePerWidth + startNode.x;
    let globalH = getGlobal(startNode, endNode);
    nodes[i].local = 0;
    nodes[i].global = globalH + nodes[i].local;
    testNodes = [nodes[i]];
}

function getGlobal(startNode, endNode){
    return Math.sqrt(Math.pow(endNode.x - startNode.x, 2) + Math.pow(endNode.y - startNode.y, 2));
}
function aStar(){
    while(testNodes.length > 0){
	// sort array
	testNodes.sort(function(a, b) {return a.global - b.global});
	//remove visited nodes
	while(testNodes.length > 0 && testNodes[0].visited){
	    testNodes.shift();
	}
	if(testNodes.length == 0){
	    break;
	}
	//define current node
	var currentNode = testNodes[0];
	currentNode.visited = true;
	//check each of current node neighbours
	var nNeighbours = currentNode.neighbours.length;
	for(var i = 0; i < nNeighbours; i++){
	    let iNeighbours = currentNode.neighbours[i];
	    //update list test node
	    if(!nodes[iNeighbours].visited && !nodes[iNeighbours].obstacle){
		testNodes.push(nodes[iNeighbours]);
	    }
	    //if distance through current node shorter than what distance neighbouring node as set : update
	    let testLocal = currentNode.local + 1 < nodes[iNeighbours].local;
	    if(testLocal){
		let globalH = getGlobal(nodes[iNeighbours], endNode);
		nodes[iNeighbours].local = currentNode.local + 1;
		nodes[iNeighbours].global = nodes[iNeighbours].local + globalH;
		nodes[iNeighbours].parent = currentNode.y * nodePerWidth + currentNode.x;
	    }
	}
    }
    // draw way backward
    let currentPoint = endNode.y * nodePerWidth + endNode.x;
    while(nodes[currentPoint].parent != -1){
	ctx.strokeStyle = "#FFF500";
	let np = nodes[currentPoint].parent;
	drawLine(
	    (nodes[currentPoint].x * nodeSize) + (nodeSize / 2),
	    (nodes[currentPoint].y * nodeSize) + (nodeSize / 2),
	    (nodes[np].x * nodeSize) + (nodeSize / 2),
	    (nodes[np].y * nodeSize) + (nodeSize / 2)
	);
	currentPoint = np;
    }
}
	
drawGrid();

canvas.addEventListener("click", (event) => { selectNode(event)});
