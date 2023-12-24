import { _decorator, Component, Node, Graphics, Prefab, instantiate, Label, View } from 'cc';
import { Tile } from './tile';

const { ccclass, property } = _decorator;

const ROWS = 12;
const COLS = 22;
const SIDE = 50;

@ccclass('tileManager')
export class tileManager extends Component {

    @property({ type: Prefab })
    tilePrefab = null;

    private _tiles: Node[][] = [];

    start() {
        let view = View.instance.getVisibleSize();  // 1280 720

        // 初始化很多的小方块
        for (let i = 0; i < ROWS; i++) {
            if (!this._tiles[i]) {
                this._tiles[i] = [];
            }

            for (let j = 0; j < COLS; j++) {
                let t: Node = instantiate(this.tilePrefab);
                t.getChildByName("Label").getComponent(Label).string = `${i},${j}`;

                t.setPosition((j - (COLS / 2)) * SIDE, (i - (ROWS / 2)) * SIDE);
                t.getComponent(Tile).set_row_col(i, j);

                this._tiles[i][j] = t;
                this.node.addChild(t);
            }
        }
    }

    update(deltaTime: number) {
    }

    // 开启新的关卡
    startLevel(index: number): number {
        let count = 0;

        // 从网络上拉取数据，并设置本关卡

        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                let tile = this._tiles[i][j].getComponent(Tile);
                tile.reset();

                let r = Math.floor(Math.random() * 1000) % 20;
                if (r == 1) {
                    tile.setGreen(true);
                } else if (r == 2) {
                    tile.setBlue(true);
                    count++;
                }
            }
        }

        return count;
    }

}


