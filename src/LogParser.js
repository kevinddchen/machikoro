// unused, but may be used in the future

function logNewTurn(turn, playerID, names) {
    return <div>Turn {turn}: #{names[playerID]}</div>;
}

function logRollDice(roll) {
    return <div stype={{whiteSpace: "pre"}}>&#9;</div>;
}

export function parser(log, names) {
    const body = [];
    for (let i=0; i<log.length; i++) {
        const turn = log[i].turn;
        const logType = log[i].type;
        const { type, playerID, args } = log[i].action.payload;
        switch(logType) {
            case "UNDO":
                body.pop();
                break;
            case "GAME_EVENT":
                break;
            case "MAKE_MOVE":
                switch(type) {
                    case "rollDice":
                        logRollDice(args[0])
                }
        }
    }
}