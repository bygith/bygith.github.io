
/*
Functions that deal with the GUI can be found in this script.
We also declare the global variables here.

Sources:
I wrote the A* function myself based on the guide found on this 
website: http://www.policyalmanac.org/games/aStarTutorial.htm

My GUI is taken from/based off of the following websites:
http://buildnewgames.com/astar/   <---Got the gui from here.
https://jsfiddle.net/nDVYd/778/     <---Got file selection/browser codes from here, but did the parsing myself.
https://www.youtube.com/watch?v=rUjiGOct808      <---For helping with the drop-down menu.
*/


// the game's canvas element
var canvas2=null;

// the canvas 2d context
var ctx = null;

// an image containing all sprites
var spritesheet = null;

// true when the spritesheet has been loaded
var spritesheetLoaded = false;

//tile/cell sizes in pixels
var tileWidth=64;
var tileHeight=64;

var fileMap=[[]]; //left to right and top to bottom, so top left corner is 0,0 and bottom left corner is 0,y 
var fileWidth=15; 
var fileHeight=15;

var randomMap=false;

//the start and end locations - goblin and flower
var startX=0;
var startY=0;
var endX=1;
var endY=1;

//old start and end locations - used to keep track when redrawing new locations
var oldStartX=0;
var oldStartY=0;
var oldEndX=1;
var oldEndY=1;

//variables used to decide wheter to draw tree, goblin, or flower
var placeObs=false;
var placeStart=false;
var placeGoal=false;

//lists used to help keep track of exploration
var openList=[]; //list to store nodes/positions that we will consider when trying to find the route
var closedList=[]; //list to store nodes/positions that we have dealt with
var finalPath=[];  //list to store the final path after we find the route
var storedMaps=[[]]; //a 2d array to store the changes of the map/world
		
var heuristics=0; //0=Manhattan, 1=Euclidean, 2=Chebyshev
var kStep=1; //used by RRT



//We'll stick with javadoc.

/**
*Readies the HTML page. Sets sprite sheet, canvas dimensions, and event listener for clicks. 
*Also reads in a text file representation of the map/world.
*/
function onload()
{
	spritesheet = new Image();
	spritesheet.src ="mySS.png";
	spritesheet.onload = loaded;
	
	canvas2 = document.getElementById("gameCanvas2");
	canvas2.width = fileWidth * tileWidth;
	canvas2.height = fileHeight * tileHeight;
	canvas2.addEventListener("click", canvasClick, false);
	ctx2 = canvas2.getContext("2d");
	
    if (window.File && window.FileList && window.FileReader) {//Check File API support
        var filesInput = document.getElementById("files");

        filesInput.addEventListener("change", function(event) {

            var files = event.target.files; //FileList object
            var output = document.getElementById("result");

            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                if (!file.type.match('plain')) continue;

                var fReader = new FileReader();

                fReader.addEventListener("load", function(event) {

                    var textFile = event.target;

					var sT1=textFile.result.split('\n'); //gets each line
					var sizeST1=sT1.length;
					
					fileHeight=sT1.length;
					fileWidth=sT1[0].length-1;
					
					var sT2=sT1[0].split("");  //gets individual letter including \n

					//initialize fileMap
					for (var x=0; x < fileWidth; x++)
					{
						fileMap[x] = [];

						for (var y=0; y < fileHeight; y++)
						{
							fileMap[x][y] = 0;
						}
					}
					
					//stores map from text to fileMap
					for(var i=0;i<fileHeight;i++){
			
						var sText2=sT1[i].split("");
						
						for(var i2=0;i2<sText2.length;i2++){
							if(sText2[i2]=="e"){
								fileMap[i2][i]=0;  //[i2][i] b/c of the way how 2d arrays work lol
							}
							else if (sText2[i2]=="o"){
								fileMap[i2][i]=1;
							}
						}
					}
					
					canvas2.width = fileWidth * tileWidth;
					canvas2.height = fileHeight * tileHeight;
					redraw();
                });

                //Read the text file
                fReader.readAsText(file);
				
            }//for
					
        });
    }
    else {
        console.log("Your browser does not support File API");
    }
	
}


