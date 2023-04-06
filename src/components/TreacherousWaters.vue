<script setup lang="ts">
import { TreacherousWaters, createBattleshipBlueprint, createDestroyerBlueprint } from '../lib/TreacherousWaters'
import { ref } from 'vue'
import { Button, Checkbox } from 'vuiii'

const hasShipsVisible = ref(false)

const game = ref(
  new TreacherousWaters({ width: 10, height: 10 }, [
    createBattleshipBlueprint(),
    createDestroyerBlueprint(),
    createDestroyerBlueprint()
  ])
)
</script>

<template>
  <div>
    <div class="mx-auto p-12 bg-slate-400 flex gap-12">
      <!-- Status -->
      <div class="w-64">
        <div class="text-sm text-white uppercase mb-8">Ships in the fleet</div>

        <div class="space-y-3">
          <div v-for="ship in game.ships" :key="ship.id">
            <div class="text-[0.65rem] uppercase text-white mb-1" :class="{'line-through	': ship.isSank}">{{  ship.blueprint.name }}</div>

            <div class="flex gap-1">
              <div
                v-for="(_, index) in ship.placement"
                :key="index"
                class="w-4 aspect-square"
                :class="{
                  'bg-rose-600 animate-pulse shadow-[0_0_32px_theme(colors.rose.500)]': ship.isSank,
                  'bg-white': !ship.isSank
                }"
              />
            </div>
          </div>
        </div>

        <div class="mt-12 text-white text-sm" v-if="game.hasAllShipsSunk">All ships have been destroyed!</div>
      </div>

      <!-- Grid -->
      <div
        class="inline-grid shadow cursor-default select-none flex-none border-2 border-slate-500/20"
        :style="{
          'grid-template-columns': `repeat(${game.gridSize.width}, minmax(0, 1fr))`
        }"
      >
        <div v-for="(cell, index) in game.gridCells" :key="index">
          <div
            class="aspect-square w-12 flex shadow-inner"
            @click="game.fire(cell.position)"
            :class="{ 'cursor-pointer hover:bg-slate-700/10': !cell.hasShot }"
          >
            <div
              class="m-auto w-8 aspect-square"
              :class="{
                'bg-white/10': hasShipsVisible && cell.ship && !cell.hasShot,
                'bg-rose-600 animate-pulse shadow-[0_0_32px_theme(colors.rose.500)]': cell.hasHit,
                'bg-slate-500/50': cell.hasShot && !cell.hasHit
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex mt-8 justify-between items-center">
      <Button variant="primary" outlined @click="game.restart()">New game</Button>

      <div class="ml-auto">
        <Checkbox v-model="hasShipsVisible" label="Reveal positions 🤫" />
      </div>
    </div>
  </div>
</template>
