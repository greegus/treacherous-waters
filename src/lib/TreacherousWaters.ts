type Size = { width: number; height: number }
type Position = { x: number; y: number }
type Placement = Position[]
type ShipBlueprint = { id: number; name: string; size: number }
type Ship = { id: number; blueprint: ShipBlueprint; placement: Placement }
type GridCell = { ship?: Ship; hasShot: boolean, position: Position, hasHit: boolean }

let id = 1

class NoPossiblePlacementError extends Error {}

export function createBattleshipBlueprint(): ShipBlueprint {
  return { id: ++id, name: 'Battleship', size: 5 }
}

export function createDestroyerBlueprint(): ShipBlueprint {
  return { id: ++id, name: 'Destroyer', size: 4 }
}

export class TreacherousWaters {
  private _gridSize: Size

  private _ships: Ship[] = []

  private _shipBlueprints: ShipBlueprint[]

  private _shots: Position[] = []

  constructor(gridSize: Size, ships: ShipBlueprint[]) {
    this._gridSize = gridSize
    this._shipBlueprints = ships

    this.restart()
  }

  private generateShips(): Ship[] {
    const ships: Ship[] = []

    try {
      this._shipBlueprints.forEach((blueprint) => {
        const possiblePlacements = this.getAllPosibleShipPlacement(blueprint, ships)

        if (possiblePlacements.length === 0) {
          throw new NoPossiblePlacementError()
        }

        const placement = possiblePlacements[Math.floor(Math.random() * possiblePlacements.length)]

        const ship = this.createShip({ blueprint, placement })

        ships.push(ship)
      })
    } catch (e) {
      if (e instanceof NoPossiblePlacementError) {
        // Rerun the method again if there is no possible placement
        // XXX: This could lead to an infinite loop if there are too many ships and there is no possible placement
        return this.generateShips()
      }
    }

    return ships
  }

  private createShip(options: { blueprint: ShipBlueprint; placement: Placement }): Ship {
    return {
      ...options,
      id: ++id
    }
  }

  private generateShipPositions(
    shipBlueprint: ShipBlueprint,
    position: Position,
    orientation: 'horizontal' | 'vertical'
  ): Placement | undefined {
    const positions = []

    if (orientation === 'horizontal') {
      if (position.x + shipBlueprint.size > this._gridSize.width) {
        return
      }

      for (let i = 0; i < shipBlueprint.size; i++) {
        positions.push({
          x: position.x + i,
          y: position.y
        })
      }

      return positions
    }

    if (orientation === 'vertical') {
      if (position.y + shipBlueprint.size > this._gridSize.height) {
        return
      }

      for (let i = 0; i < shipBlueprint.size; i++) {
        positions.push({
          x: position.x,
          y: position.y + i
        })
      }

      return positions
    }
  }

  private walkGrid(callback: (position: Position) => void) {
    for (let x = 0; x < this._gridSize.width; x++) {
      for (let y = 0; y < this._gridSize.height; y++) {
        callback({ x, y })
      }
    }
  }

  private getAllPosibleShipPlacement(shiBlueprint: ShipBlueprint, otherShips: Ship[]): Placement[] {
    const availableShipPositions: Placement[] = []

    // Retrieve all possible positions for the new ship
    this.walkGrid((position) => {
      const horizontalPositions = this.generateShipPositions(shiBlueprint, position, 'horizontal')

      const isHorizontalPositionValid =
        horizontalPositions?.every((position) => this.isPositionAvailable(position, otherShips)) || false

      if (isHorizontalPositionValid) {
        availableShipPositions.push(horizontalPositions!)
      }

      const verticalPositions = this.generateShipPositions(shiBlueprint, position, 'vertical')
      const isVerticalPositionValid = verticalPositions?.every((position) =>
        this.isPositionAvailable(position, otherShips)
      )

      if (isVerticalPositionValid) {
        availableShipPositions.push(verticalPositions!)
      }
    })

    return availableShipPositions
  }

  private isPositionAvailable(position: Position, existingShips: Ship[]): boolean {
    // Retrieve positions occupied by other ships
    const occupiedPositions = existingShips.map((ship) => ship.placement).flat()

    // Extend the position to the 4 adjacent positions to check if they are occupied and filter out positions outside the grid
    const restrictedPositionOffsets = [
      [0, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
      [0, 1]
    ]

    const restrictedPositions = restrictedPositionOffsets
      .map(([x, y]) => ({
        x: position.x + x,
        y: position.y + y
      }))
      .filter(
        (position) =>
          position.x >= 0 && position.x < this._gridSize.width && position.y >= 0 && position.y < this._gridSize.height
      )

    // Check if any of the restricted positions is occupied by another ship
    return restrictedPositions.every(
      (restrictedPosition) =>
        !occupiedPositions.some((occupiedPosition) => this.isSamePosition(occupiedPosition, restrictedPosition))
    )
  }

  private isSamePosition(position1: Position, position2: Position): boolean {
    return position1 && position2 && position1.x === position2.x && position1.y === position2.y
  }

  fire(position: Position): void {
    if (this.shots.some((shot) => this.isSamePosition(shot, position))) {
      return
    }

    this._shots.push(position)
  }

  private isShipSunk(ship: Ship): boolean {
    return ship.placement.every((position) => this.shots.some((shot) => this.isSamePosition(position, shot)))
  }

  getShip(position: Position): Ship | undefined {
    return this._ships.find((ship) =>
      ship.placement.some((p) => this.isSamePosition(p, position))
    )
  }

  hasShot(position: Position): boolean {
    return this.shots.some((shot) => this.isSamePosition(shot, position))
  }

  get hasAllShipsSunk(): boolean {
    return this._ships.every((ship) => this.isShipSunk(ship))
  }

  get shots(): Placement {
    return this._shots
  }

  get gridSize(): Size {
    return this._gridSize
  }

  get ships(): (Ship & { isSank: boolean; hits: Placement })[] {
    return this._ships.map((ship) => ({
      ...ship,
      isSank: this.isShipSunk(ship),
      hits: this.shots.filter((shot) => ship.placement.some((position) => this.isSamePosition(position, shot)))
    }))
  }

  get gridCells(): GridCell[] {
    const grid: GridCell[] = []

    this.walkGrid((position) => {
      const ship = this.getShip(position)
      const hasShot = this.hasShot(position)
      const hasHit = Boolean(ship && hasShot)

      grid.push({
        position,
        ship,
        hasShot,
        hasHit
      })
    })

    return grid
  }


  restart() {
    this._shots = []
    this._ships = this.generateShips()
  }
}
