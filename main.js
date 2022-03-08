//populating the grid to display all units
const gridElt = document.querySelector('.grid')
const attackerPanelElt = document.querySelector('.attackerPanel')

const gridWidth = 10
const gridHeight = 10
const cellsArray = []


for (let i = 0; i < gridWidth * gridHeight; i++) {
    const containerCell = createContainerCell(i)
    cellsArray.push(containerCell)
}

//matrix starts from (1,1)
//index starts from 0
function convertCoordinateToIndex(x,y){
    const i = (x-1)*gridWidth + (y-1)
    return i
}

function convertIndexToCoordinate(i){
    const x = 1 + Math.floor(i/gridWidth)
    const y = 1 + i%gridWidth
    return {x:x,y:y}
}
function createContainerCell(i) {
    const containerCell = createCell('div','container',gridElt)

    
    createCell('div','cellTile',containerCell)
    createCell('div','cellHighlight',containerCell)
    createCell('div','cellTank',containerCell)
    createCell('div','cellTurret',containerCell)
    createCell('div','cellEffect',containerCell)
    const cell = createCell('div','cell',containerCell)
    cell.id = i
    const x = convertIndexToCoordinate(i).x
    const y = convertIndexToCoordinate(i).y
    cell.innerText = `${i} (${x}:${y})`

    return containerCell
}

function createCell(cellType='div', cellClass,eltToAppendTo){
    const cell = document.createElement(cellType)
    cell.classList.add(cellClass)
    eltToAppendTo.appendChild(cell)
    return cell
}
/*
        <div class="container">
          <div class="cellTile tile"></div>
          <div class="cellHighlight"></div>
          <div class="cellTank blueTrooper1"></div>
          <div class="cellTurret"></div>
          <div class="cellEffect explosion"></div>
        </div>
*/

class Trooper{
    constructor(x,y,army,name,moveRange, fireRange, health,strength){
        this.x = x
        this.y = y
        this.army = army
        this.name = name
        this.moveRange = moveRange
        this.fireRange = fireRange
        this.health = health
        this.strength = strength
        this.reachableCellsArray = []
        this.fireCellsArray = []
    }
    showOnMap(){
        console.log('show on map')
        const i = convertCoordinateToIndex(this.x, this.y)
        // console.log('this.name: ', this.name)
        cellsArray[i].querySelector('.cellTank').classList.add(this.name)
        cellsArray[i].querySelector('.cellTurret').classList.add(this.name)
    }

    removeFromMap(){
        console.log('remove from map')
        const i = convertCoordinateToIndex(this.x, this.y)
        cellsArray[i].querySelector('.cellTank').classList.remove(this.name)
        cellsArray[i].querySelector('.cellTurret').classList.remove(this.name)
    }

    computeNextMoveCells(){
        const reachableCellsArray = []
        for( let i = this.x - this.moveRange  ; i <= this.x + this.moveRange ; i++){
            for (let j = this.y - this.moveRange ; j <= this.y + this.moveRange ; j++){
                const index = convertCoordinateToIndex(i, j)
                if(index >=0 && index < cellsArray.length){reachableCellsArray.push(cellsArray[index])}
            }
        }
        this.reachableCellsArray = reachableCellsArray
    }

    computeFireCells(){
        const fireCellsArray = []
        for( let i = this.x - this.fireRange  ; i <= this.x + this.fireRange ; i++){
            for (let j = this.y - this.fireRange ; j <= this.y + this.fireRange ; j++){
                const index = convertCoordinateToIndex(i, j)
                if(index >=0 && index < cellsArray.length){fireCellsArray.push(cellsArray[index])}
            }
        }
        this.fireCellsArray = fireCellsArray
    }

    checkWhoIsInThisCell(index){
        const x = convertIndexToCoordinate(index).x
        const y = convertIndexToCoordinate(index).y
        let presentTrooper
        for (let trooper of game.blueTroopersArray){
            if(trooper.x === x && trooper.y === y){
                presentTrooper = trooper
            }
        }
        for (let trooper of game.redTroopersArray){
            if(trooper.x === x && trooper.y === y){
                presentTrooper = trooper
            }
        }
        return presentTrooper

    }
    
    removeNextMoveCells(){
        console.log('removeNextMoveCells function')
        while(this.reachableCellsArray.length > 0){
            const cell = this.reachableCellsArray.shift() //remove the cell from the this.reachableCellsArray
            const cellHighlightElt = cell.querySelector('.cellHighlight')
            cellHighlightElt.classList.remove('highlightMove') //remove the tag from the cell
        }
    }

    removeNextFireCells(){
        console.log('removeNextFireCells function')
        while(this.fireCellsArray.length > 0){
            const cell = this.fireCellsArray.shift() //remove the cell from the this.reachableCellsArray
            cell.classList.remove('highlightFire') //remove the tag from the cell
        }
    }

    showNextMoveCells(){
        this.reachableCellsArray.forEach( cell => {
            const cellHighlightElt = cell.querySelector('.cellHighlight')
            cellHighlightElt.classList.add('highlightMove')
        })
    }

    showFireCells(){
        this.fireCellsArray.forEach( cell => {
            cell.classList.add('highlightFire')
        })
    }

    move = (index)=>{ //I am using an arrow function here so that 'this' can still refers to the trooper object, instead of the cell
        console.log('move function')
        this.removeFromMap() //we remove the trooper's tag from its current position
        // console.log('this.name :', this.name)
        const coordinate = convertIndexToCoordinate(index) //we convert index to x,y
        this.x = coordinate.x //we update the coordinate of the trooper
        this.y = coordinate.y
        this.showOnMap() //we show the trooper on the map

    }

