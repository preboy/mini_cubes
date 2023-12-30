import { ROWS, COLS } from './global';

// ----------------------------------------------------------------------------

class Grid {
    x: number;
    y: number;

    private _type: number;

    constructor(type: number, arr: number[]) {
        this._type = type;
        this.x = arr[0];
        this.y = arr[1];
    }

    get type(): number {
        return this._type;
    }

    set type(type: number) {
        this._type = type;
    }
}


class Group {

    protected _grids: Grid[];
    private _interval: number;  // update调用间隔时间(毫秒)
    private _last: number;
    private _type: number;  // 颜色类型  // 0:black 1:green 2:blue 3:red 4:yellow

    private _action: Action;

    constructor(type: number, action: number) {
        this._grids = [];
        this._interval = 100;
        this._last = 0;
        this._type = type;

        if (action > 0) {
            let cls = MAP_ACTIONS[action];
            if (cls) {
                this._action = new cls();
            } else {
                console.error("error: ", action);
            }
        }
    }

    set interval(interval: number) {
        this._interval = interval;
    }

    get_grids(): Grid[] {
        return this._grids;
    }

    set_grids(grids: number[][]) {
        for (let i = 0; i < grids.length; i++) {
            this._grids.push(new Grid(this.type, grids[i]));
        }
    }

    get type(): number {
        return this._type;
    }

    update(curr: number): boolean {
        if (curr - this._last >= this._interval) {
            this._last = curr;

            if (this._action) {
                this._action.update(this);
                return true;
            }
        }

        return false;
    }

    onTilePressed(row: number, col: number): boolean {
        // 只处理蓝色的块（积分块)
        if (this._type != 2) {
            return false;
        }

        for (let i = 0; i < this._grids.length; i++) {
            let grid = this._grids[i];
            if (grid.x == row && grid.y == col) {
                grid.type = 0;
                return true;
            }
        }

        return false;
    }

}

class GroupManager {

    _groups: Group[];

    constructor() {
        this._groups = [];
    }

    update(): boolean {
        let dirty = false;

        let now = new Date().getTime();
        for (let i = 0; i < this._groups.length; i++) {
            if (this._groups[i].update(now)) {
                dirty = true;
            }
        }

        return dirty;
    }

    add_group(group: Group) {
        this._groups.push(group);
    }

    get groups(): Group[] {
        return this._groups;
    }

    parse_actions(config: any): number {
        let count = 0;

        config.groups.forEach(item => {
            let group = new Group(item.type, item.action);
            group.set_grids(item.grids);
            if (item.interval) {
                group.interval = item.interval;
            }
            this.add_group(group);

            // 统计并返回蓝色的块(分)
            if (item.type == 2) {
                count += item.grids.length;
            }
        });

        return count;
    }

    onTilePressed(row: number, col: number) {
        for (let i = 0; i < this._groups.length; i++) {
            if (this._groups[i].onTilePressed(row, col)) {
                break;
            }
        }
    }

    game_completed() {
        this._groups = [];
    }
}


// ----------------------------------------------------------------------------

class Action {
    update(group: Group) { }
}

class ActionNone extends Action { }

class ActionMoveToLeft extends Action {
    update(group: Group) {
        let out = true;
        group.get_grids().forEach((grid) => {
            grid.y--;
            if (grid.y >= 0) {
                out = false;
            }
        })

        // 如果全部移除了边界，则位置换到最右边
        if (out) {
            group.get_grids().forEach((grid) => {
                grid.y += COLS;
            });
        }
    }
}

class ActionMoveToRight extends Action {
    update(group: Group) {
        console.log("ActionMoveToRight");
        group.get_grids().forEach((grid) => {
            console.log("grid:", grid);
        })
    }
}

// ----------------------------------------------------------------------------

const MAP_ACTIONS = {
    0: ActionNone,
    1: ActionMoveToLeft,
    2: ActionMoveToRight,
}

export { GroupManager, Grid };
