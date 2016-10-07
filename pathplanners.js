
/*
Implementation for A*, Rapidly exploring Random Tree, Best First Search, 
and Dijkstra can be found here.


Sources:
I wrote the A* function myself based on the guide found on this 
website: http://www.policyalmanac.org/games/aStarTutorial.htm

My GUI is taken from/based off of the following websites:
http://buildnewgames.com/astar/   <---Got the gui from here.
https://jsfiddle.net/nDVYd/778/     <---Got file selection/browser codes from here, but did the parsing myself.
https://www.youtube.com/watch?v=rUjiGOct808      <---For helping with the drop-down menu.
*/



/**
*This is our A* algorithm. We reset, calculate, and store the changes
*before redrawing the canvas to show the user what goes on step-by-step.
*
*@return undefined Exits function if out of bounds error detected.
*/
function Astar() {
	
		if((endX>=fileWidth)||(endY>=fileHeight)|| //prevents an out of bounds error
		(startX>=fileWidth)||(startY>=fileHeight)){
			return;
		}
		
		cleanFileMap(); //clean and resets the lists
		
		//initialization
		var minNode=node(null, startX, startY); //This is the starting node and also our working/current node. 1 of algorithm: http://www.policyalmanac.org/games/aStarTutorial.htm
		minNode.f=999999; //This way we will switch out of the starting node. This is the f value in f=h+g. larger f= farther away from goal
		openList=[minNode]; //adds it to the open list
		var minF=minNode.f; //the lowest f value.
		
		var lowestFinOpenList=openList[0].f;
		var lowestFinOpenListNode=openList[0];
		var oldMinNodeX=minNode.x;
		var oldMinNodeY=minNode.y;
		var openListPos=-1; //used to keep track of position in openList to splice/remove
		var thisCase=false; //used to keep track of different cases that may arise
		
		while(true){

			lowestFinOpenList=openList[0].f;
			lowestFinOpenListNode=openList[0];
			oldMinNodeX=minNode.x;
			oldMinNodeY=minNode.y;
			openListPos=-1; 			
			thisCase=false;
			
		for(var i=0; i<openList.length;i++){ //2a  --look for the node w/lowest f cost in open list
			if(openList[i].f<=minF){
				minNode=openList[i];
				openListPos=i;
				
				minF=openList[i].f;
			}
		}
		
		if((minNode.x==oldMinNodeX)&&(minNode.y==oldMinNodeY)){ //if the same node like the previous
			for(var i=0; i<openList.length;i++){
				if(openList[i].f<=lowestFinOpenList){
				lowestFinOpenList=openList[i].f;
				minNode=openList[i];
				openListPos=i;
				thisCase=true;
				}
			}
		}
		
		if(thisCase==false){
		closedList.push(minNode); //2b switch it to the closed list
		openList.splice(openListPos, 1); //removes from openList b/c it is getting processed
		fileMap[minNode.x][minNode.y]=7;
		
		storeChanges();
		}
		else{
		closedList.push(minNode); //2b
		openList.splice(openListPos, 1); //removes from openList b/c it is getting processed
		fileMap[minNode.x][minNode.y]=7;
		
		storeChanges();
		}
			
		if((minNode.x==endX)&&(minNode.y==endY)){  //2d---ends when minNode/CurrentNode gets added to closed list
		
			addStartGoalSprites(storedMaps);
		
			fileMap[minNode.x][minNode.y]=3; 
			
			finalPath.push(minNode);
			while(minNode.parentNode!=null){
				finalPath.push(minNode.parentNode);
				minNode=minNode.parentNode;
			}
					
			//flower spawns a butterfly to guide goblin
			for(var i=0;i<finalPath.length-2;i++){
				if(i<finalPath.length-3){
				fileMap[finalPath[i+1].x][finalPath[i+1].y]=2;
				}
				fileMap[finalPath[i+2].x][finalPath[i+2].y]=8;
				
				fileMap[startX][startY]=6;
				
				storeChanges();
			}
			
			//path chosen - goblin follows butterfly to flower
			finalPath.reverse();
		
			for(var i=0;i<finalPath.length-1;i++){
				
				fileMap[finalPath[i].x][finalPath[i].y]=4;
				
				if(i<finalPath.length-2){
				fileMap[finalPath[i+1].x][finalPath[i+1].y]=6;
				}
				if(i<finalPath.length-3){
				fileMap[finalPath[i+2].x][finalPath[i+2].y]=8;
				}
				
				storeChanges();
			}
			
			fileMap[finalPath[finalPath.length-1].x][finalPath[finalPath.length-1].y]=9;
			storeChanges(storedMaps);
			
			redraw2();
			break;
		}
		
		//2c 
		var workingNodeNeighbors=findNeighbors(minNode.x, minNode.y); //gets valid neighbors or walkables

		for(var i2=0;i2<workingNodeNeighbors.length;i2++){ //add neighbors to openList
		
			var wnnX=workingNodeNeighbors[i2].x;
			var wnnY=workingNodeNeighbors[i2].y;
			
			var inCLalready=false;  //check to see if it's in the closed list
			for(var i3=0;i3<closedList.length;i3++){
				if((closedList[i3].x==wnnX)&&(closedList[i3].y==wnnY)){
					inCLalready=true;
				}
			}
			
			var inOLalready=false; //checks to see if in openList
			for(var i3=0;i3<openList.length;i3++){
				if((openList[i3].x==wnnX)&&(openList[i3].y==wnnY)){
					inOLalready=true;
					
					var newG=openList[i3].g+minNode.g;
					if(newG<minNode.g){
						openList[i3].parentNode=minNode;
						openList[i3].g=newG;
						openList[i3].f=newG+openList[i3].h;
					}
				}
			}

			if((inOLalready==false)&&(inCLalready==false)){ //add working node neighbors to OpenList
			workingNodeNeighbors[i2].parentNode=minNode;
			workingNodeNeighbors[i2].g=1+minNode.g; //we will make the cost 1, if we make it higher, we will need to scale mDistance
			workingNodeNeighbors[i2].h=getDistance(wnnX, wnnY, endX, endY);
			workingNodeNeighbors[i2].f=workingNodeNeighbors[i2].g+workingNodeNeighbors[i2].h;
			openList.push(workingNodeNeighbors[i2]);
			fileMap[wnnX][wnnY]=5;
			
			storeChanges();
			}
		}
		
		}//while
	}//Astar - A*


