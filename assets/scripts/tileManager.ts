import { _decorator, Component, Node, Graphics, Prefab, instantiate, Label, View, find } from 'cc';
import { Tile } from './tile';
import { Game } from './game';
import { GroupManager, Grid } from './groupManager';
import { ROWS, COLS, SIDE } from './global';


const { ccclass, property } = _decorator;

@ccclass('tileManager')
export class tileManager extends Component {

    @property({ type: Prefab })
    tilePrefab = null;

    private _tiles: Node[][] = [];

    private _grpMgr: GroupManager;

    private _tile_pressed: Tile;

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
        if (grid.x < 0 || grid.x >= ROWS || grid.y < 0 || grid.y >= COLS) {
            return;
        }

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
                if (tile == this._tile_pressed) {
                    find("Canvas/background/uiMain").getComponent(Game).postGameOver();
                }
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

    reset_tips() {
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                let tile = this._tiles[i][j].getComponent(Tile);
                tile.set_tip(0);
            }
        }
    }

    // 开启新的关卡
    startLevel(index: number): number {

        // 从网络上拉取数据，并设置本关卡
        // type:    0:black 1:green 2:blue 3:red 4:yellow
        // action:  0 none 1 left  2 right
        let cfg = {
            "level": "第一关",
            "groups": [
                {
                    "comment": "底部绿色",
                    "grids": [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13], [0, 14], [0, 15], [0, 16], [0, 17], [0, 18], [0, 19], [0, 20], [0, 21]],
                    "type": 1,
                    "action": 0,
                    "interval": 500
                },
                {
                    "comment": "顶部绿色",
                    "grids": [[11, 0], [11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6], [11, 7], [11, 8], [11, 9], [11, 10], [11, 11], [11, 12], [11, 13], [11, 14], [11, 15], [11, 16], [11, 17], [11, 18], [11, 19], [11, 20], [11, 21]],
                    "type": 1,
                    "action": 0,
                    "interval": 500
                },
                {
                    "comment": "蓝色",
                    "grids": [[5, 5]],
                    "type": 2,
                    "action": 0,
                    "interval": 500
                },
                {
                    "comment": "红色-中间列",
                    "grids": [[1, 10], [2, 10], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10]],
                    "type": 3,
                    "action": 1,
                    "interval": 500
                },
                {
                    "comment": "红色-右侧列",
                    "grids": [[1, 21], [2, 21], [3, 21], [4, 21], [5, 21], [6, 21], [7, 21], [8, 21], [9, 21], [10, 21]],
                    "type": 3,
                    "action": 1,
                    "interval": 500
                }
            ]
        };

        let count = this._grpMgr.parse_actions(cfg);
        this.set_tile_tips(null);

        return count;
    }

    game_completed() {
        this.reset();
        this.reset_tips();
        this._grpMgr.game_completed();
    }

    onTilePressed(row: number, col: number) {
        this._grpMgr.onTilePressed(row, col);
    }

    set_tile_tips(tile: Tile) {
        this.reset_tips();
        this._tile_pressed = tile;

        // 未点击任何块
        if (tile == null) {
            for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLS; j++) {
                    if (i < 2 || j < 2 || (ROWS - i) <= 2 || (COLS - j) <= 2) {
                        let tile = this._tiles[i][j].getComponent(Tile);
                        tile.set_tip(2);
                    }
                }
            }
            return;
        }

        let [row, col] = tile.get_row_col();
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                let tile = this._tiles[i][j].getComponent(Tile);
                if (i == row && j == col) {
                    tile.set_tip(1);
                } else if (Math.abs(i - row) <= 2 && Math.abs(j - col) <= 2) {
                    tile.set_tip(2);
                }
            }
        }
    }
}
