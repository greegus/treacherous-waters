# Treacherous waters

A simple web-based battleships game.

## Implementation notes

- Core logic for the game is based in `src/lib/TreacherousWaters.ts`.
- `TreacherousWaters` is taking care of both generating the game grind with ships and then tracking shots and hits. It is supposed to be instantiated with the size of the grid and a list of ships ("blueprints") that should be randomly placed there.
- UI and interactions are provided by a Vue.js app that wraps this class in a component `src/components/TreacherousWaters.vue`.

### Randomizing ships on the grid

- The "grid" is not represented by a matrix, but rather just a list of ships and points that each one of them occupies.
- For each blueprint, all possible placements on the grid are calculated and then it simply randomly picks one to be used. Since all ships have just a simple line design, we only considering horizontal/vertical placement variations, not mirroring the shape.

**XXX:** This algorithm suits the task, but when more ships are about to be added to the grid or the grid dimensions are shrunk it could lead to edge cases when the placements from previous iterations would leave no space for remaining shapes to be placed. In this case, it enters a recursion giving it another try. This could eventually lead to an infinite loop when there is a very small or no chance of finding a solution. Using state space search might be a possible solution to this, but seems like an overkill for the given task.

## Project Setup

```sh
npm install
npm run build
npm run preview
```
