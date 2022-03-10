const gridElt = document.querySelector('.grid')
const attackerPanelElt = document.querySelector('.attackerPanel')
const targetPanelElt = document.querySelector('.targetPanel')
const messageBoardElt = document.querySelector('.messageBoard')
const gridWidth = 10 //number of cells on x axis
const gridHeight = 9 //number of cells on y axis
const cellsArray = [] //to hold the div after we initialize them

/*
document.documentElement.style.getPropertyValue('--cellWidth') returns something only if it has been set via document.documentElement.style.setPropertyValue.
It returns undefined if it has been set through CSS
 you have to make use of the getComputedStyle()method , before calling .getPropertyValue()
 */
const cellWidth = parseFloat(getComputedStyle(document.documentElement,null).getPropertyValue('--cellWidth')) //the width of each cell, the value is set in style.css with a custom property --cellWidth
const cellHeight = parseFloat(getComputedStyle(document.documentElement,null).getPropertyValue('--cellHeight')) //parseFloat('80px') returns 80


/*------------------------------------------------------------------------------------------------
populate the grid with containers
--------------------------------------------------------------------------------------------------
*/

for (let i = 0; i < gridWidth * gridHeight; i++) {
    const containerCell = createContainerCell(i)
    cellsArray.push(containerCell)
}

//The container have coordinate x[1..10] and y[1..10]
//The container are stored in cellsArray [0..99] with an index
function convertCoordinateToIndex(x,y){ // helper function to compute index from coordinate x and y
    const i = (x-1)*gridWidth + (y-1)
    return i
}

function convertIndexToCoordinate(i){ // helper function to compute  coordinate x and y from index
    const x = 1 + Math.floor(i/gridWidth)
    const y = 1 + i%gridWidth
    return {x:x,y:y}
}

/*
we create div container for display purpose on the grid. A container contains various sub div, each div will be in charge of displaying a visual effect
<div class="container">
   <div class="cellTile"></div>
   <div class="cellHighlight highlightMove"></div>
   <div class="cellTank blueTrooper1 blue"></div>
   <div class="cellTurret blueTrooper1 blue" style="--turretAngle: NaNdeg;"></div>
   <div class="cellEffect"></div>
   <div class="cell" id="21">21 (3:2)</div>
</div>
*/
function createContainerCell(i) {
    const containerCell = createCell('div','container',gridElt)
    createCell('div','cellTile',containerCell)
    createCell('div','cellProp',containerCell)
    createCell('div','cellHighlight',containerCell)//to display cell highlighting, ex: to show where to move or attack
    createCell('div','cellTank',containerCell) //to show the body of the tank
    const cellTurretElt = createCell('div','cellTurret',containerCell) //to show the turret, so it can rotate independantly from the body
    createCell('div','cellFlame',cellTurretElt)
    createCell('div','cellEffect',containerCell)//to display explosion
    const cell = createCell('div','cell',containerCell)
    cell.id = i //i is the index of the container in cellsArray
    const x = convertIndexToCoordinate(i).x
    const y = convertIndexToCoordinate(i).y
    cell.innerText = `${i} (${x}:${y})` //for debugging purpose
    return containerCell
}

function createCell(cellType='div', cellClass,eltToAppendTo){ //create a cell with a given type, class, and append it as a child to another elt
    const cell = document.createElement(cellType)
    cell.classList.add(cellClass)
    eltToAppendTo.appendChild(cell)
    return cell
}


/*------------------------------------------------------------------------------------------------
add tiles
--------------------------------------------------------------------------------------------------
*/
const normalTiles = document.querySelectorAll('.cellTile')
normalTiles.forEach(tile => {
    const random = Math.floor(Math.random()*2)
    if(random%2===0){tile.classList.add('tile_01')}
    else{tile.classList.add('tile_02')}
})

document.getElementById(0).parentNode.querySelector('.cellProp').classList.add('edgeTopLeft')
document.getElementById(gridWidth - 1).parentNode.querySelector('.cellProp').classList.add('edgeTopRight')
document.getElementById(gridWidth*(gridHeight-1)).parentNode.querySelector('.cellProp').classList.add('edgeBottomLeft')
document.getElementById(gridWidth*gridHeight - 1).parentNode.querySelector('.cellProp').classList.add('edgeBottomRight')

const propTiles = document.querySelectorAll('.cellProp')

for(let i=1 ; i < gridWidth -1; i++){

    document.getElementById(i).parentNode.querySelector('.cellProp').classList.add('edgeTop')
}

