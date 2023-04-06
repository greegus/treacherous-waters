# Treacherous waters

A simple web-based battleships game.

## Implementation notes

- Core logic for the game is based in `src/lib/TreacherousWaters.ts`.
- `TreacherousWaters` class is taking care of both generating the game grid with ships and then tracking shots and hits. It is supposed to be instantiated with the size of the grid and a list of ships ("blueprints") that would be randomly placed on it.
- UI and interactions are provided by a Vue.js app that uses this class in a component `src/components/TreacherousWaters.vue`.

### Randomizing ships on the grid

- The "grid" is not represented by a matrix, but rather just a list of ships and their placements – points that each one of them occupies.
- Since all ships have just a simple line design, we only considering horizontal/vertical placement variations, but not mirroring of the shape.
- The placement of a ship (created out of the given blueprint), is retrieved by calculating all possible placements on the grid and then simply randomly picking one to be used. 
- Ships are allowed to touch in corners but not by a cell side.

LIMITATIONS: This algorithm well works for the given task, but when more ships are about to be added to the grid or the grid dimensions are shrunk it could lead to an edge case when the placements from previous iterations would leave no space for remaining shapes to be placed. In this case, it enters a recursion giving it another try. This could eventually lead to an infinite loop when there is a very small or no chance of finding a solution. Using state space search might be a possible solution to this, but seems like an overkill here since we are always in control of the grid size and its content.

## Project Setup

```sh
npm install
npm run build
npm run preview
```
