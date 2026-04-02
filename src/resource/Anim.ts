import Animation = Phaser.Types.Animations.Animation;
import GenerateFrameNumbers = Phaser.Types.Animations.GenerateFrameNumbers;

export interface AnimationDescriptor {
  frameNumbers: GenerateFrameNumbers;
  config: Animation
}

const CHAR_ANIM_CONFIG = {
  repeat: -1,
  frameRate: 8,
  yoyo: true
}

export const CHAR_ANIMS = {
  up: {
    frameNumbers: {start: 9, end: 11},
    config: CHAR_ANIM_CONFIG
  },
  down: {
    frameNumbers: {start: 0, end: 2},
    config: CHAR_ANIM_CONFIG
  },
  left: {
    frameNumbers: {start: 3, end: 5},
    config: CHAR_ANIM_CONFIG
  },
  right: {
    frameNumbers: {start: 6, end: 8},
    config: CHAR_ANIM_CONFIG
  },
} as { [key: string]: AnimationDescriptor };
