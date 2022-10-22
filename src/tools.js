const tools = {
    SpawnPoint: {
        tileStyle: {
            colour: "black",
            textColour: "white"
        },
        name: "Spawn Point",
        dimensions: { width: 1, height: 1 },
        max: 1,
        min: 1,
        category: "compulsory",
        description: "The point where the player initially spawns"
    },
    Key: {
        tileStyle: {
            colour: "gold",
            textColour: "white"
        },
        dimensions: { width: 1, height: 1 },
        max: 1,
        min: 1,
        category: "compulsory",
        description:
            "The key that the player is looking for, this can be placed ontop of other items, make sure to hide it well!"
    },
    Wall: {
        tileStyle: {
            colour: "grey"
        },
        dimensions: { width: 1, height: 1 },
        draggable: true
    },
    DiningTable: {
        tileStyle: {
            colour: "green"
        },
        dimensions: { width: 2, height: 2 },
        category: "Dining Room"
    },
    WallWithPainting: {
        name: "Wall With Painting",
        tileStyle: {
            colour: "red"
        },
        dimensions: { width: 1, height: 1 },
        draggable: true,
        interaction: {
            frequency: 2,
            duration: 2
        }
    },
    RockingChair: {
        name: "Rocking Chair",
        tileStyle: {
            colour: "yellow"
        },
        dimensions: { width: 1, height: 1 },
        interaction: {
            frequency: 30,
            duration: 5
        }
    },
    Bed: {
        tileStyle: {
            colour: "blue"
        },
        dimensions: { width: 1, height: 2 },
        category: "Bedroom"
    },
    BedsideTable: {
        name: "Bedside Table",
        tileStyle: {
            colour: "yellow"
        },
        dimensions: { width: 1, height: 1 },
        category: "Bedroom"
    },
    Wardrobe: {
        tileStyle: {
            colour: "cyan"
        },
        dimensions: { width: 2, height: 1 },
        category: "Bedroom"
    },
    TableWithLamp: {
        name: "Table with Lamp",
        tileStyle: {
            colour: "green"
        },
        dimensions: { width: 1, height: 1 },
        interaction: {
            frequency: 30,
            duration: 2
        }
    },
    Fridge: {
        tileStyle: {
            colour: "cyan"
        },
        dimensions: { width: 1, height: 1 },
        category: "Kitchen"
    },
    Oven: {
        tileStyle: {
            colour: "orange"
        },
        dimensions: { width: 1, height: 1 },
        category: "Kitchen"
    },
    CoffeeTable: {
        name: "Coffee Table",
        tileStyle: {
            colour: "brown",
            textColour: "white"
        },
        dimensions: { width: 2, height: 1 },
        category: "Living Room"
    },
    Bath: {
        tileStyle: {
            colour: "grey"
        },
        dimensions: { width: 4, height: 2 },
        category: "Bathroom"
    },
    Sink: {
        tileStyle: {
            colour: "blue"
        },
        dimensions: { width: 2, height: 1 },
        category: "Bathroom"
    },
    Toilet: {
        tileStyle: {
            colour: "brown",
            textColour: "white"
        },
        dimensions: { width: 1, height: 1 },
        category: "Bathroom"
    },
    Sofa: {
        tileStyle: {
            colour: "brown",
            textColour: "white"
        },
        dimensions: { width: 4, height: 1 },
        category: "Living Room"
    }
};

export default tools;
