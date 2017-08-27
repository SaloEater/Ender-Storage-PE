var pouchUI=null;

//var ICRenderLib = ModAPI.requireAPI("ICRenderLib");
//var TileRenderModel = ICore.requireGlobal("TileRenderModel");
IDRegistry.genBlockID("enderChest");
Block.createBlockWithRotation("enderChest", [{
    name: "Ender Chest",
    texture: [
        ["enderChestBottom", 0],
        ["enderChestTop", 0],
        ["enderChestSide", 0],
        ["enderChestSide", 0],
        ["enderChestSide", 0],
        ["enderChestSide", 0]
    ],
    inCreative: true
}]);
Translation.addTranslation("Ender Chest", {
    ru: "Сундук края"
});

IDRegistry.genItemID("enderPouch");
Item.createItem("enderPouch", "Ender Pouch", {
    name: "enderPouch",
    meta: 0
}, {
    stack: 1
});
Translation.addTranslation("Ender Pouch", {
    ru: "Рюкзак края"
});

Item.registerUseFunction("enderPouch", function(coords, item, block) {
	if(block.id!=BlockID.enderChest){
		enderStorage.openStorage(item);
	} else {
		//Game.message("Get from chest");
		Player.setCarriedItem(item.id, 1, World.getTileEntity(coords.x, coords.y, coords.z)?enderStorage.getIndexByColor(World.getTileEntity(coords.x, coords.y, coords.z).data.currentColor):enderStorage.getIndexByColor(World.addTileEntity(coords.x, coords.y, coords.z).data.currentColor));
	}
});

Callback.addCallback("tick", function() {
    if(pouchUI && !pouchUI.isOpened() && Player.getCarriedItem().id==ItemID.enderPouch){
		var playerPos = Entity.getPosition(Player.get());
		if(pouchUI.getSlot("dye1").count>0)World.drop(playerPos.x, playerPos.y, playerPos.z, pouchUI.getSlot("dye1").id, pouchUI.getSlot("dye1").count, pouchUI.getSlot("dye1").data);
		if(pouchUI.getSlot("dye2").count>0)World.drop(playerPos.x, playerPos.y, playerPos.z, pouchUI.getSlot("dye2").id, pouchUI.getSlot("dye2").count, pouchUI.getSlot("dye2").data);
		if(pouchUI.getSlot("dye3").count>0)World.drop(playerPos.x, playerPos.y, playerPos.z, pouchUI.getSlot("dye3").id, pouchUI.getSlot("dye3").count, pouchUI.getSlot("dye3").data);
		for(slot in pouchUI.slots){
			if(pouchUI.getSlot(slot).id==ItemID.enderPouch){
				World.drop(playerPos.x, playerPos.y, playerPos.z, pouchUI.getSlot(slot).id, pouchUI.getSlot(slot).count, pouchUI.getSlot(slot).data);
				pouchUI.clearSlot(slot);
			}
		}
		enderStorage.saveStorage(enderStorage.getColorByIndex(Player.getCarriedItem().data), pouchUI);
		pouchUI==null;
	}
});

//ModelHelper.createChestModel(BlockID.enderChest);

/*var ModelHelper = {
    createChestModel: function (blockID) {

        Block.setBlockShape(blockID, {x: 0, y: 0, z: 0}, {x: 0.95, y: 0.95, z: 0.95});

        var render = new TileRenderModel(blockID, 0);
        render.addBoxF(0.07, 0, 0.07, 0.93, 0.87, 0.93, {id: blockID, data: 0});
        render.addBoxF(0.43, 0.45, 0.93, 0.55, 0.7, 1, {id: 42, data: 0});

        var render = new TileRenderModel(blockID, 1);
        render.addBoxF(0.07, 0, 0.07, 0.93, 0.87, 0.93, {id: blockID, data: 1});
        render.addBoxF(0.44, 0.45, 0, 0.57, 0.7, 0.07, {id: 42, data: 0});

        var render = new TileRenderModel(blockID, 2);
        render.addBoxF(0.07, 0, 0.07, 0.93, 0.87, 0.93, {id: blockID, data: 2});
        render.addBoxF(0.93, 0.45, 0.45, 1, 0.7, 0.55, {id: 42, data: 0});

        var render = new TileRenderModel(blockID, 3);
        render.addBoxF(0.07, 0, 0.07, 0.93, 0.87, 0.93, {id: blockID, data: 3});
        render.addBoxF(0, 0.45, 0.44, 0.07, 0.7, 0.55, {id: 42, data: 0});

    }
};*/

