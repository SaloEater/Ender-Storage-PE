var pouchUI=null, pouchOpened=false;

Callback.addCallback("LevelLoaded", function() {
	if(Translation.getLanguage()=="ru"){
		Game.message(Native.Color.GREEN + "Ender Storage");
		Game.message(Native.Color.GREEN + "Автор"+ Native.Color.WHITE + ": SaloEater");
		Game.message(Native.Color.WHITE + "vk.com/eepe_core")
	} else {
		Game.message(Native.Color.GREEN + "Ender Storage");
		Game.message(Native.Color.GREEN + "Author"+ Native.Color.WHITE + ": SaloEater");
		Game.message(Native.Color.WHITE + "vk.com/eepe_core")
	}
});

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
    ru: "Сундук Края"
});

IDRegistry.genItemID("enderPouch");
Item.createItem("enderPouch", "Ender Pouch", {
    name: "enderPouch",
    meta: 0
}, {
    stack: 1
});
Translation.addTranslation("Ender Pouch", {
    ru: "Рюкзак Края"
});


Callback.addCallback("PostLoaded", function() {
    
    pouchUI = new UI.Container();
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

Item.registerUseFunction("enderPouch", function(coords, item, block) {
    if(block.id!=BlockID.enderChest){
        enderStorage.openStorage(item);
        pouchOpened=true;
    } else {
        if(World.getTileEntity(coords.x, coords.y, coords.z)){
            Player.setCarriedItem(item.id, 1, enderStorage.getIndexByColor(World.getTileEntity(coords.x, coords.y, coords.z).data.currentColor));
        }
    }
});

Callback.addCallback("tick", function() {
    if(pouchOpened&& !pouchUI.isOpened() && Player.getCarriedItem().id==ItemID.enderPouch){
        var playerPos = Entity.getPosition(Player.get());   
        pouchUI.dropSlot("dye1", playerPos.x, playerPos.y, playerPos.z); 
        pouchUI.dropSlot("dye2", playerPos.x, playerPos.y, playerPos.z);
        pouchUI.dropSlot("dye3", playerPos.x, playerPos.y, playerPos.z);
        enderStorage.setupPouchColorBar(enderStorage.getColorByIndex(Player.getCarriedItem().data));
        for(slot in pouchUI.slots){
            if(pouchUI.getSlot(slot).id==ItemID.enderPouch && pouchUI.getSlot(slot).data==Player.getCarriedItem().data){
                pouchUI.dropSlot(slot, playerPos.x, playerPos.y, playerPos.z);
            }
        }
        enderStorage.saveStorage(enderStorage.getColorByIndex(Player.getCarriedItem().data), pouchUI);
        pouchOpened=false;
    }
    if(!pouchOpened && Player.getCarriedItem().id==ItemID.enderPouch){
        if(World.getThreadTime()%10==0)Game.tipMessage("\n\n\n\n"+Translation.translate("Ender Pouch")+enderStorage.makeOutput(Player.getCarriedItem().data));
    }
});

Block.setBlockShape(BlockID.enderChest, {
    x: .0625,
    y: 0,
    z: .0625
}, {
    x: .9375,
    y: .875,
    z: .9375
});

Block.registerPlaceFunction("enderChest", function(coords, item, block) {
    var yaw = Entity.getLookAngle(Player.get()).yaw*180/Math.PI%360;
    World.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, item.id, item.data);
    if(yaw<0)yaw+=360;
    //Game.message("Was "+(yaw-360)+" and get "+yaw);
    if((yaw<=45&&yaw>=0)||(yaw<=360&&yaw>315)){
        //Game.message("1");
        World.addTileEntity(coords.relative.x, coords.relative.y, coords.relative.z).data.type = 1; //z
    } else if(yaw<=135&&yaw>45){
        //Game.message("2");
        World.addTileEntity(coords.relative.x, coords.relative.y, coords.relative.z).data.type = 2; //x
    } else if(yaw<=225&&yaw>135){
        //Game.message("3");
        World.addTileEntity(coords.relative.x, coords.relative.y, coords.relative.z).data.type = 3; //z
    } else if(yaw<=315&&yaw>225){
        //Game.message("4");
        World.addTileEntity(coords.relative.x, coords.relative.y, coords.relative.z).data.type= 4; //x
    } 
    
});

TileEntity.registerPrototype(BlockID.enderChest, {
    defaultValues: {
        currentColor: "0:0:0",
        type: 0,
        saved: true,
        wasOpen: false,
    },

    created: function() {

    },

    init: function() {
        this.container.read(enderStorage.getStorage(this.data.currentColor));
        this.initAnimation();
        this.setupColorBar();
    },
    
    getGuiScreen: function() {
        //Game.message("Read "+this.data.currentColor);
        this.container.read(enderStorage.getStorage(this.data.currentColor));
        this.data.wasOpened=true;
        return enderChestGUI;
    },

    destroyBlock: function(coords, player) {
        enderStorage.saveStorage(this.data.currentColor, this.container);
        this.destroyAnimation();
    },

    tick: function() {
        if(World.getThreadTime()%10==0){
            if (this.data.wasOpened && !this.container.isOpened() && ((this.container.getSlot("dye1").id == 0 ||this.container.getSlot("dye1").id == 35) && (this.container.getSlot("dye2").id == 35 || this.container.getSlot("dye2").id == 0) && (this.container.getSlot("dye3").id == 35|| this.container.getSlot("dye3").id == 0))) {
                var newColor = this.container.getSlot("dye1").data + ":" + this.container.getSlot("dye2").data + ":" + this.container.getSlot("dye3").data;
                if (this.data.currentColor != newColor) {
                    if(this.container.getSlot("dye1").count>0)this.container.getSlot("dye1").count--;
                    if(this.container.getSlot("dye2").count>0)this.container.getSlot("dye2").count--;
                    if(this.container.getSlot("dye3").count>0)this.container.getSlot("dye3").count--;
                    //Game.message("Change color "+this.data.currentColor + " on " + newColor);
                    this.prepareDyeSlotsForSaving();
                    enderStorage.saveStorage(this.data.currentColor, this.container);
                    this.data.currentColor = newColor;
                    this.container.read(enderStorage.getStorage(this.data.currentColor));
                    this.updateAnimation();
                    this.setupColorBar();
                    this.data.saved=true;
                    this.data.wasOpened=false;
                }
            }
            if(this.container.isOpened()&&this.data.saved)this.data.saved=false;
            if(!this.container.isOpened() && !this.data.saved){
                this.prepareDyeSlotsForSaving();
                enderStorage.saveStorage(this.data.currentColor, this.container);
                this.data.saved=true;
                this.data.wasOpened=false;
                //Game.message("Saved");
            }
        } 
    },
    
    prepareDyeSlotsForSaving: function(){
        for(i=1; i<4; i++){
            this.container.dropSlot("dye"+i, this.x, this.y, this.z);
        }
        this.setupColorBar();
    },
    
    initAnimation: function() {
        ////Game.message("Init colors");
        switch(this.data.type){
            case 1:
                this.data.rotation="z";
                this.animation1 = new Animation.Item(this.x + 0.70, this.y+1, this.z + 0.5);
                this.animation1.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[0],
                    rotation: this.data.rotation,
                    size: .20
                });
                
                this.animation2 = new Animation.Item(this.x + 0.50, this.y+1, this.z + 0.5);
                this.animation2.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[1],
                    rotation: this.data.rotation,
                    size: .20
                });
                
                this.animation3 = new Animation.Item(this.x + 0.30, this.y+1, this.z + 0.5);
                this.animation3.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[2],
                    rotation: this.data.rotation,
                    size: .20
                });
                break;
                
            case 2:
                this.data.rotation="x";
                this.animation1 = new Animation.Item(this.x + 0.5, this.y+1, this.z + 0.7);
                this.animation1.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[0],
                    rotation: this.data.rotation,
                    size: .20
                });
                
                this.animation2 = new Animation.Item(this.x + 0.5, this.y+1, this.z + 0.5);
                this.animation2.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[1],
                    rotation: this.data.rotation,
                    size: .20
                });
                
                this.animation3 = new Animation.Item(this.x + 0.5, this.y+1, this.z + 0.3);
                this.animation3.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[2],
                    rotation: this.data.rotation,
                    size: .20
                });
                break;
                
            case 3:
                this.data.rotation="z";
                this.animation1 = new Animation.Item(this.x + 0.7, this.y+1, this.z + 0.5);
                this.animation1.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[0],
                    rotation: this.data.rotation,
                    size: .20
                });
                
                this.animation2 = new Animation.Item(this.x + 0.5, this.y+1, this.z + 0.5);
                this.animation2.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[1],
                    rotation: this.data.rotation,
                    size: .20
                });
                
                this.animation3 = new Animation.Item(this.x + 0.3, this.y+1, this.z + 0.5);
                this.animation3.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[2],
                    rotation: this.data.rotation,
                    size: .20
                });
                break;
                
            case 4:
                this.data.rotation="x";
                this.animation1 = new Animation.Item(this.x + 0.5, this.y+1, this.z + 0.7);
                this.animation1.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[0],
                    rotation: this.data.rotation,
                    size: .20
                });
                
                this.animation2 = new Animation.Item(this.x + 0.5, this.y+1, this.z + 0.5);
                this.animation2.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[1],
                    rotation: this.data.rotation,
                    size: .20
                });
                
                this.animation3 = new Animation.Item(this.x + 0.5, this.y+1, this.z + 0.3);
                this.animation3.describeItem({
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[2],
                    rotation: this.data.rotation,
                    size: .20
                });
                break;
        }
        
        this.animation1.load();

        this.animation2.load();

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

