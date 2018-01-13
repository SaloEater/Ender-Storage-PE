var pouchUI=null, pouchOpened=false;

var enderStorage = {
	
    storages: {},
    
    colors:
	{
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
	
    getStorage: function(color)
	{
        if(!this.storages[color])this.makeNewStorage(color);
        return this.storages[color];
    },
    
    setStorage: function(color, container)
	{
        this.storages[color]=container;
    },
    
    getAll: function()
	{
        return this.storages;
    },
    
    loadAll: function(saved)
	{
        this.storages = saved?saved:{};
    }, 
    
    makeNewStorage: function(color)
	{
        this.setStorage(color, new UI.Container());
this.setupDyeSlots(color, this.getStorage(color));
    },
    
    saveStorage: function(color, container)
	{
        this.setupDyeSlots(color, container);
        this.setStorage(color, container);
    },
    
    setupDyeSlots: function(color, container)
	{
        for(i=1;i<4;i++)
		{
//container.setSlot
            container.getSlot("dye"+i).id=35;
            container.getSlot("dye"+i).data=color.split(":")[i-1];
            container.getSlot("dye"+i).count=1;
        }
        return container;
    },

    getIndexByColor: function(color)
	{
        i=0;
        for(storage in this.storages)
		{
            if(storage==color)return i;
            i++;
        }
        return 0;
    },
    
    getColorByIndex: function(index)
	{
        for(storage in this.storages)
		{
            //////Game.message("Work on "+storage);
            if(index==0)return storage;
            index--;
        }
        return "0:0:0";
    },
    
    openStorage: function(item)
	{
        var color = this.getColorByIndex(item.data);
        //Game.message("Will open pouch "+ color+" for data: "+item.data);
        pouchUI = this.getStorage(color);
        pouchUI.openAs(enderPouchGUI);
        this.setupPouchColorBar(color);
    },
    
    setupPouchColorBar: function(color)
	{
        for(i=1; i<4; i++)
		{
pouchUI.setSlot("dye"+i, 35, 1, color.split(":")[i-1]);
        }
    },
    
    getChatSymbol: function(index)
	{
        return this.colors[index];
    },
    
    makeOutput: function(data)
	{
        var color = this.getColorByIndex(data);
        //Game.message("Color "+color+" for data "+data);
        return " "+this.getChatSymbol(color.split(":")[0])+Native.Color.WHITE+":"+this.getChatSymbol(color.split(":")[1])+Native.Color.WHITE+":"+this.getChatSymbol(color.split(":")[2]);
    },
};

Callback.addCallback("LevelLoaded", function() 
{
	Game.message(Native.Color.GREEN + "Ender Storage");
	Game.message(Native.Color.GREEN + "Author"+ Native.Color.WHITE + ": SaloEater");
});

IDRegistry.genBlockID("enderChest");
Block.createBlockWithRotation("enderChest", [
{
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

Translation.addTranslation("Ender Chest", 
{
    ru: "Сундук Края"
});

IDRegistry.genItemID("enderPouch");
Item.createItem("enderPouch", "Ender Pouch", 
{
    name: "enderPouch",
    meta: 0
}, 
{
    stack: 1
});
Translation.addTranslation("Ender Pouch",
{
    ru: "Рюкзак Края"
});


Callback.addCallback("PostLoaded", function() 
{
    
    pouchUI = new UI.Container();
	
    Recipes.addShaped
	({
        id: BlockID.enderChest,
        count: 1,
        data: 0
    }, 
	[
        "bwb",
        "oco",
        "beb"
    ], 
	['b', 369, 0, 'w', 35, 0, 'o', 49, 0, 'c', 54, 0, 'e', 368, 0]);

	Recipes.addShaped(
	{
		id: ItemID.enderPouch,
		count: 1,
		data: 0
	}, 
	[
		"blb",
		"lel",
		"bwb"
	], 
	['b', 377, 0, 'w', 35, 0, 'l', 334, 0,  'e', 368, 0]);
		
});

Item.registerUseFunction("enderPouch", function(coords, item, block) 
{
    if(block.id!=BlockID.enderChest)
	{
        enderStorage.openStorage(item);
        pouchOpened=true;
    } else 
	{
        if(World.getTileEntity(coords.x, coords.y, coords.z))
		{
            Player.setCarriedItem(item.id, 1, enderStorage.getIndexByColor(World.getTileEntity(coords.x, coords.y, coords.z).data.currentColor));
        }
    }
});

Callback.addCallback("tick", function() 
{
    if(pouchOpened&& !pouchUI.isOpened() && Player.getCarriedItem().id==ItemID.enderPouch)
	{
        var playerPos = Entity.getPosition(Player.get());   
        enderStorage.setupPouchColorBar(enderStorage.getColorByIndex(Player.getCarriedItem().data));
        for(slot in pouchUI.slots)
		{
            if(pouchUI.getSlot(slot).id==ItemID.enderPouch && pouchUI.getSlot(slot).data==Player.getCarriedItem().data)
			{
                pouchUI.dropSlot(slot, playerPos.x, playerPos.y, playerPos.z);
            }
        }
        //enderStorage.saveStorage(enderStorage.getColorByIndex(Player.getCarriedItem().data), pouchUI);
        pouchOpened=false;
    }
    if(!pouchOpened && Player.getCarriedItem().id==ItemID.enderPouch)
	{
        if(World.getThreadTime()%10==0)Game.tipMessage("\n\n\n\n"+Translation.translate("Ender Pouch")+enderStorage.makeOutput(Player.getCarriedItem().data));
    }
});

Block.setBlockShape(BlockID.enderChest, 
{
    x: .0625,
    y: 0,
    z: .0625
}, 
{
    x: .9375,
    y: .875,
    z: .9375
});

Block.registerPlaceFunction("enderChest", function(coords, item, block) 
{
    var yaw = Entity.getLookAngle(Player.get()).yaw*180/Math.PI%360;
    World.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, item.id, item.data);
    if(yaw<0)yaw+=360;
    //Game.message("Was "+(yaw-360)+" and get "+yaw);
    if((yaw<=45&&yaw>=0)||(yaw<=360&&yaw>315))
	{
        //Game.message("1");
        World.addTileEntity(coords.relative.x, coords.relative.y, coords.relative.z).data.type = 1; //z
    } else 
	if(yaw<=135&&yaw>45)
	{
        //Game.message("2");
        World.addTileEntity(coords.relative.x, coords.relative.y, coords.relative.z).data.type = 2; //x
    } else 
	if(yaw<=225&&yaw>135)
	{
        //Game.message("3");
        World.addTileEntity(coords.relative.x, coords.relative.y, coords.relative.z).data.type = 3; //z
    } else 
	if(yaw<=315&&yaw>225)
	{
        //Game.message("4");
        World.addTileEntity(coords.relative.x, coords.relative.y, coords.relative.z).data.type= 4; //x
    } 
    
});

TileEntity.registerPrototype(BlockID.enderChest, 
{
    defaultValues: 
	{
        currentColor: "0:0:0",
        type: 0
    },

    created: function() 
	{

    },

	getTransportSlots: function() 
	{
        var inputA=[], outputA=[];
        for (i = 0; i < 27; i++) 
		{
            inputA.push("slot" + i);
            outputA.push("slot" + i);
		}
        return {
            input: inputA,
            output: outputA
        };
    },
	
    init: function() 
	{
        this.container = enderStorage.getStorage(this.data.currentColor);
this.container.setParent(this);
        this.setupColorBar();
        this.initAnimation();
    },
	
    getGuiScreen: function() 
	{
        //Game.message("Read "+this.data.currentColor);
        /*this.container = enderStorage.getStorage(this.data.currentColor);
this.container.setParent(this);*/
this.setupColorBar();
        return enderChestGUI;
    },
	
    destroyBlock: function(coords, player) 
	{
		//enderStorage.saveStorage(this.data.currentColor, this.container);
        this.destroyAnimation();
		this.container = new UI.Container();
    },

    tick: function() 
	{
        /*if(World.getThreadTime()%10==0)
		{
            if (this.data.wasOpened && !this.container.isOpened() && ((this.container.getSlot("dye1").id == 0 ||this.container.getSlot("dye1").id == 35) && (this.container.getSlot("dye2").id == 35 || this.container.getSlot("dye2").id == 0) && (this.container.getSlot("dye3").id == 35|| this.container.getSlot("dye3").id == 0))) 
			{
                var newColor = this.container.getSlot("dye1").data + ":" + this.container.getSlot("dye2").data + ":" + this.container.getSlot("dye3").data;
                if (this.data.currentColor != newColor) 
				{
                    if(this.container.getSlot("dye1").count>0)this.container.getSlot("dye1").count--;
                    if(this.container.getSlot("dye2").count>0)this.container.getSlot("dye2").count--;
                    if(this.container.getSlot("dye3").count>0)this.container.getSlot("dye3").count--;
                    //Game.message("Change color "+this.data.currentColor + " on " + newColor);
                    this.prepareDyeSlotsForSaving();
                    enderStorage.saveStorage(this.data.currentColor, this.container);
                    this.data.currentColor = newColor;
                    this.container = enderStorage.getStorage(this.data.currentColor);
                    this.updateAnimation();
                    this.setupColorBar();
                    this.data.saved=true;
                    this.data.wasOpened=false;
                }
            }
            if(this.container.isOpened()&&this.data.saved)this.data.saved=false;
            if(!this.container.isOpened() && !this.data.saved)
			{
                this.prepareDyeSlotsForSaving();
                enderStorage.saveStorage(this.data.currentColor, this.container);
                this.data.saved=true;
                this.data.wasOpened=false;
                //Game.message("Saved");
            }
        }*/
    },
    
    prepareDyeSlotsForSaving: function()
	{
        for(i=1; i<4; i++)
		{
            this.container.dropSlot("dye"+i, this.x, this.y, this.z);
        }
        this.setupColorBar();
    },
    
    initAnimation: function() 
	{
        ////Game.message("Init colors");
        switch(this.data.type)
		{
            case 1:
                this.data.rotation="z";
                this.animation1 = new Animation.Item(this.x, this.y+0.875+0.125/3, this.z + 0.5);
                this.animation1.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[0],
                    rotation: this.data.rotation,
                    size: .125
                });
                
                this.animation2 = new Animation.Item(this.x, this.y+0.875+0.125/3, this.z + 0.5);
                this.animation2.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[1],
                    rotation: this.data.rotation,
                    size: .125
                });
                
                this.animation3 = new Animation.Item(this.x, this.y+0.875+0.125/3, this.z + 0.5);
                this.animation3.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[2],
                    rotation: this.data.rotation,
                    size: .125
                });
                break;
                
            case 2:
                this.data.rotation="x";
                this.animation1 = new Animation.Item(this.x + 0.5, this.y+0.875+0.125/3, this.z + 0.65);
                this.animation1.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[0],
                    rotation: this.data.rotation,
                    size: .125
                });
                
                this.animation2 = new Animation.Item(this.x + 0.5, this.y+0.875+0.125/3, this.z + 0.45);
                this.animation2.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[1],
                    rotation: this.data.rotation,
                    size: .125
                });
                
                this.animation3 = new Animation.Item(this.x + 0.5, this.y+0.875+0.125/3, this.z + 0.35);
                this.animation3.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[2],
                    rotation: this.data.rotation,
                    size: .125
                });
                break;
                
            case 3:
                this.data.rotation="z";
                this.animation1 = new Animation.Item(this.x + 0.65, this.y+0.875+0.125/3, this.z + 0.5);
                this.animation1.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[0],
                    rotation: this.data.rotation,
                    size: .125
                });
                
                this.animation2 = new Animation.Item(this.x + 0.45, this.y+0.875+0.125/3, this.z + 0.5);
                this.animation2.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[1],
                    rotation: this.data.rotation,
                    size: .125
                });
                
                this.animation3 = new Animation.Item(this.x + 0.35, this.y+0.875+0.125/3, this.z + 0.5);
                this.animation3.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[2],
                    rotation: this.data.rotation,
                    size: .125
                });
                break;
                
            case 4:
                this.data.rotation="x";
                this.animation1 = new Animation.Item(this.x + 0.5, this.y+0.875+0.125/3, this.z + 0.65);
                this.animation1.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[0],
                    rotation: this.data.rotation,
                    size: .125
                });
                
                this.animation2 = new Animation.Item(this.x + 0.5, this.y+0.875+0.125/3, this.z + 0.50);
                this.animation2.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[1],
                    rotation: this.data.rotation,
                    size: .125
                });
                
                this.animation3 = new Animation.Item(this.x + 0.5, this.y+0.875+0.125/3, this.z + 0.35);
                this.animation3.describeItem(
				{
                    id: 35,
                    count: 1,
                    data: this.data.currentColor.split(":")[2],
                    rotation: this.data.rotation,
                    size: .125
                });
                break;
        }
        
        this.animation1.load();

        this.animation2.load();

        this.animation3.load();
        
    },

    updateAnimation: function() 
	{
        this.destroyAnimation();
        this.initAnimation();
    },

    destroyAnimation: function() 
	{
        if (this.animation1) 
		{
            this.animation1.destroy();
            this.animation1 = null;
        }
        if (this.animation2) 
		{
            this.animation2.destroy();
            this.animation2 = null;
        }
        if (this.animation3) 
		{
            this.animation3.destroy();
            this.animation3 = null;
        }
    },

    setupColorBar: function()
	{
        for(i=1; i<4; i++)
		{
this.container.setSlot("dye"+i,35, 1, this.data.currentColor.split(":")[i-1]);
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

var enderPouchObj = 
{
    standart: 
	{
        header: 
		{
            text: 
			{
                text: Translation.translate("Ender Chest")
            }
        },
        inventory: 
		{
            standart: true
        },
        background: 
		{
            standart: true
        },
        minHeight: 4 * 61
    },
    drawing: [],
    elements: 
	{
        "dye1": 
		{
            type: "slot",
            x: 320,
            y: 253,
			visual: true
        },
        "dye2": 
		{
            type: "slot",
            x: 381,
            y: 253,
			visual: true
        },
        "dye3": 

		{
            type: "slot",
            x: 442,
            y: 253,
			visual: true
        }
    }
};

var slotsInRow = 0;
var xp = 320;
var yp = 40;
for (var i = 0; i < 27; i++) 
{
    enderPouchObj.elements["slot" + i] = 
	{
        type: "slot",
        x: xp,
        y: yp
    };
    xp += 61;
    slotsInRow++;
    if (slotsInRow == 10) 
	{
        xp = 320;
        yp += 61;
        slotsInRow = 0;
    }
}

var enderPouchGUI = new UI.StandartWindow(enderPouchObj);

var enderChestObj = 
{
	standart: 
	{
		header: 
		{
			text: 
			{
				text: Translation.translate("Ender Chest")
			}
		},
		inventory: 
		{
			standart: true
		},
		background: 
		{
			standart: true
		},
		minHeight: 4 * 61
	},
	drawing: [],
	elements: 
	{
		"dye1": 
		{
			type: "slot",
			x: 320,
			y: 253,
			visual: true
		},
		"dye2": 
		{
			type: "slot",
			x: 381,
			y: 253,
			visual: true
		},
		"dye3": 
		{
			type: "slot",
			x: 442,
			y: 253,
			visual: true
		},
		"dye1Editor":
		{
			type: "slot",
			x: 320,
			y: 314
		},
		"dye2Editor":
		{
			type: "slot",
			x: 381,
			y: 314
		},
		"dye3Editor":
		{
			type: "slot",
			x: 442,
			y: 314
		},
		"applyColor":
		{
			type: "button",
			x: 503,
			y: 314,
			bitmap: "buttonACOff",
			bitmap2: "buttonACOn",
			scale: 3.6,
			clicker: 
			{
				onClick: function(a, b, c, d, e, f, g) 
				{
					//Game.message("Pressed");
					if(b.getSlot("dye1Editor").id==35&&b.getSlot("dye1Editor").count==1&&
					   b.getSlot("dye2Editor").id==35&&b.getSlot("dye2Editor").count==1&&
					   b.getSlot("dye3Editor").id==35&&b.getSlot("dye3Editor").count==1)
					{	
						//Game.message("First2");
//Game.message(c.data.currentColor);
						var newColor = b.getSlot("dye1Editor").data+":"+b.getSlot("dye2Editor").data+":"+b.getSlot("dye3Editor").data;
						if(newColor!=c.data.currentColor){
							c.data.currentColor = newColor;
	//Game.message(c.data.currentColor);
							//Game.message("Before 1");
							b.clearSlot("dye1Editor");
							//Game.message("Before 2");
							b.clearSlot("dye2Editor");
							//Game.message("Before 3");
							b.clearSlot("dye3Editor");
							b.close();
							var parent = b.getParent();
	//Game.message("Before container")

							c.container = enderStorage.getStorage(c.data.currentColor);
	//Game.message("Before parent");
							c.container.setParent(parent);
	//Game.message("Before setup");
							c.setupColorBar();		
	//Game.message("Before anim");				
							c.updateAnimation();
						} else {
							Game.message("Данный цвет является активным, выберите другой цвет!");
						}
					} else 
					{
						//Всплывающая ошибка в каком слоте не тот предмет
						var err1 = b.getSlot("dye1Editor").id!=35?"Поместите шерсть в первый слот":(b.getSlot("dye1Editor").count>1?"Поместите всего лишь одну шерсть в первый слот":"");
						var err2 = b.getSlot("dye2Editor").id!=35?"Поместите шерсть во второй слот":(b.getSlot("dye2Editor").count>1?"Поместите всего лишь одну шерсть во второй слот":"");
						var err3 = b.getSlot("dye3Editor").id!=35?"Поместите шерсть в третий слот":(b.getSlot("dye3Editor").count>1?"Поместите всего лишь одну шерсть в третий слот":"");
						Game.message(err1);
						Game.message(err2);
						Game.message(err3);
					}
				}
			}
		}
	}
};	
var slotsInRow = 0;
var xp = 320;
var yp = 40;
for (var i = 0; i < 27; i++) 
{
	enderChestObj.elements["slot" + i] = 
	{
		type: "slot",
		x: xp,
		y: yp
	};
	xp += 61;
	slotsInRow++;
	if (slotsInRow == 10) 
	{
		xp = 320;
		yp += 61;
		slotsInRow = 0;
	}
}
var enderChestGUI = new UI.StandartWindow(enderChestObj);			

Saver.addSavesScope("enderStorageScope",
    function read(scope) 
	{
        enderStorage.loadAll(scope);
    },

    function save() 
	{
        return enderStorage.getAll();
    }
);

/*
A: x,y,
B: getBinding,openAs,binding,setBinding,close,onCloseListener,tileEntity,setSlot,getValue,class,validateSlot,fullSlot,applyChanges,element,value,isOpened,scale,toString,getFieldSlot,getGuiContent,dropAt,_removeElement,isElementTouched,getText,setScale,notify,notifyAll,window,guiScreen,dropSlot,getFullSlot,setWbSlotNamePrefix,setText,onWindowClosed,getClass,equals,elementTouched,guiContent,clearSlot,setParent,slots,getWindow,setOnCloseListener,asScriptableField,getGuiScreen,slot,hashCode,getSlot,refreshSlots,wait,getParent,getElement,parent,validateAll,_addElement,text,opened,wbSlotNamePrefix,fieldSlot,
*/
