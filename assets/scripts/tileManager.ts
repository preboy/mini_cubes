import { _decorator, Component, Node, Graphics, Prefab, instantiate, Label, View } from 'cc';
import { Tile } from './tile';
import { GroupManager, Grid } from './groupManager';

const { ccclass, property } = _decorator;

const ROWS = 12;
const COLS = 22;
const SIDE = 50;

@ccclass('tileManager')
export class tileManager extends Component {

    @property({ type: Prefab })
    tilePrefab = null;

    private _tiles: Node[][] = [];

    private _grpMgr: GroupManager;

    start() {
        this._grpMgr = new GroupManager();

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
        if (!this._grpMgr.update()) {
            return;
        }

        this.reset();

        let groups = this._grpMgr.groups;
        for (let i = 0; i < groups.length; i++) {
            let grids = groups[i].get_grids();
            for (let j = 0; j < grids.length; j++) {
                this.update_grid(grids[j]);
            }
        }
    }

    update_grid(grid: Grid) {
        let tile = this._tiles[grid.x][grid.y].getComponent(Tile);

        switch (grid.type) {
            case 1:
                tile.setGreen(true);
                break;
            case 2:
                tile.setBlue(true);
                break;

            case 3:
                tile.setRed(true);
                break;
        }
    }

    reset() {
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                let tile = this._tiles[i][j].getComponent(Tile);
                tile.reset();
            }
        }
    }

    // 开启新的关卡
    startLevel(index: number): number {

        // 从网络上拉取数据，并设置本关卡
        let cfg = {
            "level": "第一关",
            "groups": [
                {
                    "comment": "向左移动到末尾",
                    "grids": [[0, 3], [0, 0], [0, 1], [0, 2]],
                    "type": 1,
                    "action": 2,
                    "interval": 100
                },
                {
                    "comment": "向右移动到末尾",
                    "grids": [[1, 2], [1, 3]],
                    "type": 3,
                    "action": 2,
                    "interval": 200
                },
                {
                    "comment": "向右1移动到末尾",
                    "grids": [[2, 2], [2, 5]],
                    "type": 2,
                    "action": 1,
                    "interval": 200
                }
            ]
        };

        return this._grpMgr.parse_actions(cfg);
    }

    onTilePressed(row: number, col: number) {
        this._grpMgr.onTilePressed(row, col);
    }
}
