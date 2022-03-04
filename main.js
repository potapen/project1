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
        this.reachableCellsArray = []
    }
    showOnMap(){
        console.log('show on map')
        const i = convertCoordinateToIndex(this.x, this.y)
        console.log('this.name: ', this.name)
        cellsArray[i].classList.add(this.name)
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
    showNextMoveCells(){
        this.reachableCellsArray.forEach( cell => {
            cell.classList.add('highlightMove')
        })
    }
    move = (event)=>{ //I am using an arrow function here so that 'this' can still refers to the trooper object, instead of the cell
        console.log('move function')
        console.log('event: ', event)
        console.log('this: ', this)
        event.target.classList.add(this.name)
    }

    enableMove () {
        console.log('enableMove function')
        this.reachableCellsArray.forEach( cell => {
            console.log('cell :', cell)
            cell.addEventListener('click', this.move)
        })
    }

}



const blueTroopersArray = []
blueTrooper = new Trooper(2,2,'blue','blueTrooper1')
blueTrooper.showOnMap()
blueTroopersArray.push(blueTrooper)
blueTrooper.computeNextMoveCells() //to populate blueTrooper.reachableCells
blueTrooper.showNextMoveCells() //to highlight the cells on the grid
console.log('blueTrooper.name: ', blueTrooper.name)
blueTrooper.enableMove()