/**
*This is our Rapidly exploring Random Tree algorithm. We reset, calculate, and 
*store the changes before redrawing the final path.
*
*@return undefined Exits function if out of bounds error detected.
*/
function RRT(){
		
	if((endX>=fileWidth)||(endY>=fileHeight)|| //prevents an out of bounds error
		(startX>=fileWidth)||(startY>=fileHeight)){
			return;
		}
	
	cleanFileMap();
	
	//initialization
	var rrtList=[];
	var startNode=node(null, startX, startY);
	rrtList.push(startNode);
	var closestNode=rrtList[0];  //q-nearest, closest known Node to random point
	var distanceToRNode=-1; //distance to random node/point that we spawn
	
	//random point/sample in search space. This is q-random.
	var rX=-1;
	var rY=-1;
	
	while(true){
		
		//if path is found
		if((closestNode.x==endX)&&(closestNode.y==endY)){
	
			var parentNode2=closestNode.parentNode;
			finalPath.push(parentNode2);
			
			while(parentNode2.parentNode!=null){
				finalPath.push(parentNode2.parentNode);
				parentNode2=parentNode2.parentNode;
			}
			
			finalPath.reverse();
	
			for(var i=0;i<finalPath.length;i++){
				
				fileMap[finalPath[i].x][finalPath[i].y]=4;
			}
			fileMap[closestNode.x][closestNode.y]=9;
		
			redraw();
			
			break;
		}
		
		
	//random point/sample in search space. This is q-random.
	rX=Math.floor((Math.random() * fileWidth));
	rY=Math.floor((Math.random() * fileHeight));
	
	if(fileMap[rX][rY]!=1){ //Checks to make sure it's a valid point. Not neccessary, but don't I don't want it to draw over the obstacles/trees.
		fileMap[rX][rY]=7;//I will make the grey tiles the random nodes that spawned
	}
	
	//find closest Node to the random Node
	distanceToRNode=getDistance(closestNode.x, closestNode.y, rX, rY);
	var distanceToRNode2;
	for(var i=0;i<rrtList.length;i++){
		distanceToRNode2=getDistance(rrtList[i].x, rrtList[i].y, rX, rY);
		if(distanceToRNode2<distanceToRNode){
			distanceToRNode=distanceToRNode2;
			closestNode=rrtList[i];
		}
	}
	
	//extend/create kStep nodes towards the random node if possible
		for(var i=0;i<kStep;i++){ //find neighbors
			var closestNodeNeighbor=[];
			var cnNeighbors=findNeighbors(closestNode.x, closestNode.y);
			
			var cnnDistanceToRN=distanceToRNode; //distance of neighbor that is closest to random node/point
			
			for(var i2=0;i2<cnNeighbors.length;i2++){ //find the neighbor with the lowest distance to the random node
				var cnnDistanceToRN2=mDistance(cnNeighbors[i2].x, cnNeighbors[i2].y, rX, rY); //temp distance of neighbor
				if(cnnDistanceToRN2<cnnDistanceToRN){
					cnnDistanceToRN=cnnDistanceToRN2;
					closestNodeNeighbor=cnNeighbors[i2]; //k step neighbor with the lowest distance to randomNode
				}
				
				fileMap[cnNeighbors[i2].x][cnNeighbors[i2].y]=5;
			}
			
			if(cnnDistanceToRN<distanceToRNode){ //make that neighbor the new node and add it to rrtList and update it's parent node
				closestNodeNeighbor.parentNode=closestNode; //q-new
				rrtList.push(closestNodeNeighbor);
				closestNode=closestNodeNeighbor;//the new node is now the closest node to the random node
			}
		}//end kStep for loop
		
	
	}//while
}//RRT
	

