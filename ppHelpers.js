
/*
This script contains the helper functions for the 
path planning algorithms.

Sources:
I wrote the A* function myself based on the guide found on this 
website: http://www.policyalmanac.org/games/aStarTutorial.htm

My GUI is taken from/based off of the following websites:
http://buildnewgames.com/astar/   <---Got the gui from here.
https://jsfiddle.net/nDVYd/778/     <---Got file selection/browser codes from here, but did the parsing myself.
https://www.youtube.com/watch?v=rUjiGOct808      <---For helping with the drop-down menu.
*/



/**
*We will represent the tiles/positions of the world that we
*looked at as a node. This function creates an object 
*to store the information of those positions.
*
*@param pNode This is the parent node
*@param currentNodeX This node's X location
*@param currentNodeY This node's Y location 
*@return node Returns this node object
*/
function node(pNode, currentNodeX, currentNodeY){
	
	var newNode={
	
	parentNode:pNode,
	x:currentNodeX,
	y:currentNodeY,
	
	g:0,
	h:0,
	f:0,
	
	}
	
	return newNode;
	
}//node


/**
*Calculates the Manhattan distance.
*
*@param x The current/working node's x position.
*@param y The current/working node's y position.
*@param gX The goal/flower's x position.
*@param gY The goal/flower's y position. 
*@return number Returns calculated result. 
*/
function mDistance(x, y, gX, gY){  //Manhattan Distance
	
		return Math.abs(x - gX) + Math.abs(y - gY);
		
	}//mDistance
	
	
/**
*Calculates the Euclidean distance.
*
*@param x The current/working node's x position.
*@param y The current/working node's y position.
*@param gX The goal/flower's x position.
*@param gY The goal/flower's y position. 
*@return number Returns calculated result. 
*/	
function eDistance(x, y, gX, gY){ //Euclidean Distance	
	
		return Math.sqrt(Math.pow(x - gX, 2) + Math.pow(y - gY, 2));
		
}//eDistance

	
/**
*Calculates the Chebyshev distance.
*
*@param x The current/working node's x position.
*@param y The current/working node's y position.
*@param gX The goal/flower's x position.
*@param gY The goal/flower's y position.
*@return number Returns calculated result.  
*/	
function cDistance (x, y, gX, gY){
		
		return Math.max(Math.abs(x-gX), Math.abs(y-gY));
		
	}//cDistance
	

/**
*Finds the neighboring tiles/positions of the current/working node.
*We do not travel diagonally, so diagonals are not considered neighbors.
* 
*@param x The current/working node's x position.
*@param y The current/working node's y position.
*@return validNeighbors[] Returns an array of neighbors.
*/	
function findNeighbors(x, y){ //returns an array obj with x and y values
		
		var N=y-1;
		var E=x+1;
		var S=y+1;
		var W=x-1;
		
		var validNeighbors=[];
		
		if((N>-1) && (fileMap[x] != null) && (fileMap[x][N]!=null) && (fileMap[x][N]!=1)){  //checks if out of bounds or obstacle
		
			var nNode=node(null, x, N);
			validNeighbors.push(nNode);
		}
		if((E<fileWidth)&& (fileMap[E] != null) && (fileMap[E][y]!=null) && (fileMap[E][y]!=1)){
			
			var nNode=node(null, E, y);
			validNeighbors.push(nNode);
		}
		if((S<fileHeight)&&(fileMap[x] != null) && (fileMap[x][S]!=null) && (fileMap[x][S]!=1)){

			var nNode=node(null, x, S);
			validNeighbors.push(nNode);
		}
		if((W>-1) && (fileMap[W] != null) && (fileMap[W][y]!=null) && (fileMap[W][y]!=1)){
			
			var nNode=node(null, W, y);
			validNeighbors.push(nNode);
		}
		
		return validNeighbors;
		
	}//findNeighbors


	
/**
*Gets the distance depending on whether the heuristic selected.
*
*@return number Returns the calculated distance. 
*/	
function getDistance(x, y, gX, gY){
		
		var theDistance=-1;
		
		if(heuristics==0){
			theDistance=mDistance(x,y, gX, gY);
		}
		else if(heuristics==1){
			theDistance=eDistance(x,y,gX,gY);
		}
		else if(heuristics==2){
			theDistance=cDistance(x,y,gX,gY);
		}
		
		return theDistance;
	}//getDistance

	
	
	
	
