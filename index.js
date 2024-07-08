const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight


gridWidth = 100;
gridHeight = gridWidth;
grid = []

mouseX = 0;
mouseY = 0;

playerX = 0;
playerY = 0;
velX = 0;
velY = 0;
targetX =0;
targetY =0;
zoom = 1;

function init()
{
	for (let i=0;i<gridHeight;i++)
	{
		grid[i] = [];
		for (let a=0;a<gridWidth;a++)
		{
			grid[i][a] = 0;
		}
	}
	grid[2][4] = 1;
	grid[4][4] = 1;
}
function getBoxWidth()
{
	return ((canvas.width/gridWidth) * zoom);
}
function getBoxWidthNoZoom()
{
	return ((canvas.width/gridWidth));
}

function renderGrid(camX,camY)
{

	let boxWidth = getBoxWidth()
	c.fillStyle = 'rgba(150,220,50,1)'
	c.fillRect(0-camX*boxWidth,0-camY*boxWidth,boxWidth * gridWidth, boxWidth * gridHeight)
	c.fillStyle = 'rgba(255,0,0,1)'
	for (let y=0;y<gridHeight;y++)
	{
	
		if ((y-camY)*boxWidth > canvas.height)
		{
			break;
		}
		c.beginPath(); 
		c.moveTo(-camX*boxWidth,(y-camY)*boxWidth)
		c.lineTo(boxWidth*gridWidth,(y-camY)*boxWidth)
		c.stroke();
		for (let x=0; x<gridWidth;x++)
		{
		    if ((x-camX)*boxWidth > canvas.width)
			{
				break;
			}
			c.beginPath(); 
			c.moveTo((x-camX)*boxWidth,(-camY)*boxWidth)
			c.lineTo((x-camX)*boxWidth,boxWidth*gridWidth)
			c.stroke();
			if (grid[x][y] != 0)
			{
				c.fillRect((x-camX)*boxWidth,(y-camY)*boxWidth,boxWidth,boxWidth);
			}
		}
	}
}
nextThink = performance.now() + 1000;

toUpdate = []
function getAliveNeighbors(px,py)
{
	neighbors = []
	
	for (let x = -1; x <= 1; x++)
	{
		let nx = px +x;
		if (nx<0)
		{
			continue;
		}
		if (nx>gridWidth)
		{
			continue;
		}
		for (let y = -1; y <= 1; y++)
		{
			
			if (x==0 && y ==0)
			{
				continue
			}
			let ny = py +y;
			if (ny<0)
			{
				continue;
			}
			if (ny>gridHeight)
			{
				continue;
			}
			if (grid[nx] == undefined)
			{
				continue;
			}
			let b = grid[nx][ny];
			if (b == 0)
			{
				continue;
			}
			neighbors[neighbors.length] = [nx,ny]
		}
	}
	return neighbors
}
function thinkGrid()
{
	if ( performance.now() < nextThink || primaryMouseButtonDown)
	{
		return;
	}
	nextThink = performance.now() + 1000;
	
	
	for (let y=0;y<gridHeight;y++)
	{
		for (let x=0; x<gridWidth;x++)
		{
		
			let n = getAliveNeighbors(x,y);
			if (grid[x][y] == 1)
			{
				if (n.length < 2 || n.length>3)
				{
					setCell(x,y,0);
				}
			}
			else
			{
				if (n.length == 3)
				{
					setCell(x,y,1)
				}
			}
		}
	}
}
function setCell(x,y,t)
{
	toUpdate[toUpdate.length] = [x,y,t]
}
function updateGrid()
{
	for (let i=0; i<toUpdate.length; i++)
	{
		grid[toUpdate[i][0]][toUpdate[i][1]] = toUpdate[i][2]
	}
	toUpdate = [];
}
function animate() {
	canvas.width = innerWidth
	canvas.height = innerHeight
	animationId = requestAnimationFrame(animate)
	c.clearRect(0,0,canvas.width,canvas.height)
	c.fillStyle = 'rgba(0,0,0,1)'
	c.fillRect(0,0,canvas.width,canvas.height)
	let boxWidth = getBoxWidth()
	let boxWidthNoZoom = getBoxWidthNoZoom();
	
	
	playerX += velX /zoom
	playerY += velY /zoom
	let maxX = (gridWidth)
	let maxY = (gridHeight)
	let minX = -(gridWidth);
	let minY = -(gridHeight)
	if (playerX > maxX)
	{
		playerX = maxX;
	}
	if (playerX < minX)
	{
		playerX = minX;
	}
	if (playerY < minY)
	{
		playerY = minY;
	}
	if (playerY > maxY)
	{
		playerY = maxY;
	}
	if (zoom == 1)
	{
		playerX = 0;
		playerY = 0;
	}
	thinkGrid();
	updateGrid();
	renderGrid(playerX,playerY);
	
	if (primaryMouseButtonDown)
	{
			let boxWidth = getBoxWidth()
	grid[Math.floor(playerX+mouseX/boxWidth)][Math.floor(playerY +mouseY/boxWidth)]=1
	}
}
/*
function spawnEnemies() {
	setInterval(() =>{
		const x = Math.random() * canvas.width
		const y = Math.random() * canvas.height
		const radius = 30
		const color = 'green'
		const angle = Math.atan2(
			canvas.height/2 - y,
			canvas.width/2 - x
		)
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle)
		}
		enemies.push(new Enemy(x,y,radius,color,velocity))
	}, 1000)
}*/
var primaryMouseButtonDown = false;

function setPrimaryButtonState(e) {
  var flags = e.buttons !== undefined ? e.buttons : e.which;
  var oldDown = primaryMouseButtonDown;
  primaryMouseButtonDown = (flags & 1) === 1;
  if (!oldDown && primaryMouseButtonDown)
  {
	  nextThink = performance.now() + 500
  }
}

document.addEventListener("mousedown", setPrimaryButtonState);
document.addEventListener("mousemove", setPrimaryButtonState);
document.addEventListener("mouseup", setPrimaryButtonState);
window.addEventListener('click', ()=> {
	const y = event.clientY 
	const x = event.clientX
	let boxWidth = getBoxWidth()
	grid[Math.floor(playerX+x/boxWidth)][Math.floor(playerY + y/boxWidth)]=1
	
})
window.addEventListener("wheel", event => {
    const delta = -Math.sign(event.deltaY);
    console.info(delta);
	zoom += delta;
	
	if (zoom < 1)
	{
		zoom = 1;
	}
	if (zoom>10)
	{
		zoom=10;
	}
});
 document.onmousemove = handleMouseMove;
function handleMouseMove(event) {
	var eventDoc, doc, body;

	event = event || window.event; // IE-ism
	
	mouseX = event.clientX;
	mouseY = event.clientY;
	let distX = (canvas.width/2) - event.clientX 
	let distY = (canvas.height/2) - event.clientY 
	let dist =  Math.sqrt((distX*distX) + (distY*distY));
	if (dist > 100*zoom)
	{
		velX = distX > 0 ? -1 : 1;
		velY = distY > 0 ? -1 : 1;
		velX /= zoom;
		velY /= zoom
	}
	else
	{
		velX = 0;
		velY = 0;
	}

}
init()
animate()
//spawnEnemies()