for(let i=1 ; i < gridWidth -1; i++){
    const j = i + gridWidth*(gridHeight-1)

    document.getElementById(j).parentNode.querySelector('.cellProp').classList.add('edgeBottom')
}

for(let i=1 ; i < gridHeight -1; i++){
    j = i*10
    document.getElementById(j).parentNode.querySelector('.cellProp').classList.add('edgeLeft')
}

for(let i=1 ; i < gridHeight -1; i++){
    j = i*10 + gridWidth -1
    document.getElementById(j).parentNode.querySelector('.cellProp').classList.add('edgeRight')
}

/*------------------------------------------------------------------------------------------------
trooper class
--------------------------------------------------------------------------------------------------
*/

class Trooper{
    constructor(x,y,army,name,moveRange, fireRange, health,strength){
        this.x = x
        this.y = y
        this.army = army //ex: blue, red
        this.name = name //ex: blueTrooper1, blueTrooper2, redTrooper1, redTrooper2. This is used to set class to element. It has to correspond to the css predefined values.
        this.moveRange = moveRange
        this.fireRange = fireRange
        this.health = health //how much damage the tank takes before dying
        this.strength = strength //how much damage the take outputs
        this.reachableCellsArray = [] //where the tank can move during move phase, computed from current (x,y) and moveRange
        this.fireCellsArray = [] //where the tank can shoot during shoot phase,  computed from current (x,y) and fireRange
    }
    getIndex(){ //return index to be used in cellsArray corresponding to coordinate (x,y)
        const index = convertCoordinateToIndex(this.x, this.y)
        return index
    }
    showOnMap(){ //displaying on the grid is based on tags in containers of cellsArray and the corresponding css.
        console.log('show on map')
        const index = this.getIndex()
        cellsArray[index].querySelector('.cellTank').classList.add(this.name)
        cellsArray[index].querySelector('.cellTurret').classList.add(this.name)
        cellsArray[index].querySelector('.cellTank').classList.add(this.army)
        cellsArray[index].querySelector('.cellTurret').classList.add(this.army)
    }

    removeFromMap(){
        console.log('remove from map')
        const index = this.getIndex()
        cellsArray[index].querySelector('.cellTank').classList.remove(this.name)
        cellsArray[index].querySelector('.cellTurret').classList.remove(this.name)
        cellsArray[index].querySelector('.cellTank').classList.remove(this.army)
        cellsArray[index].querySelector('.cellTurret').classList.remove(this.army)
        //we assume that the move phase has ended and we reset the --turretAngle, otherwise the previous cell of a tank will be still shown with an angle
        cellsArray[index].querySelector('.cellTurret').style.removeProperty('--turretAngle')

    }

    computeNextMoveCells(){ //compute the possible cells reachable by the tank according to its current coordinate (x,y) and its moving range
        const reachableCellsArray = []
        const reachableIndexArray = []
        for( let i = this.x - this.moveRange  ; i <= this.x + this.moveRange ; i++){
            for (let j = this.y - this.moveRange ; j <= this.y + this.moveRange ; j++){
                const index = convertCoordinateToIndex(i, j)
                if(index >=0 && index < cellsArray.length){reachableCellsArray.push(cellsArray[index])}
            }
        }
        this.reachableCellsArray = reachableCellsArray
        reachableCellsArray.forEach(cell => {
            reachableIndexArray.push(Number(cell.lastChild.id))
        })
        this.reachableIndexArray = reachableIndexArray
    }

    computeFireCells(){ //compute the possible cells reachable by the tank according to its current coordinate (x,y) and its firing range
        const fireCellsArray = []
        const fireIndexArray = []
        for( let i = this.x - this.fireRange  ; i <= this.x + this.fireRange ; i++){
            for (let j = this.y - this.fireRange ; j <= this.y + this.fireRange ; j++){
                const index = convertCoordinateToIndex(i, j)
                if(index >=0 && index < cellsArray.length){fireCellsArray.push(cellsArray[index])}
            }
        }
        this.fireCellsArray = fireCellsArray
        fireCellsArray.forEach(cell => {
            fireIndexArray.push(Number(cell.lastChild.id))
        })
        this.fireIndexArray = fireIndexArray

    }
    