/**
*Calls the createWorld() function once loaded.
*/
function loaded()
{
	
	spritesheetLoaded = true;
	createWorld();
	
}//loaded


/**
*Creates the world in all of its glory and misery. 
*/
function createWorld()
{
	
	fileMap=[]; //resets the map/world
	canvas2.width=fileWidth * tileWidth;
	canvas2.height=fileHeight * tileHeight;
	
	//create empty fileMap
	for (var x=0; x < fileWidth; x++)
	{
		fileMap[x] = [];
		for (var y=0; y < fileHeight; y++)
		{
			fileMap[x][y] = 0;
		}
	}
	
	//randomly adds objstacles/trees
	if(randomMap==true){
	for (var x=0; x < fileWidth; x++)
	{
		for (var y=0; y < fileHeight; y++)
		{
			if (Math.random() > 0.678)
			fileMap[x][y] = 1;
		}
	}
	randomMap=false;
	}
	
	redraw();
	
}//createWorld


/**
*Handles click events on the canvas.
*/
function canvasClick(e)
{
	var x;
	var y;

	// grab html page coords
	if (e.pageX != undefined && e.pageY != undefined)
	{
		x = e.pageX;
		y = e.pageY;
	}
	else
	{
		x = e.clientX + document.body.scrollLeft +
		document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop +
		document.documentElement.scrollTop;
	}

	// make them relative to the canvas only
	x -= canvas2.offsetLeft;
	y -= canvas2.offsetTop;

	// return tile x,y that we clicked
	var cell =
	[
	Math.floor(x/tileWidth),
	Math.floor(y/tileHeight)
	];

	var intX=Math.floor(x/tileWidth);  //floor to make it int
	var intY=Math.floor(y/tileHeight);
	
	if(finalPath[0]==undefined){//forces us to reset/choose a new map after a run
		if(placeStart==true){
			createHome(intX, intY);
			startX=intX;
			startY=intY;
		}
		else if (placeGoal==true){
			createGoal(intX, intY);
			endX=intX;
			endY=intY;
		}
		else if(placeObs==true){
			createObs(intX, intY);
		}
	}
	
	redraw();
	
}//canvasClick


