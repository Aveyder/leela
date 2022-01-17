import P = Phaser.Input.Keyboard.KeyCodes.P;

type State = unknown;

interface Equals<S extends State> {
    (s1: S, s2: S): boolean;
}

interface Diff<S extends State> {
    (s1: S, s2: S, result?: S): S;
}

export {
    State,
    Equals,
    Diff
};