    removeNextMoveCells(){ //empty the reachableCellsArray and remove all tags from cells of the grid
        console.log('removeNextMoveCells function')
        while(this.reachableCellsArray.length > 0){
            const cell = this.reachableCellsArray.shift() //remove the cell from the this.reachableCellsArray
            const cellHighlightElt = cell.querySelector('.cellHighlight')
            cellHighlightElt.classList.remove('highlightMove') //remove the tag from the cell
        }
    }

    removeNextFireCells(){//empty the fireCellsArray and remove all tags from cells of the grid
        console.log('removeNextFireCells function')
        while(this.fireCellsArray.length > 0){
            const cell = this.fireCellsArray.shift() //remove the cell from the this.reachableCellsArray
            const cellHighlightElt = cell.querySelector('.cellHighlight')
            cellHighlightElt.classList.remove('highlightFire') //remove the tag from the cell
        }
        const index = this.getIndex()
        //we assume that the firing phase has ended. We remove the 
        cellsArray[index].querySelector('.cellTurret').style.removeProperty('--turretAngle')
    }

    showNextMoveCells(){
        this.reachableCellsArray.forEach( cell => {
            const cellHighlightElt = cell.querySelector('.cellHighlight')
            cellHighlightElt.classList.add('highlightMove')
        })
    }

    showFireCells(){
        this.fireCellsArray.forEach( cell => {
            const cellHighlightElt = cell.querySelector('.cellHighlight')
            cellHighlightElt.classList.add('highlightFire')
        })
    }

    checkWhoIsInThisCell(index){ //check if there is a tank in the cell where we shoot (defined by its index), return an trooper object
        const x = convertIndexToCoordinate(index).x
        const y = convertIndexToCoordinate(index).y
        let presentTrooper //the target tank, empty if there is no tank

        for (let trooper of myGame.blueTroopersArray){ //we cycle through arrays of trooper to look for a trooper with matching coordinate.
            if(trooper.x === x && trooper.y === y){
                presentTrooper = trooper
            }
        }
        for (let trooper of myGame.redTroopersArray){ //we need to cycle through all the armies
            if(trooper.x === x && trooper.y === y){
                presentTrooper = trooper
            }
        }
        return presentTrooper
    }

    /*
    to move a tank we need to do 2 things:
    -change the coordinate of the tank (attribute x and y)
    -update the map () (where we add the tags to the right cell)
    */
    move = (index)=>{ //I am using an arrow function here so that 'this' can still refers to the trooper object, instead of the cell
        console.log('move function')
        //check that we can move first
        let allowedMove = false
        if(this.reachableIndexArray.includes(index)){//the move is allowed
            document.getElementById('soundTankMove').play()
            allowedMove = true
            this.removeFromMap() //we remove the trooper's tag from its current position
            const coordinate = convertIndexToCoordinate(index) //we convert index to x,y
            this.x = coordinate.x //we update the coordinate of the trooper
            this.y = coordinate.y
            this.showOnMap() //we show the trooper on the map
        }
        else{
            messageBoardElt.innerText = 'one step at time son! you can only move within the blue cells'
            document.getElementById('soundSifflet').play()
        }
        return allowedMove
    }

    /*
    to fire we do two things:
    -at the index where we shoot, check if there is a target. If yes, compute damange.
    -in all cases, display some explosion effect where we shoot.
    */
    fire = (index)=>{ //I am using an arrow function here so that 'this' can still refers to the trooper object, instead of the cell
        console.log('fire function')
        let allowedShot = false
        if (this.fireIndexArray.includes(index)){ //the shot is allowed
            document.getElementById('soundShoot').play()
            allowedShot = true
            const target = this.checkWhoIsInThisCell(index)
            let isTargetDead = false
            if (target){ //if there is a target tank where we shoot
                const targetArmy =  target.army
                const targetName =  target.name
                const shooterArmy = myGame.selectedUnit.army
                const shooterName = myGame.selectedUnit.name
                if(targetName === shooterName){
                    messageBoardElt.innerText = 'Dude... you shot yourself...'
                    setTimeout(() => {
                        document.getElementById('soundFailure').play()
                    }
                        , 1000)

                }
                else if(targetArmy === shooterArmy){messageBoardElt.innerText = 'Friendly fire!'}
                else{messageBoardElt.innerText = 'nice shot!'}
                isTargetDead = target.takeDamage(this.strength)//compute damage on the target ennemy
            }
            else{messageBoardElt.innerText = 'How about shooting some damn ennemies!'}
            this.addShellExplosionEffect(index)
            if(isTargetDead){
                const deadTrooper = this.handleDeadTrooper(index)
                this.addTankExplosionEffect(index, deadTrooper)
            }
        }
        else{
            messageBoardElt.innerText = 'you are a tank, not a sniper! fire within the orange cells'
            document.getElementById('soundSifflet').play()
        }
        return allowedShot

    }

