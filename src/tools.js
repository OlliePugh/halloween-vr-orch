const tools = {
    SpawnPoint: {
        tileStyle: {
            colour: "black",
            textColour: "white"
        },
        name: "Spawn Point",
        dimensions: { width: 1, height: 1 },
        max: 1,
        min: 1
    },
    Wall: {
        tileStyle: {
            colour: "grey"
        },
        dimensions: { width: 1, height: 1 },
        draggable: true
    },
    Table: {
        tileStyle: {
            colour: "green"
        },
        dimensions: { width: 2, height: 3 }
    },
    WallWithPainting: {
        name: "Wall With Painting",
        tileStyle: {
            colour: "red"
        },
        dimensions: { width: 1, height: 1 },
        draggable: true
    },
    Bed: {
        tileStyle: {
            colour: "blue"
        },
        dimensions: { width: 1, height: 2 }
    },
    BedsideTable: {
        name: "Bedside Table",
        tileStyle: {
            colour: "yellow"
        },
        dimensions: { width: 1, height: 1 }
    },
    Wardrobe: {
        name: "Wardrobe",
        tileStyle: {
            colour: "cyan"
        },
        dimensions: { width: 2, height: 1 }
    }
};

export default tools;