Block.setBlockShape(BlockID.enderChest, {
    x: 0.07,
    y: 0,
    z: 0.07
}, {
    x: 0.93,
    y: 0.87,
    z: 0.93
});

Callback.addCallback("PostLoaded", function() {
    Recipes.addShaped({
        id: BlockID.enderChest,
        count: 1,
        data: 0
    }, [
        "bwb",
        "oco",
        "beb"
    ], ['b', 369, 0, 'w', 35, 0, 'o', 49, 0, 'c', 54, 0, 'e', 368, 0]);
	
	Recipes.addShaped({
        id: ItemID.enderPouch,
        count: 1,
        data: 0
    }, [
        "blb",
        "lel",
        "bwb"
    ], ['b', 377, 0, 'w', 35, 0, 'l', 334, 0,  'e', 368, 0]);
});

Block.registerPlaceFunction("enderChest", function(coords, item, block) {
    World.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, item.id, item.data); // установим наш блок
    World.addTileEntity(coords.relative.x, coords.relative.y, coords.relative.z).data.rotation = "x";
});

TileEntity.registerPrototype(BlockID.enderChest, {
    defaultValues: {
        currentColor: "0:0:0",
        rotation: "",
		saved: true
    },

    created: function() {

    },

    init: function() {
        this.initAnimation();
		this.container.read(enderStorage.getStorage(this.data.currentColor));
		this.setupColorBar();
    },
	
    getGuiScreen: function() {
		this.container.read(enderStorage.getStorage(this.data.currentColor));
		return enderChestGUI;
    },

    destroyBlock: function(coords, player) {
        this.destroyAnimation();
    },

	tick: function() {
		if (!this.container.isOpened() && ((this.container.getSlot("dye1").id == 0 ||this.container.getSlot("dye1").id == 35) && (this.container.getSlot("dye2").id == 35 || this.container.getSlot("dye2").id == 0) && (this.container.getSlot("dye3").id == 35|| this.container.getSlot("dye3").id == 0))) {
            var newColor = this.container.getSlot("dye1").data + ":" + this.container.getSlot("dye2").data + ":" + this.container.getSlot("dye3").data;
            if (this.data.currentColor != newColor) {
                //Game.message(this.data.currentColor + "-" + newColor);
                this.data.currentColor = newColor;
                this.updateAnimation();
				if(this.container.getSlot("dye1").count>1)World.drop(this.x, this.y + 0.1, this.z, 35, this.container.getSlot("dye1").count-1, this.container.getSlot("dye1").data);
				if(this.container.getSlot("dye2").count>1)World.drop(this.x, this.y + 0.1, this.z, 35, this.container.getSlot("dye2").count-1, this.container.getSlot("dye2").data);
				if(this.container.getSlot("dye3").count>1)World.drop(this.x, this.y + 0.1, this.z, 35, this.container.getSlot("dye3").count-1, this.container.getSlot("dye3").data);
				for(slot in this.container.slots){
					if(this.container.getSlot(slot).id==ItemID.enderPouch){
						World.drop(this.x, this.y, this.z, this.container.getSlot(slot).id, this.container.getSlot(slot).count, this.container.getSlot(slot).data);
						this.container.clearSlot(slot);
					}
				}
				enderStorage.saveStorage(this.data.currentColor, this.container);
				this.container.read(enderStorage.getStorage(this.data.currentColor));
				this.setupColorBar();
				this.data.saved=true;
            }
        }
		if(this.container.isOpened()&&this.data.saved){this.data.saved=false;}
		if(!this.container.isOpened() && !this.data.saved){
			//Game.message("Saved");
			this.data.saved=true;
		}
        
    },
	
    initAnimation: function() {
		//Game.message("Init colors");
        this.animation1 = new Animation.Item(this.x + 0.64, this.y+1, this.z + 0.43);
        this.animation1.describeItem({
            id: 35,
            count: 1,
            data: this.data.currentColor.split(":")[0],
            rotation: this.data.rotation,
            size: .25
        });
        this.animation1.load();

        this.animation2 = new Animation.Item(this.x + 0.43, this.y+1, this.z + 0.43);
        this.animation2.describeItem({
            id: 35,
            count: 1,
            data: this.data.currentColor.split(":")[1],
            rotation: this.data.rotation,
            size: .25
        });
        this.animation2.load();

        this.animation3 = new Animation.Item(this.x + 0.23, this.y+1, this.z + 0.43);
        this.animation3.describeItem({
            id: 35,
            count: 1,
            data: this.data.currentColor.split(":")[2],
            rotation: this.data.rotation,
            size: .25
        });
        this.animation3.load();
		
    },

    updateAnimation: function() {
        this.destroyAnimation();
        this.initAnimation();
    },

    destroyAnimation: function() {
        if (this.animation1) {
            this.animation1.destroy();
            this.animation1 = null;
        }
        if (this.animation2) {
            this.animation2.destroy();
            this.animation2 = null;
        }
        if (this.animation3) {
            this.animation3.destroy();
            this.animation3 = null;
        }
    },

	setupColorBar: function(){
		for(i=1; i<4; i++){
			this.container.getSlot("dye"+i).id=35;
			this.container.getSlot("dye"+i).data=this.data.currentColor.split(":")[i-1];
			this.container.getSlot("dye"+i).count=0;
		}
	}
    

});

