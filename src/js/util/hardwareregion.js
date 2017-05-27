// Each class in here describes a hardware region, ie CCD, RAFT, etc.

// Each class must implement the following functions:
//   - String contains(Point p): If p is within this hardware region, return the display name,
//                               otherwise return null.
//   - String toDS9(): Returns an array of the ds9 regions that represent this hardware region.
//   - Region select(String displayName): Returns the region that the displayName represents.

// Represents a CCD without overscan
export class CCD {
    constructor(name, regions) {
        this.name = name;
        this.regions = regions;
    }

    contains(p) {
        if (this.regions.data.contains(p.x, p.y))
            return this.name;
        else
            return null;
    }

    select(displayName) {
        return this.regions.data;
    }

    toDS9() {
        return [
            this.regions.data.toDS9()
        ];
    }
}

// Represents a CCD with overscan
export class CCDOverscan {
    constructor(name, regions) {
        this.name = name;
        this.regions = regions;
    }

    test(name) {
        return this.name === name.split(/-/)[0];
    }

    contains(p) {
        if (this.regions.data.contains(p.x, p.y))
            return this.name + "-data";
        else if (this.regions.pre.contains(p.x, p.y))
            return this.name + "-pre";
        else if (this.regions.post.contains(p.x, p.y))
            return this.name + "-post";
        else if (this.regions.over.contains(p.x, p.y))
            return this.name + "-over";
        else
            return null;
    }

    select(displayName) {
        if (displayName.match(/-pre$/))
            return this.regions.pre;
        else if (displayName.match(/-post$/))
            return this.regions.post;
        else if (displayName.match(/-over$/))
            return this.regions.over;
        else
            return this.regions.data;
    }

    toDS9() {
        return [
            this.regions.data.toDS9(),
            this.regions.pre.toDS9(),
            this.regions.post.toDS9(),
            this.regions.over.toDS9()
        ];
    }
}