    handleDeadTrooper(index){
        console.log('handleDeadTrooper function')
        const deadTrooper = this.checkWhoIsInThisCell(index)
        //deadTrooper.removeFromMap()
        console.log('deadTrooper :', deadTrooper)
        const army = deadTrooper.army
        const removeIndex = myGame.armies[army].indexOf(deadTrooper)
        myGame.armies[army].splice(removeIndex,1)
        return deadTrooper
        
    }

    takeDamage(damage){
        this.health -= damage
        const isTargetDead = this.health <= 0 ? true : false
        return isTargetDead
    }

    //we set delay before add the class so that the tank explodes after the shell explodes
    addTankExplosionEffect(index, deadTrooper){
        console.log('addTankExplosionEffect function')

        const cellEffectElt = cellsArray[index].querySelector('.cellEffect')

        setTimeout(() => {
            cellEffectElt.classList.add('tankExplosion')
            document.getElementById('soundExplosion').play()
        }
            , 2000)
        setTimeout(() => {
            cellEffectElt.classList.remove('tankExplosion')
            deadTrooper.removeFromMap()
        }
            , 3000)
        
    }

    // we add shellexplosion effect, then remove it after 1 second. Otherwise the grid is polluted with old explosion class.
    addShellExplosionEffect(index){
        console.log('addExplosionEffect function')
        const cellEffectElt = cellsArray[index].querySelector('.cellEffect')
        console.log('cellEffectElt: ', cellEffectElt)
        cellEffectElt.classList.add('shellExplosion')
        setTimeout(() => {
            cellEffectElt.classList.remove('shellExplosion')
        }
            , 1000)
        
    }

    displayInfoPanel(element){ //populate a panel (either attacker or target) with info from a tank
        const ulElt = element.querySelector('ul')
        ulElt.querySelector('.x').innerText = `x: ${this.x}`
        ulElt.querySelector('.y').innerText = `y: ${this.y}`
        ulElt.querySelector('.army').innerText = `army: ${this.army}`
        ulElt.querySelector('.name').innerText = `name: ${this.name}`
        ulElt.querySelector('.moveRange').innerText = `moveRange: ${this.moveRange}`
        ulElt.querySelector('.fireRange').innerText = `fireRange: ${this.fireRange}`
        ulElt.querySelector('.health').innerText = `health: ${this.health}`
        ulElt.querySelector('.strength').innerText = `strength: ${this.strength}`
    }
}

/*------------------------------------------------------------------------------------------------
game class
--------------------------------------------------------------------------------------------------
*/
class Game{
    constructor(blueTroopersArray, redTroopersArray,armies,lastTrooperIndexesPerArmy,selectedUnit,selectedUnitIndex,currentArmy,currentPhase){
        this.blueTroopersArray = blueTroopersArray
        this.redTroopersArray = redTroopersArray
        this.armies = armies //{blue: blueTroopersArray, red: redTroopersArray}
        this.lastTrooperIndexesPerArmy = lastTrooperIndexesPerArmy //{blue: 0, red: 1}
        this.selectedUnit = selectedUnit //a trooper object, whatever the army
        this.selectedUnitIndex = selectedUnitIndex
        this.currentArmy = currentArmy //blue or red
        this.currentPhase = currentPhase
    }

