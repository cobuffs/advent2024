const fs = require('fs');

// Read and parse the input
const entries = fs.readFileSync('input.txt', 'utf8').toString().trim().split("\r\n");
let map = [];
let frequencies = [];
entries.forEach((entry, index) => {
    map.push(entry.split(""));
    for(let i = 0; i < map[map.length - 1].length; i++){
        const node = map[map.length - 1][i];
        if(node !== '.') {
            if(!frequencies[node]) frequencies[node] = [];
            frequencies[node].push([index, i]);
        }
    }
});

// now i need to process all the frequencies to antinodes
let antinodes = [];
for(node in frequencies) {
    //if the node length is at least 2, add all those points
    //i need an antinode at each combination of points
    for(let i = 0; i < frequencies[node].length - 1; i++) {
        const pt1 = frequencies[node][i];
        if(!antinodes[`${pt1}`]) antinodes[`${pt1}`] = [];
        antinodes[`${pt1}`].push(node)

        for(let j = i + 1; j < frequencies[node].length; j++) {
            const pt2 = frequencies[node][j];
            if(!antinodes[`${pt2}`]) antinodes[`${pt2}`] = [];
            antinodes[`${pt2}`].push(node)
            const rowdiff = pt1[0] - pt2[0];
            const coldiff = pt1[1] - pt2[1];

            let n = 1;
            while(true) {
                const newpt1 = [pt1[0] + (rowdiff * n), pt1[1] + (coldiff * n)];
                if(newpt1[0] >= 0 && newpt1[0] < map.length && newpt1[1] >= 0 && newpt1[1] < map[0].length) {
                    //its valid
                    if(!antinodes[`${newpt1}`]) antinodes[`${newpt1}`] = [];
                    antinodes[`${newpt1}`].push(node);
                } else break;
                n++;
            }

            n = 1;
            while(true) {
                const newpt2 = [pt2[0] + (rowdiff * -1 * n), pt2[1] + (coldiff * -1 * n)];
                if(newpt2[0] >= 0 && newpt2[0] < map.length && newpt2[1] >= 0 && newpt2[1] < map[0].length) {
                    if(!antinodes[`${newpt2}`]) antinodes[`${newpt2}`] = [];
                    antinodes[`${newpt2}`].push(node);
                } else break;
                n++;
            }
        }
    }
}

console.log(Object.keys(antinodes).length);