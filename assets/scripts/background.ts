import { _decorator, Component, Node, find } from 'cc';
const { ccclass, property } = _decorator;

import { tileManager } from './tileManager';

@ccclass('background')
export class background extends Component {
    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    update(deltaTime: number) {

    }

    onTouchStart() {
        console.log("1111------");

        let tm = find("Canvas/background/tileManager").getComponent(tileManager);
        tm.set_tile_tips(null);

        console.log("1111");
    }
}
