Ext.require([
    'Redwood.view.ActionCollection'
]);

Ext.define('Redwood.view.TestCaseView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.testcaseview',
    overflowY: 'auto',
    bodyPadding: 5,
    myData:[],
    dataRecord: null,
    dirty: false,
    loadingData: false,

    initComponent: function () {
        var formId = Ext.uniqueId();
        var me = this;

        this.markDirty = function(){
            this.dirty = true;
            if(me.title.charAt(me.title.length-1) != "*"){
                me.setTitle(me.title+"*")
            }
        };
        me.on("beforeclose",function(panel){
            if (this.dirty == true){
                var me = this;
                Ext.Msg.show({
                    title:'Save Changes?',
                    msg: 'You are closing a tab that has unsaved changes. Would you like to save your changes?',
                    buttons: Ext.Msg.YESNOCANCEL,
                    icon: Ext.Msg.QUESTION,
                    fn: function(id){
                        if (id == "no"){
                            me.destroy();
                        }
                        if (id == "yes"){
                            var editor = me.up('testcases');
                            editor.fireEvent('saveTestCase');
                            me.destroy();
                        }
                    }
                });
                return false;
            }
        });



        /*
        var descResizer = Ext.create('Ext.resizer.Resizer', {
            target: 'elToResize',
            handles: 'all',
            minWidth: 200,
            minHeight: 100,
            maxWidth: 500,
            maxHeight: 400,
            pinned: true
        });
        */

        this.items = [
            {
                xtype: 'fieldset',
                title: 'Test Case Details',
                defaultType: 'textfield',
                itemId:"testcaseDetails",
                flex: 1,
                collapsible: true,
                defaults: {
                    flex: 1
                },
                items: [
                    {
                        fieldLabel: "Name",
                        allowBlank: false,
                        labelStyle: "font-weight: bold",
                        itemId:"name",
                        anchor:'90%',
                        listeners:{
                            change: function(){
                                if (me.loadingData === false){
                                    me.markDirty();
                                }
                            }
                        }
                    },
                    {
                        xtype: "htmleditor",
                        fieldLabel: "Description",
                        allowBlank: true,
                        margin: "0 0 7 0",
                        itemId:"description",
                        height: 180,
                        anchor:'90%',
                        listeners:{
                            change: function(){
                                if (me.loadingData === false){
                                    me.markDirty();
                                }
                            }
                        }
                    }
                    ,
                    {
                        xtype: "combo",
                        width: 240,
                        afterLabelTextTpl: this.requiredText,
                        fieldLabel: 'Status',
                        store: ["To be Automated","Automated","Needs Maintenance"],
                        value: "To be Automated",
                        name: 'status',
                        itemId: 'status',
                        forceSelection: true,
                        editable: false,
                        allowBlank: false,
                        listeners:{
                            change: function(){
                                if (me.loadingData === false){
                                    me.markDirty();
                                }
                            }
                        }
                    },
                    {
                        xtype:"combofieldbox",
                        typeAhead:true,
                        fieldLabel: "Tags",
                        displayField:"value",
                        descField:"value",
                        height:24,
                        anchor:'90%',
                        //labelWidth: 100,
                        forceSelection:false,
                        createNewOnEnter:true,
                        encodeSubmitValue:true,
                        autoSelect: true,
                        createNewOnBlur: true,
                        store:Ext.data.StoreManager.lookup('TestCaseTags'),
                        valueField:"value",
                        queryMode: 'local',
                        maskRe: /[a-z_0-9_A-Z_-]/,
                        removeOnDblClick:true,
                        itemId:"tag",
                        listeners:{
                            change: function(){
                                if (me.loadingData === false){
                                    me.markDirty();
                                }
                            }
                        }
                    }
                    ,
                    {
                        xtype: "radiogroup",
                        fieldLabel:"Test Case Type",
                        labelStyle: "font-weight: bold",
                        itemId:"type",
                        allowBlank:false,
                        width:200,
                        items:[
                            { boxLabel: 'Script', name:"type",inputValue: 'script',width:70,checked: false,formId:formId},
                            { boxLabel: 'Action Collection',name:"type", inputValue: 'collection',checked:true,width:200,formId:formId}
                        ]
                        ,
                        listeners: {
                            change: function(me,newVal,oldVal){
                                if(newVal.type == "script"){
                                    me.up("testcaseview").down("#actionCollectionFiledSet").hide();
                                    me.up("testcaseview").down("scriptPicker").show();
                                }else{
                                    me.up("testcaseview").down("#actionCollectionFiledSet").show();
                                    me.up("testcaseview").down("scriptPicker").hide();
                                }
                                if (me.up("testcaseview").loadingData === false){
                                    me.up("testcaseview").markDirty();
                                }

                            }
                        }
                    }
                ]
            },
            {
                xtype: 'fieldset',
                hidden: false,
                title: 'Action Collection',
                flex: 1,

                layout:"hbox",
                constrainAlign: true,

                collapsible: true,
                itemId:"actionCollectionFiledSet",
                items:[
                    {
                        xtype:"actioncollection",
                        flex: 1,
                        listeners:{
                            afterrender: function(collection){
                                collection.parentPanel = me;
                                collection.markDirty = function(){me.markDirty()}
                            }
                        }
                    }
                ]
            },
            {
                xtype: "scriptPicker",
                hidden: true,
                width: 700,
                listeners: {
                    change: function(){
                        if (me.loadingData == false){
                            me.markDirty();
                        }
                    }
                }
            }
        ];

        this.callParent(arguments);
    },
    listeners:{
        afterrender: function(me){
            me.loadingData = true;
            if (me.dataRecord != null){
                me.down("#name").setValue(me.dataRecord.get("name"));
                me.down("#tag").setValue(me.dataRecord.get("tag"));
                me.down("#status").setValue(me.dataRecord.get("status"));
                me.down("#description").setValue(me.dataRecord.get("description"));
                me.down("#type").setValue({type:me.dataRecord.get("type")});
                me.down("scriptPicker").setValue(me.dataRecord.get("script"));
                me.down("actioncollection").loadCollection(me.dataRecord.get("collection"));

            }
            else{
                me.down("actioncollection").loadCollection("");
            }
            me.loadingData = false;
            me.down("#name").focus();
        }
    },

    validate: function(store){
        if (this.down("#name").validate() == false){
            this.down("#name").focus();
            return false;
        }
        var index = store.findExact("name",this.down("#name").getValue());
        if (this.dataRecord != null){
            if (index != -1){
                var foundID = store.getAt(index).internalId;
                if (this.dataRecord.internalId != foundID){
                    this.down("#name").focus();
                    Ext.Msg.alert('Error', "Test Case with the same name already exits.");
                    return false;
                }
            }
        }
        else{
            if (index != -1){
                this.down("#name").focus();
                Ext.Msg.alert('Error', "Test Case with the same name already exits.");
                return false;
            }
        }

        if (this.down("#status").getValue() == "Automated"){
            if (this.down("#type").getValue().type == "script"){

                if (this.down("scriptPicker").getValue() == ""){
                    this.down("scriptPicker").focus();
                    Ext.Msg.alert('Error', "You must select script for this action.");
                    return false;
                }
            }
            else{
                if (this.down("actioncollection").getCollectionData().length == 0){
                    Ext.Msg.alert('Error', "You must add actions to action collection.");
                    return false;
                }
            }
        }

    },

    getTestCaseData: function(){
        var testcase = {};
        testcase.name = this.down("#name").getValue();
        testcase.tag = this.down("#tag").getValue();
        testcase.status = this.down("#status").getValue();
        testcase.description = this.down("#description").getValue();
        testcase.type = this.down("#type").getValue().type;
        testcase.script = this.down("scriptPicker").getValue();


        testcase.collection = this.down("actioncollection").getCollectionData();
        return testcase;
    }

});