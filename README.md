# Pandemic Legacy Season 2 Sim

The game is too hard, simulate the game state to try to find winning strategies.

## Testing

```shell
pnpm test
```

## Run

`sim` is a symlink to the cli entrypoint `src/entrypoints/main.ts`. It uses a node shebang and should be able to run
directly without compilation if using node >= 23.

```shell
# run entrypoint using symlink
./sim <args>

# run entrypoint directly
src/entrypoint/main.ts

# run entrypoint using package.tson script
pnpm start
```