/**
*This is our Best First Search algorithm. We reset, calculate, and 
*store the changes before redrawing the final path.
*
*@return undefined Exits function if out of bounds error detected.
*/	
function BFS(){
		
		if((endX>=fileWidth)||(endY>=fileHeight)|| //prevents an out of bounds error
		(startX>=fileWidth)||(startY>=fileHeight)){
			return;
		}
		
		cleanFileMap(); //clean and resets the lists
		
		var minNode=node(null, startX, startY); //our working/current node
		minNode.g=999999;
		openList=[minNode];  //1 of algorithm:
		var minH=minNode.h;
		
		var lowestHinOpenList=openList[0].h;
		var lowestHinOpenListNode=openList[0];
		var oldMinNodeX=minNode.x;
		var oldMinNodeY=minNode.y;
		var openListPos=-1;
		var thisCase=false;
		
		while(true){
			
			lowestHinOpenList=openList[0].h;
			lowestHinOpenListNode=openList[0];
			oldMinNodeX=minNode.x;
			oldMinNodeY=minNode.y;
			openListPos=-1;
			thisCase=false;
			
		for(var i=0; i<openList.length;i++){ //look for lowest H cost in open list
			if(openList[i].h<=minH){
				minNode=openList[i];
				openListPos=i;
				minH=openList[i].h;
			}
		}
		
		if((minNode.x==oldMinNodeX)&&(minNode.y==oldMinNodeY)){//if same node like previous 
			for(var i=0; i<openList.length;i++){
				if(openList[i].h<=lowestHinOpenList){
				lowestHinOpenList=openList[i].h;
				minNode=openList[i];
				openListPos=i;
				thisCase=true;
				}
			}
		}
		
		//removes from openList
		if(thisCase==false){
		closedList.push(minNode); 
		openList.splice(openListPos, 1); //removes from openList b/c it is getting processed
		fileMap[minNode.x][minNode.y]=7;
		}
		else{
			closedList.push(minNode); 
		openList.splice(openListPos, 1); //removes from openList b/c it is getting processed
		fileMap[minNode.x][minNode.y]=7;
		}

		if((minNode.x==endX)&&(minNode.y==endY)){  //ends when minNode/CurrentNode gets added to closed list
			fileMap[minNode.x][minNode.y]=9;
			
			var parentNode2=minNode.parentNode;
			finalPath.push(parentNode2);
			
			while(parentNode2.parentNode!=null){
				finalPath.push(parentNode2.parentNode);
				parentNode2=parentNode2.parentNode;
			}
			
			finalPath.reverse();
			for(var i=0;i<finalPath.length;i++){
				fileMap[finalPath[i].x][finalPath[i].y]=4;
			}
			
			redraw();
			break;
		}
		
		//finds neighbors
		var workingNodeNeighbors=findNeighbors(minNode.x, minNode.y); //gets valid neighbors or walkables
	
		for(var i2=0;i2<workingNodeNeighbors.length;i2++){ //add neighbors to openList
			var wnnX=workingNodeNeighbors[i2].x;
			var wnnY=workingNodeNeighbors[i2].y;

			var inCLalready=false;  //check to see if it's in the closed list
			for(var i3=0;i3<closedList.length;i3++){
				if((closedList[i3].x==wnnX)&&(closedList[i3].y==wnnY)){
					inCLalready=true;
				}
			}
			
			var inOLalready=false; //checks to see if in openList
			for(var i3=0;i3<openList.length;i3++){
				if((openList[i3].x==wnnX)&&(openList[i3].y==wnnY)){
					inOLalready=true;
				}
			}
			
			if((inOLalready==false)&&(inCLalready==false)){ //add working node neighbors to OpenList
			workingNodeNeighbors[i2].parentNode=minNode;//record parent
			workingNodeNeighbors[i2].h=getDistance(wnnX, wnnY, endX, endY);//evaluate H
			openList.push(workingNodeNeighbors[i2]); //add to openList
			fileMap[wnnX][wnnY]=5;
			}
		}
		
		}//while
		
	}//BFS