    animationInitialDeployment(){ //move blue tanks from outside on left, red tanks from outside on right
        console.log('animationInitialDeployment function')
        console.log('this: ', this)
        const armiesArray = Object.keys(this.armies) //Array [ "blue", "red" ]
        armiesArray.forEach( army => {
            const troopersArray = this.armies[army]
            troopersArray.forEach( trooper =>{
                const index = trooper.getIndex()
                const container = cellsArray[index]
                const cellTank = container.querySelector('.cellTank') //we need to animate both the tank and the turrets, which are independant images
                const cellTurret = container.querySelector('.cellTurret')
                cellTank.classList.add('hiding') //with hiding class, the tanks are positioned outside of the grid
                cellTurret.classList.add('hiding')
                setTimeout(() => {
                    cellTank.classList.remove('hiding') //without hiding, the tanks are positioned in there respective cells
                    cellTurret.classList.remove('hiding')
    
                }
                    , 1000)
    
            })
        })
    }
    selectNextUnit(){ //select the next trooper to play for a given army (blue or red).
        console.log('selectNextUnit function')
        console.log('this:', this)
        const previousArmy = this.currentArmy
        this.currentArmy = this.currentArmy === 'blue' ? 'red' : 'blue'
        console.log('selectNextUnit function')

        const lastIndex = this.lastTrooperIndexesPerArmy[this.currentArmy] //index of last trooper that played for a given army, int
        const armySize = this.armies[this.currentArmy].length //size of army, int
        if(this.armies['blue'].length === 0 && this.armies['red'].length === 0){ //the last unit probably shot itself
            console.log('it is a tie')
            this.currentPhase = 'gameOver'
            messageBoardElt.innerText = 'gameOver, it is a tie'
            return false
        }
        else if(armySize === 0){ //all troopers are gone, the game is finished
            console.log(`game over, ${previousArmy} won`)
            messageBoardElt.innerText = `game over, ${previousArmy} won`    
            this.currentPhase = 'gameOver'
            return false

        }else{
            /* 
            TODO: handle dead soldier so that we cannot select them anymore
            */
            const nextIndex = (lastIndex + 1) % armySize //select the next trooper
            this.lastTrooperIndexesPerArmy[this.currentArmy] = nextIndex
            this.selectedUnit = this.armies[this.currentArmy][nextIndex%armySize]

            this.selectedUnit.computeNextMoveCells()
            this.selectedUnit.showNextMoveCells()
            
            this.selectedUnit.displayInfoPanel(attackerPanelElt) //once the unit is selected we can show its info on the attacker's panel
            return true
        }


    }
    /*
    we handle the state machine of the game here. The game has 2 phases: move and fire.
    */
    handleClick = (event)=>{ //I use arrow function to keep 'this' pointing to myGame
        console.log('handleClick event: ',event)
        if(event.target.classList.contains('cell')){ //we click on a cell of the grid
            const index = Number(event.target.id) //this is the index of the cell on which we click
            console.log('this.currentPhase: ', this.currentPhase)
            switch(this.currentPhase){
                case 'move':
                    console.log('switch case move')
                    this.selectedUnit.removeNextMoveCells()
                    const allowedMove = this.selectedUnit.move(index) //the player clicked on a cell within the blue highlighted zone
                    if(!allowedMove){
                        this.selectedUnit.computeNextMoveCells()
                        this.selectedUnit.showNextMoveCells() //show the move cells again for the next turn
                        break
                    }
                    this.selectedUnit.computeFireCells()
                    this.selectedUnit.showFireCells()
                    this.currentPhase = 'fire'
                    break
                case 'fire':
                    console.log('switch case fire')
                    const allowedShot = this.selectedUnit.fire(index)
                    if(!allowedShot){break} //the player clicked on a cell within the red highlighted zone
                    this.selectedUnit.removeNextFireCells()
                    const continueToPlay = this.selectNextUnit() //false if there is no next unit to select
                    this.currentPhase = continueToPlay ? 'move' : 'gameOver'
                    break
                case 'gameOver':
                    console.log('removing all controls')
                    document.removeEventListener('click', this.handleClick)
                    gridElt.removeEventListener('mousemove', this.handleMouse)
                    setTimeout(() => {
                        document.getElementById('soundVictory').play()
                    }
                        , 2000)
                    break
            }
        }
    }
    handleMouse = (e) => { //I use arrow function to keep 'this' pointing to myGame
        //offset are probably created from other element like the title.
        const offsetX = 0
        const offsetY = 80
    
        const selectedUnit = this.selectedUnit
        if(selectedUnit){ //at the end of the game there is no tank left, so selectedUnit returns undefined
            //compute coordinate(X,Y) of the selected tank. X is the coordinate from left to right. Y is the coordinate from top to bottom
            //selectedUnit.x is the line position of the tank in the cellsArray, so it is from top to bottom
            //selectedUnit.y is the column position of the tank in the cellsArray, so it is from left to rigth
            const X = cellWidth/2 + (selectedUnit.y -1)*cellWidth + offsetX
            const Y = cellHeight/2 + (selectedUnit.x -1)*cellHeight + offsetY
            const angle = computeAngle(X,Y,e.clientX,e.clientY)
            const index = selectedUnit.getIndex()
            const container = cellsArray[index]
            const turretElt = container.querySelector('.cellTurret')
            turretElt.style.setProperty('--turretAngle', angle + "deg")//we add style in the DOM. We do not update the css which is static.
            /*
            <div class="cellTurret blueTrooper1 blue" style="--turretAngle: 150deg;"></div>
            */


            //second part is to update the targetPanel with info from the tank under the mouse
            targetPanelElt.querySelector('.coordinate').innerText = `${e.clientX}:${e.clientY}`
            const target = event.target
            const parentNode = target.parentNode
            const cellTank = parentNode.querySelector('.cellTank')
            if(cellTank){ //check if we selected a valid cell
                const classArray = cellTank.classList //<div class="cellTank blueTrooper1 blue"></div>
                if(classArray.length>1){ //this means the target element contains a tank, otherwise it would just contain <div class="cellTank"></div>
                    const targetIndex = target.id
                    const targetTank = selectedUnit.checkWhoIsInThisCell(targetIndex)//we can call the checkWhoIsInThisCell from any tank, it does not matter
                    if(targetTank){ //in case the tank has been destroyed, we don't want to get lot of undefined errors
                        targetTank.displayInfoPanel(targetPanelElt)
                    }
                }
            }
        }
    }