/**
*Redraws the world/map/graph.
*/
function redraw()
{
	if (!spritesheetLoaded) return;

	var spriteNum = 0;

	//clear screen
	ctx2.fillStyle = '#000000';
	ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

	for (var x=0; x < fileWidth; x++)
	{
		for (var y=0; y < fileHeight; y++)
		{
			
			// choose a sprite to draw
			switch(fileMap[x][y])
			{
			case 1: //if world[x][y]==1
				spriteNum = 1;
				break;
			default:
				spriteNum = 0;
				break;
			}
		
			ctx2.drawImage(spritesheet,
			spriteNum*tileWidth, 0,
			tileWidth, tileHeight,
			x*tileWidth, y*tileHeight,
			tileWidth, tileHeight);

		}
	}
	
	if(fileWidth!=0){
	for (var x=0; x < fileWidth; x++)
	{
		for (var y=0; y < fileHeight; y++)
		{
			
			if(fileMap[x][y]==0){ //empty/movable space - green grass
				spriteNum =0;
			}
			else if(fileMap[x][y]==1){ //objstacles - apple trees
				spriteNum=1;
			}
			else if(fileMap[x][y]==2){ //path chosen - musical notes
				spriteNum=2;
			}
			else if(fileMap[x][y]==3){ //goal - flower
				spriteNum=3;
			}
			else if(fileMap[x][y]==4){  //path taken - poop
				spriteNum=4;
			}
			else if(fileMap[x][y]==5){ //searched neighbor - blue borders/corners
				spriteNum=5;
			}
			else if(fileMap[x][y]==6){ //starting sprite - miserable goblin
				spriteNum=6;
			}
			else if(fileMap[x][y]==7){ //path "considered", but not final path - grey corners
				spriteNum=7;
			}
			else if(fileMap[x][y]==8){ //follow the butterfly
				spriteNum=8;
			}
			else if(fileMap[x][y]==9){ //goal reached - happy goblin
				spriteNum=9;
			}
			
			ctx2.drawImage(spritesheet,
			spriteNum*tileWidth, 0,  
			tileWidth, tileHeight,
			x*tileWidth, y*tileHeight,
			tileWidth, tileHeight);
			
			if(fileMap[x][y]==5){
				
				if(openList!=null){
		
		
					for(var i=0;i<openList.length;i++){
						if((openList[i].x==x)&&(openList[i].y==y)){
							var xPos=openList[i].x*tileWidth;
							var yPos=openList[i].y*tileHeight;
							ctx2.fillText("H:"+openList[i].h.toFixed(0), xPos+(tileWidth*.25), yPos+10);
							ctx2.fillText("G:"+openList[i].g, xPos+(tileWidth*.66), yPos+10);
							ctx2.fillText("F:"+openList[i].f.toFixed(0), xPos+(tileWidth*.5), yPos+(tileHeight*.88));
						}
					}
				}
	
				if(closedList!=null){
					for(var i=0;i<closedList.length;i++){
			
						if((closedList[i].x==x)&&(closedList[i].y==y)){
							var xPos=closedList[i].x*tileWidth;
							var yPos=closedList[i].y*tileHeight;
							ctx2.fillText("H:"+closedList[i].h.toFixed(0), xPos+(tileWidth*.25), yPos+10);
							ctx2.fillText("G:"+closedList[i].g, xPos+(tileWidth*.66), yPos+10);
							ctx2.fillText("F:"+closedList[i].f.toFixed(0), xPos+(tileWidth*.5), yPos+(tileHeight*.88));
						}
					}
				}
				
			}//outer if
			
			
			if(fileMap[x][y]==7){
				if(closedList!=null){
					for(var i=0;i<closedList.length;i++){
						if((closedList[i].x==x)&&(closedList[i].y==y)){
							var xPos=closedList[i].x*tileWidth;
							var yPos=closedList[i].y*tileHeight;
							ctx2.fillText("H:"+closedList[i].h.toFixed(0), xPos+(tileWidth*.25), yPos+10);
							ctx2.fillText("G:"+closedList[i].g, xPos+(tileWidth*.66), yPos+10);
							ctx2.fillText("F:"+closedList[i].f.toFixed(0), xPos+(tileWidth*.5), yPos+(tileHeight*.88));
						}
					}
				}	
			}//outer if
		}//for y
	}//for x
	
	}//if(fileWidth!=0)
	
}//draw


/**
*Used by A* to step through the path.
*/
function redraw2()
{
	
	var tracker1=1; //starts at 1 b/c storedMap[0] is undefined or empty -- we used push().
	var i=0;
	var i2=1000; //1 sec delay
	while(i<storedMaps.length-1){
	setTimeout(function(){
		
		fileMap=storedMaps[tracker1];
		redraw();
		tracker1++;
		
		}, i2);
		i2+=300;
		i++;
	}
	
}//redraw2
	

/**
*Store the changes that we make to fileMap, so
*we can step through the changes.
*/	
function storeChanges(){
		
		var copiedMap=[];
		
		for (var x=0; x < fileWidth; x++)
		{
			copiedMap[x] = [];
		
			for (var y=0; y < fileHeight; y++)
			{
				copiedMap[x][y]=fileMap[x][y];
			}
		}
		storedMaps.push(copiedMap);
		
	}//storeChanges
	
	
/**
*Cleans the map by removing everything. Also resets the lists and sets the value 
*on placeObs/Start/Goal, so user will not accidentally create them.
*/
function cleanFileMap(){
		
		placeObs=false;
		placeStart=false;
		placeGoal=false;
		
		openList=[];
		closedList=[];
		finalPath=[]; 
		storedMaps=[[]];
		
		for (var x=0; x < fileWidth; x++){
			for (var y=0; y < fileHeight; y++){
				if(fileMap[x][y]!=1){
				fileMap[x][y] = 0;
				}
			}
		}
		
	}//cleanFileMap

	
