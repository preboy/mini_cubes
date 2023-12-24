import { _decorator, Component, Node, find } from 'cc';
import { tileManager } from './tileManager';
import { uiMain } from './uiMain';
const { ccclass, property } = _decorator;

// 游戏管理类

@ccclass('Game')
export class Game extends Component {

    //-------------------------------------------------------------------------
    // 每一关卡的数据
    //-------------------------------------------------------------------------
    private _score: number;     // 得分
    private _pastSec: number;   // 已经过去的时间秒数
    private _totalScore: number; // 预设得分

    //-------------------------------------------------------------------------
    // 整体数据
    //-------------------------------------------------------------------------
    private _finishedLevel: number = 0;// 已经完成的关卡索引
    private _currentLevel: number = 0; // 当前正在进行的关卡索引
    private _lastResult: boolean = false; // 已结束的关卡的最终胜负

    start() {
    }

    update(deltaTime: number) {
    }

    // 开始新的关卡
    startNextLevel() {

        // 隐藏UI界面
        find("Canvas/background/uiMain").active = false;

        this._score = 0;
        this._pastSec = 0;

        let tm = find("Canvas/background/tileManager").getComponent(tileManager);

        this._currentLevel = this._finishedLevel + 1;
        this._totalScore = tm.startLevel(this._currentLevel);
    }

    // 游戏结束
    postGameOver() {
        if (this._currentLevel != 0) {
            this.setResult(false);
        }
    }

    // 得分
    postScoreAdd(): boolean {
        if (this._currentLevel == 0) {
            return false;
        }

        this._score++;
        if (this._score >= this._totalScore) {
            this.setResult(true);
        }

        return true;
    }

    // 设置结果
    setResult(val: boolean) {
        if (val) {
            this._finishedLevel = this._currentLevel;
        }

        this._lastResult = val;
        this._currentLevel = 0;

        find("Canvas/background/uiMain").getComponent(uiMain).showResult(val, this._finishedLevel);
    }
}
