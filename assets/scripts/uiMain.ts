import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('uiMain')
export class uiMain extends Component {

    @property({ type: Label })
    stat: Label = null;

    @property({ type: Label })
    result: Label = null;

    start() {
    }

    update(deltaTime: number) {
    }

    showResult(win: boolean, level: number) {
        this.node.active = true;

        this.stat.getComponent(Label).string = `已通关数: ${level}`
        this.result.getComponent(Label).string = win ? "成功" : "失败";
    }
}


