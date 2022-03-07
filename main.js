//populating the grid to display all units
const gridElt = document.querySelector('.grid')

const gridWidth = 10
const gridHeight = 10
const cellsArray = []


for (let i = 0; i < gridWidth * gridHeight; i++) {
    const cell = createCell(i)
    gridElt.appendChild(cell)
    cellsArray.push(cell)
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
function createCell(i) {
    const cell = document.createElement('div')
    cell.classList.add('cell')
    cell.id = i
    const x = convertIndexToCoordinate(i).x
    const y = convertIndexToCoordinate(i).y
    const iCheck = convertCoordinateToIndex(x,y) //this is to check that all calculations are corrects)
    cell.innerText = `${i} (${x}:${y})`
    return cell
}

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
        cellsArray[i].classList.add(this.name)
    }

    removeFromMap(){
        console.log('remove from map')
        const i = convertCoordinateToIndex(this.x, this.y)
        cellsArray[i].classList.remove(this.name)
    }

    computeNextMoveCells(){
        const _reachableCellsArray = []
        for( let i = this.x - this.moveRange  ; i <= this.x + this.moveRange ; i++){
            for (let j = this.y - this.moveRange ; j <= this.y + this.moveRange ; j++){
                const index = convertCoordinateToIndex(i, j)
                _reachableCellsArray.push(cellsArray[index])
            }
        }
        this.reachableCellsArray = _reachableCellsArray
    }

    computeFireCells(){
        const _fireCellsArray = []
        for( let i = this.x - this.fireRange  ; i <= this.x + this.fireRange ; i++){
            for (let j = this.y - this.fireRange ; j <= this.y + this.fireRange ; j++){
                const index = convertCoordinateToIndex(i, j)
                _fireCellsArray.push(cellsArray[index])
            }
        }
        this.fireCellsArray = _fireCellsArray
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
            cell.classList.remove('highlightMove') //remove the tag from the cell
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
            cell.classList.add('highlightMove')
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
        console.log('this: ', this)
        const target = this.checkWhoIsInThisCell(index)
        if (target){
            console.log('target :', target)
            console.log(`this.strength: ${this.strength}, typeof this.strength: ${typeof this.strength}`)
            target.takeDamage(this.strength)
        }
        //compute some damage on ennemies
    }

    takeDamage(damage){
        console.log(`this.health: ${this.health} typeof this.health: ${typeof this.health}`)
        console.log(`damage: ${damage} typeof damage: ${typeof damage}`)
        this.health -= damage
    }
}


const game = {
    blueTroopersArray : [],
    redTroopersArray :  [],
    currentPlayer : '',
    currentPhase : '',
    initGame(){
        blueTrooper = new Trooper(5,5,'blue','blueTrooper1',1,2,100,20)
        this.blueTroopersArray.push(blueTrooper)
        redTrooper = new Trooper(5,7,'red','redTrooper1',1,2,110,15)
        this.redTroopersArray.push(redTrooper)
        this.currentPlayer = 'blue'
        this.currentPhase = 'selectMovable'
        blueTrooper.showOnMap()
        redTrooper.showOnMap()
        this.selectedUnit = this.blueTroopersArray[0]
        console.log(this.selectedUnit)
        this.selectedUnit.computeNextMoveCells()
        this.selectedUnit.showNextMoveCells()
        console.log('initGame this: ', this)
        document.addEventListener('click', this.handleClick.bind(this))
    },
    handleClick(event){
        const index = Number(event.target.id) //this is the index of the cell on which we click
        console.log(index)
        console.log('this: ', this)
        console.log('this.selectedUnit: ', this.selectedUnit)
        const currentUnit = game.selectedUnit 
        switch(game.currentPhase){
            case 'selectMovable':
                currentUnit.computeNextMoveCells()
                currentUnit.showNextMoveCells()
                game.currentPhase = 'move'
            case 'move':
                currentUnit.removeNextMoveCells()
                currentUnit.move(index)
                currentUnit.computeFireCells()
                currentUnit.showFireCells()
                game.currentPhase = 'fire'
                break
            case 'fire':
                currentUnit.fire(index)
                currentUnit.removeNextFireCells()
                break
        }
    },
    playOneRound(){
        
    }
}

game.initGame()
console.log('game.currentPhase: ', game.currentPhase)

game.playOneRound()

console.log('fin')