Translation.addTranslation("WHITE", {en: "W", ru: "Б"});
Translation.addTranslation("ORANGE", {en: "O", ru: "O"});
Translation.addTranslation("MAGENTA", {en: "M", ru: "С"});
Translation.addTranslation("LIGHTBLUE", {en: "B", ru: "С"});
Translation.addTranslation("YELLOW", {en: "Y", ru: "Ж"});
Translation.addTranslation("LIME", {en: "L", ru: "Л"});
Translation.addTranslation("PINK", {en: "P", ru: "Р"});
Translation.addTranslation("GRAY", {en: "G", ru: "C"});
Translation.addTranslation("LIGHTGRAY", {en: "G", ru: "C"});
Translation.addTranslation("CYAN", {en: "C", ru: "Б"});
Translation.addTranslation("PURPLE", {en: "P", ru: "Ф"});
Translation.addTranslation("BLUE", {en: "B", ru: "C"});
Translation.addTranslation("BROWN", {en: "B", ru: "К"});
Translation.addTranslation("GREEN", {en: "G", ru: "З"});
Translation.addTranslation("RED", {en: "R", ru: "К"});
Translation.addTranslation("BLACK", {en: "B", ru: "Ч"});

var enderStorage = {
    storages: {},
    
    colors:{
        0: Native.Color.WHITE+Translation.translate("WHITE"),
        1: Native.Color.GOLD+Translation.translate("ORANGE"),
        2: Native.Color.LIGHT_PURPLE+Translation.translate("MAGENTA"),
        3: Native.Color.AQUA+Translation.translate("LIGHTBLUE"),
        4: Native.Color.YELLOW+Translation.translate("YELLOW"),
        5: Native.Color.GREEN+Translation.translate("LIME"),
        6: Native.Color.RED+Translation.translate("PINK"),
        7: Native.Color.DARK_GRAY+Translation.translate("GRAY"),
        8: Native.Color.GRAY+Translation.translate("LIGHTGRAY"),
        9: Native.Color.DARK_AQUA+Translation.translate("CYAN"),
        10: Native.Color.DARK_PURPLE+Translation.translate("PURPLE"),
        11: Native.Color.DARK_BLUE+Translation.translate("BLUE"),
        12: Native.Color.DARK_RED+Translation.translate("BROWN"),
        13: Native.Color.DARK_GREEN+Translation.translate("GREEN"),
        14: Native.Color.RED+Translation.translate("RED"),
        15: Native.Color.BLACK+Translation.translate("BLACK")
    },
    
    getStorage: function(color){
        if(!this.storages[color])this.makeNewStorage(color);
        return this.storages[color];
    },
    
    setStorage: function(color, container){
        this.storages[color]=container.save();
    },
    
    getAll: function(){
        return this.storages;
    },
    
    loadAll: function(saved){
        this.storages = saved?saved:{};
    }, 
    
    makeNewStorage: function(color){
        this.setStorage(color, new UI.Container());
    },
    
    saveStorage: function(color, container){
        this.setupDyeSlots(color, container);
        this.setStorage(color, container);
    },
    
    setupDyeSlots: function(color, container){
        for(i=1;i<4;i++){
            container.getSlot("dye"+i).id=35;
            container.getSlot("dye"+i).data=color.split(":")[i-1];
            container.getSlot("dye"+i).count=0;
        }
        return container;
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
            //////Game.message("Work on "+storage);
            if(index==0)return storage;
            index--;
        }
        return "0:0:0";
    },
    
    openStorage: function(item){
        var color = this.getColorByIndex(item.data);
        //Game.message("Will open pouch "+ color+" for data: "+item.data);
        pouchUI.read(this.getStorage(color));
        pouchUI.openAs(enderChestGUI);
        this.setupPouchColorBar(color);
    },
    
    setupPouchColorBar: function(color){
        for(i=1; i<4; i++){
            pouchUI.getSlot("dye"+i).id=35;
            pouchUI.getSlot("dye"+i).data=color.split(":")[i-1];
            pouchUI.getSlot("dye"+i).count=0;
        }
    },
    
    getChatSymbol: function(index){
        return this.colors[index];
    },
    
    makeOutput: function(data){
        var color = this.getColorByIndex(data);
        //Game.message("Color "+color+" for data "+data);
        return " "+this.getChatSymbol(color.split(":")[0])+Native.Color.WHITE+":"+this.getChatSymbol(color.split(":")[1])+Native.Color.WHITE+":"+this.getChatSymbol(color.split(":")[2]);
    },
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