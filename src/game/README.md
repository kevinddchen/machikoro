# Core game logic

This module defines the core game logic.
We use the [boardgame.io](https://boardgame.io/) framework.
It handles all interactions between the client and the server.
It is highly recommended to read the documentation.

Some concepts of _boardgame.io_ which are commonly used:

- `G` is an object that represents the game state.
  Its contents are defined by the `MachikoroG` type.
  It must be a JSON-serializable object, since it is passed between the client and the server.
  The object itself can only be modified by "Move" functions.

- `ctx` is a read-only object that contains some useful metadata, such as the `currentPlayer`.

- There are some other useful plugins, such as `random` which generates random numbers, `events` which triggers certain game events such as ending a turn, and `logx` which is a custom plugin that
  helps with logging.

To help organize the code, this directory also contains some submodules that handle certain parts of the game.

- `Est` manages establishments.
- `Land` manages landmarks.
- `Log` manages logging.