/**
*Selects a heuristic from the drop-down menu.
*/
function selectHeuristic(){
var HL=document.getElementById("HeuristicList");
var chosenH=HL.options[HL.selectedIndex].text;
if(chosenH=="Manhattan Distance"){
changeToMD();
}
else if(chosenH=="Euclidean Distance"){
changeToEu();
}
else if(chosenH=="Chebyshev Distance"){
changeToMD();
}

}//selectHeuristic
	

/**
*Changes the heuristic value to use Manhattan distance.
*/
function changeToMD(){
		
		heuristics=0;
		
	}//changeToMD

	
/**
*Changes the heuristic value to use Euclidean distance.
*/
function changeToEu(){
		
		heuristics=1;
		
	}//changeToEu

	
/**
*Changes the heuristic value to use Chebyshev distance.
*/
function changeToCD(){
		
		heuristics=2;
		
	}//changeToCD
		
	
/**
*Gets value for the height and width and creates a new map/world.
*
*@param form The HTML form where user inputs a value for the world's dimensions.
*/
function setWH(form){
	
	var WH=form.inputbox.value;
	
	if((!isNaN(WH))&&(WH!="")){ //"" = an empty string
	fileWidth=WH;
	fileHeight=WH;
	
	createWorld();
	}
	else{
		alert("Please input a number.")
	}
	
}//setWH

/**
*Gets RRT kStep value from user and starts the RRT algorithm.
*
*@param form The HTML form where user inputs a value for kStep.
*/
function setWH2(form){
	
	var WH=form.inputbox2.value;
	
	if((WH!=undefined)&&(WH>0)&&(!isNaN(WH))){
	kStep=WH;
	RRT();
	}
	else{
		alert("Please enter a number greater than 0.")
	}

}//setWH2
	

/**
*Creates an obstacle/tree on the map.
*
*@param x The x position where we will draw the tree.
*@param y The y position where we will draw the tree.
*/
function createObs(x, y){
	
	fileMap[x][y]=1;
	redraw();
	
}//createObs


/**
*Creates the starting position or goblin and replaces the old position.
*
*@param x The x position where we will draw the goblin.
*@param y The y position where we will draw the goblin.
*/
function createHome(x, y){

	oldStartX=startX;
	oldStartY=startY;
	
	if((oldStartX<fileWidth)&&(oldStartY<fileHeight)&&(fileMap[oldStartX][oldStartY]==6)){ //prevents out of bounds error & overwriting issues
	fileMap[oldStartX][oldStartY]=0; //turns back to grass
	}
	
	fileMap[x][y]=6;
	redraw();
	
}//createHome


/**
*Creates the goal/flower and replaces the old goal.
*
*@param x The x position where we will draw the flower.
*@param y The y position where we will draw the flower.
*/
function createGoal(x, y){

	oldEndX=endX;
	oldEndY=endY;
	
	if((oldEndX<fileWidth)&&(oldEndY<fileHeight)&&(fileMap[oldEndX][oldEndY]==3)){//prevents out of bounds error & overwriting issues
	fileMap[oldEndX][oldEndY]=0; //turns back to grass
	}
	
	fileMap[x][y]=3;
	redraw();
	
}//createGoal


/**
*Enables user to draw starting position/goblin. 
*This function is used by the HTML button.
*/
function startLoc(){
	
		placeStart=true;
		placeGoal=false;
		placeObs=false;
	
}//startLoc

/**
*Enables user to draw the goal/flower.
*This function is used by the HTML button.
*/
function endLoc(){
	
		placeGoal=true;
		placeObs=false;
		placeStart=false;
	
}//endLoc


/**
*Enables user to draw objstacles/trees.
*This function is used by the HTML button.
*/
function obsLoc(){
	
		placeObs=true;
		placeStart=false;
		placeGoal=false;
	
}//obsLoc