/*TileEntity.registerPrototype(BlockID.enderChest, {
    defaultValues: {
        currentColor: "0:0:0",
        rotation: "",
		saved: true,
		openedUI: null
    },

    created: function() {

    },

    init: function() {
        this.initAnimation();
		this.data.openedUI = new UI.Container();
		this.data.openedUI.read(enderStorage.getStorage(this.data.currentColor));
		this.setupColorBar();
    },
	
    getGuiScreen: function() {
		//this.container.read(enderStorage.getStorage(this.data.currentColor));
		//this.setupColorBar();
		this.data.openedUI.openAs(enderChestGUI);
		Game.prevent();
		return;
    },

    destroyBlock: function(coords, player) {
        this.destroyAnimation();
    },

	tick: function() {
		if(this.data.openedUI.isOpened()&&this.data.saved)this.data.saved=false;
		if(!this.data.openedUI.isOpened() && !this.data.saved){
			//Game.message("Saved");
			//enderStorage.saveStorage(this.data.currentColor, this.container);
			this.data.saved=true;
		}
        if (!this.data.openedUI.isOpened() && (this.data.openedUI.getSlot("dye1").id == 35 || this.data.openedUI.getSlot("dye2").id == 35 || this.data.openedUI.getSlot("dye3").id == 35)) {
            var newColor = this.data.openedUI.getSlot("dye1").data + ":" + this.data.openedUI.getSlot("dye2").data + ":" + this.data.openedUI.getSlot("dye3").data;
            if (this.data.currentColor != newColor) {
                //Game.message(this.data.currentColor + "-" + newColor);
                this.data.currentColor = newColor;
                this.updateAnimation();
                this.data.openedUI.getSlot("dye1").count--;
                this.data.openedUI.validateSlot("dye1");
                this.data.openedUI.getSlot("dye2").count--;
                this.data.openedUI.validateSlot("dye2");
                this.data.openedUI.getSlot("dye3").count--;
                this.data.openedUI.validateSlot("dye3");
				this.data.openedUI.read(enderStorage.getStorage(this.data.currentColor));
				this.setupColorBar();
            }
        }
    },
	
    initAnimation: function() {
		//Game.message("Init colors");
        this.animation1 = new Animation.Item(this.x + 0.64, this.y+1, this.z + 0.43);
        this.animation1.describeItem({
            id: 35,
            count: 1,
            data: this.data.currentColor.split(":")[0],
            rotation: this.data.rotation,
            size: .25
        });
        this.animation1.load();

        this.animation2 = new Animation.Item(this.x + 0.43, this.y+1, this.z + 0.43);
        this.animation2.describeItem({
            id: 35,
            count: 1,
            data: this.data.currentColor.split(":")[1],
            rotation: this.data.rotation,
            size: .25
        });
        this.animation2.load();

        this.animation3 = new Animation.Item(this.x + 0.23, this.y+1, this.z + 0.43);
        this.animation3.describeItem({
            id: 35,
            count: 1,
            data: this.data.currentColor.split(":")[2],
            rotation: this.data.rotation,
            size: .25
        });
        this.animation3.load();
		
    },

    updateAnimation: function() {
        this.destroyAnimation();
        this.initAnimation();
    },

    destroyAnimation: function() {
        if (this.animation1) {
            this.animation1.destroy();
            this.animation1 = null;
        }
        if (this.animation2) {
            this.animation2.destroy();
            this.animation2 = null;
        }
        if (this.animation3) {
            this.animation3.destroy();
            this.animation3 = null;
        }
    },

	setupColorBar: function(){
		for(i=1; i<4; i++){
			this.data.openedUI.getSlot("dye"+i).id=35;
			this.data.openedUI.getSlot("dye"+i).data=this.data.currentColor.split(":")[i-1];
			this.data.openedUI.getSlot("dye"+i).count=0;
		}
	}

});*/