/**
*This is our Dijkstra algorithm. We reset, calculate, and 
*store the changes before redrawing the final path.
*
*@return undefined Exits function if out of bounds error detected.
*/	
function Dijkstra(){
		
		if((endX>=fileWidth)||(endY>=fileHeight)|| //prevents an out of bounds error
		(startX>=fileWidth)||(startY>=fileHeight)){
			return;
		}
		
		cleanFileMap();//cleans and resets the lists

		var minNode=node(null, startX, startY);// this is our working/current node
		minNode.g=999999;
		openList=[minNode];  //1 of algorithm:  http://www.policyalmanac.org/games/aStarTutorial.htm		
		var minG=minNode.g;
		
		var lowestGinOpenList=openList[0].g; 
		var lowestGinOpenListNode=openList[0];
		var oldMinNodeX=minNode.x;
		var oldMinNodeY=minNode.y;
		var openListPos=-1;
		var thisCase=false;
	
		while(true){
			
		lowestGinOpenList=openList[0].g; 
		lowestGinOpenListNode=openList[0];
		oldMinNodeX=minNode.x;
		oldMinNodeY=minNode.y;
		openListPos=-1;
		thisCase=false;
			
		for(var i=0; i<openList.length;i++){  //makes the minNode/CurrentNode the lowest G in the openList
			if(openList[i].g<=minG){
				minNode=openList[i];
				openListPos=i;
				
				minG=openList[i].g;
				thisCase=false;
			}
		}
		
		if((minNode.x==oldMinNodeX)&&(minNode.y==oldMinNodeY)){
			for(var i=0; i<openList.length;i++){
				if(openList[i].g<=lowestGinOpenList){
				lowestGinOpenList=openList[i].g;
				minNode=openList[i];
				
				openListPos=i;
				thisCase=true;
				}
			}
		}
		
		if(thisCase==false){
		closedList.push(minNode); //2b
		openList.splice(openListPos, 1); //removes from openList b/c it is getting processed
		fileMap[minNode.x][minNode.y]=7;
		}
		else{
		closedList.push(minNode); //2b
		openList.splice(openListPos, 1); //removes from openList b/c it is getting processed
		fileMap[minNode.x][minNode.y]=7;
		}

	
		
		
		if((minNode.x==endX)&&(minNode.y==endY)){  //ends when minNode/CurrentNode gets added to closed list
			fileMap[minNode.x][minNode.y]=9;
			
			var parentNode2=minNode.parentNode;
			finalPath.push(parentNode2);
			
			while(parentNode2.parentNode!=null){
				finalPath.push(parentNode2.parentNode);
				parentNode2=parentNode2.parentNode;
			}
			
			finalPath.reverse();
			for(var i=0;i<finalPath.length;i++){
				fileMap[finalPath[i].x][finalPath[i].y]=4;
			}
			
			redraw();
			break;
		}
		

		var workingNodeNeighbors=findNeighbors(minNode.x, minNode.y); //gets valid neighbors or walkables
	
		for(var i2=0;i2<workingNodeNeighbors.length;i2++){ //add neighbors to openList
			var wnnX=workingNodeNeighbors[i2].x;
			var wnnY=workingNodeNeighbors[i2].y;
			
			var inCLalready=false;  //check to see if it's in the closed list
			for(var i3=0;i3<closedList.length;i3++){
				if((closedList[i3].x==wnnX)&&(closedList[i3].y==wnnY)){
					inCLalready=true;
				}
			}
	
			var inOLalready=false; //checks to see if in openList
			for(var i3=0;i3<openList.length;i3++){
				if((openList[i3].x==wnnX)&&(openList[i3].y==wnnY)){
					inOLalready=true;
					
					var newG=openList[i3].g+minNode.g;
					if(newG<minNode.g){
						openList[i3].parentNode=minNode;
						openList[i3].g=newG;
					}	
				}
			}
			
			if((inOLalready==false)&&(inCLalready==false)){ //add working node neighbors to OpenList
			workingNodeNeighbors[i2].parentNode=minNode;
			workingNodeNeighbors[i2].g=1+minNode.g; //we will make the cost 1, if we make it higher, we will need to scale mDistance
			openList.push(workingNodeNeighbors[i2]);
			fileMap[wnnX][wnnY]=5;
			}
			
		}
		
		}//while
		
	}//Dijkstra
	