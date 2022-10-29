import { json } from "express";
import tools from "../tools";
import { ERRORS } from "../consts";

const generateItemCount = (map, pathFindingSetup) => {
    const occurences = {};
    Object.keys(tools).forEach((toolName) => (occurences[toolName] = 0));

    map.forEach((row, columnIndex) => {
        row.forEach((item, rowIndex) => {
            if (item) {
                console.log(item);
                if (
                    item.parent.col === columnIndex &&
                    item.parent.row === rowIndex
                ) {
                    // is it the parent?
                    occurences[item.type.key]++;
                }

                if (item.shelfItems) {
                    if (!tools[item.type.key].hasShelf) {
                        // this item does not support shelves
                        throw Error(ERRORS.NO_AVAILABLE_SHELF);
                    }

                    item.shelfItems.forEach((name) => {
                        if (!tools[name].shelfPlaced) {
                            // this item can not be placed on a shelf
                            throw Error(ERRORS.NOT_SHELF_PLACEABLE);
                        }
                        occurences[name]++;

                        if (name === "Key") {
                            // add the location of the item that the key is on top of
                            pathFindingSetup.keyLocation = item.parent;
                        }
                    });
                }

                if (item.type.key === "SpawnPoint") {
                    pathFindingSetup.spawnLocation = item.parent;
                } else if (item.type.key === "Key") {
                    pathFindingSetup.keyLocation = item.parent;
                }
            }
        });
    });

    return occurences;
};

const isKeyAccessable = (map, pathFindingSetup) => {
    console.log("DIJKSTRA ALGO HERE");
};

const isMapValid = (map) => {
    const pathFindingSetup = {
        // pass this to generate item count to reduce the times we have to loop through the map
        spawnLocation: null,
        keyLocation: null
    };
    const occurences = generateItemCount(map, pathFindingSetup);
    Object.entries(occurences).forEach(([key, actualOccurences]) => {
        const respectiveTool = tools[key];
        if (respectiveTool.min && actualOccurences < respectiveTool.min) {
            throw Error(ERRORS.MIN_NOT_SATISFIED);
        }
        if (respectiveTool.max && actualOccurences > respectiveTool.max) {
            throw Error(ERRORS.MAX_NOT_SATISFIED);
        }
        if (
            respectiveTool.category === "compulsory" &&
            actualOccurences === 0
        ) {
            throw Error(ERRORS.MISSING_COMPULSORY);
        }
    });

    isKeyAccessable(map, pathFindingSetup);
};

export default isMapValid;