var enderStorage = {
	storages: {},
	
	getStorage: function(color){
		if(!this.storages[color])this.makeNewStorage(color);
		return this.storages[color];
	},
	
	getAll: function(){
		return this.storages;
	},
	
	loadAll: function(saved){
		this.storages = saved?saved:{};
	}, 
	
	makeNewStorage: function(color){
		this.storages[color]=new UI.Container().save();
	},
	
	saveStorage: function(color, container){
		this.storages[color]=container.save();
	},
	
	getIndexByColor: function(color){
		i=0;
		for(storage in this.storages){
			if(storage==color)return i;
			i++;
		}
		return 0;
	},
	
	getColorByIndex: function(index){
		for(storage in this.storages){
			////Game.message("Work on "+storage);
			if(index==0)return storage;
			index--;
		}
		return "0:0:0";
	},
	
	openStorage: function(item){
		var color = this.getColorByIndex(item.data);
		//Game.message("Will open "+ color+" for data: "+item.data);
		pouchUI = new UI.Container();
		pouchUI.read(this.getStorage(color));
		pouchUI.openAs(enderChestGUI);
		this.setupColorBar(color);
	},
	
	setupColorBar: function(color){
		for(i=1; i<4; i++){
			pouchUI.getSlot("dye"+i).id=35;
			pouchUI.getSlot("dye"+i).data=color.split(":")[i-1];
			pouchUI.getSlot("dye"+i).count=0;
		}
	}
};

var enderChestObj = {
    standart: {
        header: {
            text: {
                text: Translation.translate("Ender Chest")
            }
        },
        inventory: {
            standart: true
        },
        background: {
            standart: true
        },
        minHeight: 4 * 61
    },
    drawing: [],
    elements: {
        "dye1": {
            type: "slot",
            x: 320,
            y: 253
        },
        "dye2": {
            type: "slot",
            x: 381,
            y: 253
        },
        "dye3": {
            type: "slot",
            x: 442,
            y: 253
        }
    }
};

var slotsInRow = 0;
var xp = 320;
var yp = 40;
for (var i = 0; i < 27; i++) {
    enderChestObj.elements["slot" + i] = {
        type: "slot",
        x: xp,
        y: yp
    };
    xp += 61;
    slotsInRow++;
    if (slotsInRow == 10) {
        xp = 320;
        yp += 61;
        slotsInRow = 0;
    }
}

var enderChestGUI = new UI.StandartWindow(enderChestObj);

Saver.addSavesScope("enderStorageScope",
    function read(scope) {
        enderStorage.loadAll(scope);
    },

    function save() {
        return enderStorage.getAll();
    }
);