    initGame(){
        const allTroopersArray = this.blueTroopersArray.concat(this.redTroopersArray)
        allTroopersArray.forEach( trooper => trooper.showOnMap())
        this.selectNextUnit() //define the first tank to play
        this.selectedUnit.computeNextMoveCells()
        this.selectedUnit.showNextMoveCells()
        this.animationInitialDeployment() //animation done only at the beginning of the game.
        
        document.addEventListener('click', this.handleClick)
        /*
        another listener used for:
        -animating the turret rotation
        -updating in real time the target info panel
        */
        
        //A new function reference is created after .bind() is called. So, to add or remove it, assign the reference to a variable
        gridElt.addEventListener('mousemove', this.handleMouse)
    }
}
function computeAngle(x1,y1,x2,y2){ //function to compute turret angle using al kashi
    //(x1,y1) is the center of the selected tank
    //(x2,y2) is the position of the mouse
    const a = Math.sqrt( y1 * y1 )
    const b = Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1))
    const c = Math.sqrt( (x2-x1) * (x2-x1) + y2 * y2 )
    const numerator = a*a + b*b -c*c
    const denominator = 2*a*b
    const angle = Math.acos(numerator/denominator)*180/Math.PI
    return (x2>x1)? angle: 360 - angle //al kashi only compute from 0 to 180 degree. We need to take into account the other half.
}

/*------------------------------------------------------------------------------------------------
game parameters
--------------------------------------------------------------------------------------------------
*/

//populate the blueTroopersArray and redTroopersArray
const blueTrooper1 = new Trooper(3,5,'blue','blueTrooper1',1,2,120,20)
const blueTrooper2 = new Trooper(5,5,'blue','blueTrooper2',1,2,12,20)
// const blueTrooper3 = new Trooper(7,2,'blue','blueTrooper2',1,2,12,20)
const blueTroopersArray = []
blueTroopersArray.push(blueTrooper1)
blueTroopersArray.push(blueTrooper2)
// this.blueTroopersArray.push(blueTrooper3)
const redTrooper1 = new Trooper(3,7,'red','redTrooper1',1,2,100,25)
const redTrooper2 = new Trooper(5,7,'red','redTrooper2',1,2,10,15)
// const redTrooper3 = new Trooper(7,9,'red','redTrooper2',1,2,10,15)
const redTroopersArray = []
redTroopersArray.push(redTrooper1)
redTroopersArray.push(redTrooper2)
// this.redTroopersArray.push(redTrooper3)
const armies = {}
armies['blue'] = blueTroopersArray
armies['red'] = redTroopersArray

console.log('armies:', armies)
console.log("armies['blue']: ",armies['blue'])
const lastTrooperIndexesPerArmy = []
lastTrooperIndexesPerArmy['blue'] = -1 //we set to -1 because the first thing we do is to increment this counter inselectNextUnit
lastTrooperIndexesPerArmy['red'] = -1 


const currentArmy = 'red' //init at red in order to play first with blue, because the first things to do is to select the opposite army in selectNextUnit
const currentPhase = 'move'


const myGame = new Game(blueTroopersArray, redTroopersArray,armies,lastTrooperIndexesPerArmy,[],-1,currentArmy,currentPhase)
myGame.initGame()

