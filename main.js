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
    constructor(x,y,army,name){
        this.x = x
        this.y = y
        this.army = army
        this.name = name
        this.moveRange = 1
        this.fireRange = 2
        this.reachableCellsArray = []
        this.fireCellsArray = []
    }
    showOnMap(){
        console.log('show on map')
        const i = convertCoordinateToIndex(this.x, this.y)
        console.log('this.name: ', this.name)
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

    removeNextMoveCells(){
        console.log('removeNextMoveCells function')
        while(this.reachableCellsArray.length > 0){
            const cell = this.reachableCellsArray.shift() //remove the cell from the this.reachableCellsArray
            cell.classList.remove('highlightMove') //remove the tag from the cell
        }
    }

    move = (event)=>{ //I am using an arrow function here so that 'this' can still refers to the trooper object, instead of the cell
        console.log('move function')
        console.log('event.target.id: ', event.target.id)
        const index = Number(event.target.id) //this is the index of the cell on which we click

        this.removeFromMap() //we remove the trooper's tag from its current position
        console.log('this :', this)
        console.log('this.name :', this.name)
        const coordinate = convertIndexToCoordinate(index) //we convert index to x,y
        this.x = coordinate.x //we update the coordinate of the trooper
        this.y = coordinate.y
        this.showOnMap() //we show the trooper on the map
        this.disableMove()//we can now disable movement for this trooper
        //event.target.classList.add(this.name)
    }

    fire = (event)=>{ //I am using an arrow function here so that 'this' can still refers to the trooper object, instead of the cell
        console.log('fire function')
        console.log('event.target.id: ', event.target.id)
        const index = Number(event.target.id) //this is the index of the cell on which we click

        //compute some damage on ennemies
    }

    enableMove () {
        console.log('enableMove function')
        this.reachableCellsArray.forEach( cell => {
            cell.addEventListener('click', this.move)
        })
    }

    enableFire () {
        console.log('enableFire function')
        this.fireCellsArray.forEach( cell => {
            console.log('cell :', cell)
            cell.addEventListener('click', this.fire)
        })
    }

    disableMove(){
        console.log('disableMove function')
        this.reachableCellsArray.forEach( cell => {
            console.log('cell :', cell)
            cell.removeEventListener('click', this.move)
        })
        this.removeNextMoveCells()
        //this.prepareMove() //for debug, so that we can continuously move
        this.prepareFire()
    }

    prepareMove(){
        this.computeNextMoveCells() //to populate blueTrooper.reachableCells
        this.showNextMoveCells() //to highlight the cells on the grid
        this.enableMove()
    }

    prepareFire(){
        this.computeFireCells()
        this.showFireCells()
        this.enableFire()
    }
}


const game = {
    blueTroopersArray : [],
    redTroopersArray :  [],
    initGame(){
        blueTrooper = new Trooper(5,5,'blue','blueTrooper1')
        redTrooper = new Trooper(5,7,'red','redTrooper1')
        blueTrooper.showOnMap()
        redTrooper.showOnMap()
    },
    playOneRound(){
        blueTrooper.prepareMove()
    }
}

game.initGame()
game.playOneRound()

console.log('fin')