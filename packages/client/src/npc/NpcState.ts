import Unit from "../core/Unit";

const NPC_STATE_KEY = "npc_state";

export default class NpcState {

    public roles: number[];

    constructor() {
        this.roles = null;
    }
}

function initNpcState(npc: Unit) {
    const npcState = new NpcState();

    npc.setData(NPC_STATE_KEY, npcState);

    return npcState;
}

function getNpcState(npc: Unit) {
    return npc?.getData(NPC_STATE_KEY) as NpcState;
}

export {
    initNpcState,
    getNpcState
}
