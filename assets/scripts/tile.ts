import { _decorator, Component, Node, Sprite, SpriteFrame, find } from 'cc';
const { ccclass, property } = _decorator;

import { Game } from './game';
import { tileManager } from './tileManager';

@ccclass('Tile')
export class Tile extends Component {

    // 0:black 1:green 2:blue 3:red 4:yellow
    @property({ type: [SpriteFrame] })
    sprites = [];

    private _row: number;
    private _col: number;

    // 绿色块可以覆盖红色块、蓝色块，红色块覆盖得分块
    private _greenCover: boolean;
    private _redCover: boolean;
    private _blueCover: boolean;

    private _status: number; // 当前状态，对应于应该绘制的sprite索引
    private _dangerous: boolean;  // 是否危险

    @property({ type: [SpriteFrame] })
    tips = [];

    @property({ type: Sprite })
    tip: Sprite = null;

    // 当前tip的索引
    private _tip_value: number = 0;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    start() {
    }

    update(deltaTime: number) {
    }

    // 改变状态
    fresh() {
        this._status = 0;
        this._dangerous = false;

        if (this._greenCover) {
            this._status = 1;
        } else if (this._redCover) {
            this._status = 3;
            this._dangerous = true;
        } else if (this._blueCover) {
            this._status = 2;
        }

        this.getComponent(Sprite).spriteFrame = this.sprites[this._status];
    }

    onTouchStart() {
        this.onPress();
    }

    onTouchEnd() {
    }

    onTouchCancel() {
    }

    // ----------------------------------------------------

    set_row_col(row: number, col: number) {
        this._row = row;
        this._col = col;
    }

    get_row_col(): [row: number, col: number] {
        return [this._row, this._col];
    }

    reset() {
        this._greenCover = false;
        this._redCover = false;
        this._blueCover = false;
        this.fresh();
    }

    setGreen(val: boolean) {
        this._greenCover = val;
        this.fresh();
    }

    setRed(val: boolean) {
        this._redCover = val;
        this.fresh();
    }

    setBlue(val: boolean) {
        this._blueCover = val;
        this.fresh();
    }

    // 设置提示图标 0(无) 1(绿色)  2(灰色)
    set_tip(val: number) {
        this._tip_value = val;

        console.log("set_tip", this._tip_value);

        if (val == 1) {
            this.tip.spriteFrame = this.tips[0];
        } else if (val == 2) {
            this.tip.spriteFrame = this.tips[1];
        } else {
            this.tip.spriteFrame = null;
        }
    }

    // ----------------------------------------------------
    onPress() {
        console.log("OnPress", this._tip_value);

        if (this._tip_value != 2) {
            // 播放禁止音乐
            return;
        }

        this.set_tips();

        if (this._greenCover) {
            return;
        }

        let game = find("Canvas/background/uiMain").getComponent(Game);

        // 踩中红色的结束游戏，踩中蓝色的得分
        if (this._redCover) {
            game.postGameOver();
            return;
        }

        if (this._blueCover) {
            this._blueCover = false;
            game.postScoreAdd();
            this.notify();
            this.fresh();
        };
    }

    // 通知tileManager
    notify() {
        let tileMgr = find("Canvas/background/tileManager").getComponent(tileManager);
        tileMgr.onTilePressed(this._row, this._col);
    }

    set_tips() {
        let tm = find("Canvas/background/tileManager").getComponent(tileManager);
        tm.set_tile_tips(this);
    }
}
