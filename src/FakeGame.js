import { INVALID_MOVE } from 'boardgame.io/core'

function IsVictory(cells) {
    const positions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
        [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];
    for (let i=0; i<8; i++) {
        const symbols = positions[i].map(x => cells[x]);
        if (symbols.every(x => x != null && x === symbols[0])) {
            return true;
        };
    };
    return false;
};

function IsDraw(cells) {
    return cells.every(x => x != null);
};

export const TicTacToe = {

    name: 'tic-tac-toe',

    setup: () => ({ cells: Array(9).fill(null) }),

    turn: {
        moveLimit: 1,
    },
  
    moves: {
        clickCell: (G, ctx, id) => {
            if (G.cells[id] != null) {
                return INVALID_MOVE;
            };
            G.cells[id] = ctx.currentPlayer;
        },
    },

    endIf: (G, ctx) => {
        if (IsVictory(G.cells)) {
            return { winner: ctx.currentPlayer };
        };
        if (IsDraw(G.cells)) {
            return { draw: true };
        };
    },

};