    fire = (index)=>{ //I am using an arrow function here so that 'this' can still refers to the trooper object, instead of the cell
        console.log('fire function')
        const target = this.checkWhoIsInThisCell(index)
        if (target){
            target.takeDamage(this.strength)
        }
        this.addExplosionEffect(index)
        //compute some damage on ennemies
    }

    takeDamage(damage){
        this.health -= damage
    }

    addExplosionEffect(index){
        console.log('addExplosionEffect function')
        const cellEffectElt = cellsArray[index].querySelector('.cellEffect') 
        cellEffectElt.classList.add('explosion')
        setTimeout(() => {
            cellEffectElt.remove('explosion')
            console.log('timeoutexpire')
        }
            , 1000)
        
    }

    displayInfoPanel(){
        attackerPanelElt.innerText = this.health
    }
}
const game = {
    blueTroopersArray : [],
    redTroopersArray :  [],
    armies : {}, //{blue: blueTroopersArray, red: redTroopersArray}
    lastTrooperIndexesPerArmy: {}, //{blue: 0, red: 1}
    selectedUnit : {}, //a trooper, whatever the army
    currentArmy : '', //blue or red
    currentPhase : '', //move or fire
    initGame(){
        const blueTrooper1 = new Trooper(3,5,'blue','blueTrooper1',1,2,100,20)
        const blueTrooper2 = new Trooper(5,5,'blue','blueTrooper2',1,2,100,20)
        this.blueTroopersArray.push(blueTrooper1)
        this.blueTroopersArray.push(blueTrooper2)
        const redTrooper1 = new Trooper(3,7,'red','redTrooper1',1,2,110,15)
        const redTrooper2 = new Trooper(5,7,'red','redTrooper2',1,2,110,15)
        this.redTroopersArray.push(redTrooper1)
        this.redTroopersArray.push(redTrooper2)
        this.armies['blue'] = this.blueTroopersArray
        this.armies['red'] = this.redTroopersArray

        this.lastTrooperIndexesPerArmy['blue'] = 0 //0 for the initial army
        this.lastTrooperIndexesPerArmy['red'] = -1 //-1 for all other armies

        
        this.currentArmy = 'blue'
        this.currentPhase = 'selectMovable'
        const allTroopersArray = this.blueTroopersArray.concat(this.redTroopersArray)
        allTroopersArray.forEach( trooper => trooper.showOnMap())
        this.selectedUnit = this.blueTroopersArray[0]
        console.log(this.selectedUnit)
        this.selectedUnit.computeNextMoveCells()
        this.selectedUnit.showNextMoveCells()
        console.log('initGame this: ', this)
        //document.addEventListener('click', this.handleClick.bind(this)) 
    },
    selectNextUnit(){
        this.currentArmy = this.currentArmy === 'blue' ? 'red' : 'blue'
        console.log('selectNextUnit this.currentArmy: ', this.currentArmy)
        /*
        selectionner le prochain trooper
        index+1 % length
        passer au suivant s'il le next trooper est mort
        */
        const lastIndex = this.lastTrooperIndexesPerArmy[this.currentArmy] //index of last trooper for a given army, ex: this.currentArmy = blue
        console.log('selectNextUnit lastIndex: ', lastIndex)
        const armySize = this.armies[this.currentArmy].length //size of army,ex: this.currentArmy = blue
        const nextIndex = (lastIndex + 1) % armySize
        this.lastTrooperIndexesPerArmy[this.currentArmy] = nextIndex
        this.selectedUnit = this.armies[this.currentArmy][nextIndex%armySize]
        console.log('this.selectedUnit: ', this.selectedUnit)
        this.selectedUnit.computeNextMoveCells()
        this.selectedUnit.showNextMoveCells()
        this.selectedUnit.displayInfoPanel()
    },
    handleClick(event){
        console.log('handleClick event: ',event)
        if(event.target.classList.contains('cell')){ //we click on a cell of the grid
            const index = Number(event.target.id) //this is the index of the cell on which we click
            switch(game.currentPhase){
                case 'selectMovable':
                    console.log('switch case selectMovable')
                    this.selectedUnit.computeNextMoveCells()
                    this.selectedUnit.showNextMoveCells()
                    game.currentPhase = 'move'
                case 'move':
                    console.log('switch case move')
                    this.selectedUnit.removeNextMoveCells()
                    this.selectedUnit.move(index)
                    this.selectedUnit.computeFireCells()
                    this.selectedUnit.showFireCells()
                    game.currentPhase = 'fire'
                    break
                case 'fire':
                    console.log('switch case fire')
                    this.selectedUnit.fire(index)
                    this.selectedUnit.removeNextFireCells()
                    this.selectNextUnit()
                    this.currentPhase = 'selectMovable'
                    break
            }
        }

    }
}
function computeAngle(x1,y1,x2,y2){
    const a = Math.sqrt( y1 * y1 )
    const b = Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1))
    const c = Math.sqrt( (x2-x1) * (x2-x1) + y2 * y2 )
    const numerator = a*a + b*b -c*c
    const denominator = 2*a*b
    const angle = Math.acos(numerator/denominator)*180/Math.PI
    return (x2>x1)? angle: 360 - angle
}
game.initGame()
document.addEventListener('click', game.handleClick.bind(game)) 
gridElt.addEventListener("mousemove", e => {
    const offsetX = 10
    const offsetY = 80
    const angle = computeAngle(368,280,e.clientX,e.clientY)
    console.log(`x,y: ${e.clientX},${e.clientY}, angle: ${angle}`)
    const turretElt = document.querySelector('.cellTurret.blueTrooper1')
    turretElt.style.setProperty('--turretAngle', angle + "deg");
});
console.log('fin')