/**
*Draws a pregenerated map.
*/	
function map1(){
	
	//resets
	finalPath=[];
	openList=[];
	closedList=[];
	fileMap=[];
	
	fileWidth=8;
	fileHeight=8;
	
	canvas2.width=fileWidth * tileWidth;
	canvas2.height=fileHeight * tileHeight;
	
	//create empty fileMap
	for (var x=0; x < fileWidth; x++)
	{
		fileMap[x] = [];
		
		for (var y=0; y < fileHeight; y++)
		{
			fileMap[x][y] = 0;
		}
	}

			fileMap[3][3] = 1;
			fileMap[3][4] = 1;
			fileMap[3][2] = 1;
	
	redraw();

}//map1


/**
*Draws a pregenerated map.
*/
function map2(){

	//resets
	finalPath=[];
	openList=[];
	closedList=[];
	fileMap=[];
	
	fileWidth=12;
	fileHeight=12;
	
	canvas2.width=fileWidth * tileWidth;
	canvas2.height=fileHeight * tileHeight;
	
	//create empty fileMap
	for (var x=0; x < fileWidth; x++)
	{
		fileMap[x] = [];
		
		for (var y=0; y < fileHeight; y++)
		{
			fileMap[x][y] = 0;
		}
	}
	
			fileMap[3][3] = 1;
			fileMap[3][4] = 1;
			fileMap[3][2] = 1;
			fileMap[4][5] = 1;
			fileMap[4][6] = 1;
			fileMap[4][7] = 1;
			fileMap[2][3] = 1;
			fileMap[1][4] = 1;
			fileMap[0][2] = 1;
			fileMap[6][5] = 1;
			fileMap[6][6] = 1;
			fileMap[8][7] = 1;
	
	redraw();
	
}//map2


/**
*Draws a pregenerated map.
*/
function map3(){
	
	//resets
	finalPath=[];
	openList=[];
	closedList=[];
	fileMap=[];
	
	fileWidth=15;
	fileHeight=15;
	
	canvas2.width=fileWidth * tileWidth;
	canvas2.height=fileHeight * tileHeight;
	
	//create empty fileMap
	for (var x=0; x < fileWidth; x++)
	{
		fileMap[x] = [];
		
		for (var y=0; y < fileHeight; y++)
		{
			fileMap[x][y] = 0;
		}
	}
		
			fileMap[4][6] = 1;
			fileMap[4][7] = 1;
			fileMap[2][3] = 1;
			fileMap[1][4] = 1;
			fileMap[0][2] = 1;
			fileMap[6][5] = 1;
			fileMap[6][6] = 1;
			fileMap[8][7] = 1;
			
			fileMap[3][0] = 1;
			fileMap[7][5] = 1;
			fileMap[8][5] = 1;
			fileMap[9][5] = 1;
			
			fileMap[11][5] = 1;
			fileMap[12][5] = 1;
			fileMap[11][4] = 1;
			fileMap[11][3] = 1;
			
			fileMap[11][5] = 1;
			fileMap[12][6] = 1;
			fileMap[12][7] = 1;
			fileMap[12][8] = 1;
			fileMap[12][9] = 1;
			fileMap[12][10] = 1;
			fileMap[12][11] = 1;
			
			fileMap[10][3] = 1;
			fileMap[9][3] = 1;
			fileMap[8][3] = 1;
			fileMap[7][3] = 1;
			fileMap[12][9] = 1;
			fileMap[12][10] = 1;
			fileMap[12][11] = 1;
	
	redraw();

}//map3

	
/**
*Randomizes the map by adding obstacles/trees to random positions.
*/
function randomize(){
	
	randomMap=true;
	createWorld();
	
}//randomize


/**
*Adds the sprites for the starting and goal position
*to the stored maps for beautification and/or visual purposes.
*/
function addStartGoalSprites(){
		
		for(var z=1; z< storedMaps.length;z++){
			
			storedMaps[z][startX][startY]=6;
			storedMaps[z][endX][endY]=3;
			
		}
		
	}//addStartGoalSprites
