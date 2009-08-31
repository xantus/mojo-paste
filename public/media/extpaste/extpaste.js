
var InfoPanel;
var MainPanel;
var aboutMsg = "<b>Mojo Paste</b><br/>"+
               "Powered by <a href='http://mojolicious.org/'>Mojolicious</a><br/>"+
               "<a href='http://github.com/xantus/mojo-paste/'>Mojo Paste at Github</a><br/>"+
               "<hr/>"+
               "Based on <a href='http://extpaste.com/'>ExtPaste</a>"+
               ", and rewritten for Mojo";

InfoPanel = function() {
    var newPastePanel = new Ext.Panel({
    frame:true,
    title:'New Paste',
    collapsible:true,
    contentEl:'new-paste-panel',
    titleCollapse:true
    });
    var recentPastePanel = new Ext.Panel({
    frame:true,
    title:'Recent Pastes',
    collapsible:true,
    contentEl:'recent-paste-panel',
    titleCollapse:true,
        tools: [{
           id:'refresh',
           on: {
            click: function() {
                recentPastePanel.getUpdater().refresh();
            }
           }
        }],
    autoLoad: { url: "/recent/" }
    });
    /*
    var newsPanel = new Ext.Panel({
    frame:true,
    title:'News',
    collapsible:true,
    contentEl:'news-panel',
    titleCollapse:true
    });
    */
    /*
    var aboutPanel = new Ext.Panel({
    frame:true,
    title:'About',
    collapsible:true,
    contentEl:'about-panel',
    titleCollapse:true
    });
    */
    /*
    var updatePanel = new Ext.Panel({
    frame:true,
    title:'Updates',
    collapsible:true,
    contentEl:'update-panel',
    titleCollapse:true
    });
    */
    
    InfoPanel.superclass.constructor.call(this, {
    id:'info',
    region:'west',
    split:true,
    width:200,
    minSize:100,
    maxSize:400,
    collapsible:true,
    collapseMode:'mini',
    margins:'0 0 5 5',
    cmargins:'0 0 0 0',
    baseCls: 'x-plain',
    items: [
        newPastePanel,
        recentPastePanel,
/*        newsPanel,
        updatePanel
        aboutPanel*/
    ]
    });
    
    Ext.apply(this, {recentPastePanel: recentPastePanel});
};

Ext.extend(InfoPanel, Ext.Panel, {
    eojs: function() {}
});

MainPanel = function() {
    var newPost = new Ext.FormPanel({
    labelWidth: 75,
    frame: true,
    title: 'New Paste',
    bodyStyle: 'padding: 5px 5px 0',
        iconCls: 'icon-pkg',
    
    items: [{
        layout: 'column',
        items: [{
        columnWidth: .3,
        layout: 'form',
        labelAlign: 'top',
        items: [{
            xtype: 'textfield',
                    fieldLabel: 'Title',
                    name: 'title',
            allowBlank: false,
            anchor: '95%'
        }]
        }, {
        columnWidth: .3,
        layout: 'form',
        labelAlign: 'top',
        items: [{
            xtype: 'textfield',
            fieldLabel: 'Name (optional)',
            name: 'name',
                allowBlank: true,
            anchor: '95%'
        }]
        }, {
        columnWidth: .4,
        layout: 'form',
        labelAlign: 'top',
        items: [
            new Ext.form.ComboBox({
            fieldLabel: 'Syntax',
            //name: '',
            hiddenName: 'syntax',
            anchor: '95%',
            store: new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({url: '/lexers/json/'}),
                reader: new Ext.data.JsonReader({
                    root: 'items',
                    totalProperty: 'totalCount'
                }, [
                    'syntax'
                ]
                ),
                autoLoad: true,
                baseParams: {nocache:true}
                //remoteSort: false
            }),
            allowBlank: true,
            //pageSize: 20,
            queryDelay: 200,
            minChars: 1,
            valueField: 'syntax',
            displayField: 'syntax',
            typeAhead: true,
            //mode: 'remote',
            mode: 'local',
            triggerAction: 'all',
            emptyText: 'Autodetect Syntax',
            selectOnFocus: true
            })
        ]
        }]
    }, {
        xtype: 'fieldset',
        title: 'Optional Paste Settings',
        labelWidth: 90,
        collapsible: true,
        autoHeight: true,
        collapsed: true,
        labelAlign: 'left',
        defaultType: 'checkbox',
        items: [{
        fieldLabel: 'Private Paste',
        boxLabel: ' <i>Don\'t show in recent posts or search.</i>',
            name: 'private'
        }
        /*, {
        fieldLabel: 'Keep around',
        boxLabel: ' <i>Do not automaticly remove the post after 30 days, until it\'s not visited anymore for 30 days</i>',
        name: 'keep'
        }*/]
    }, {
        fieldLabel: 'Paste',
        hideLabel: true,
        name: 'paste',
        xtype: 'textarea',
        height: 300,
        anchor:'98%',
        allowBlank: false
    }],
    
    eojs: function() {}
    });
    
    var submit = newPost.addButton({
        text: 'Submit',
        handler: function() {
        newPost.form.submit({url:'/new/', waitMsg:'Pasting'});
        }
    });
    var submit = newPost.addButton({
        text: 'Clear',
        handler: function() {
        newPost.form.reset();
        }
    });
        
    Ext.apply(this, {newPost: newPost});
    
    MainPanel.superclass.constructor.call(this, {
    id:'main',
    region:'center',
    margins: '0 5 5 0',
    minTabWidth: 115,
    resizeTabs: true,
    enableTabScroll: true,
    defaults: {autoScroll: true},
    plugins: new Ext.ux.TabCloseMenu(),
    activeTab: 0,
    items:[
        newPost
    ]
    });
};

Ext.extend(MainPanel, Ext.TabPanel, {
    openPaste: function(form, action) {
    var result = action.result;
    var p = this.add({
        title: action.result.title,
        iconCls: 'tabs',
        autoLoad: { url: action.result.uri }
    });
    },
    
    eojs: function() {}
});

MojoPaste = function() {
    return {
        init: function() {
            
        }
    }
}();

Ext.onReady(MojoPaste.init, MojoPaste);

Ext.onReady(function() {
    Ext.QuickTips.init();
//    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
    
    updateTitleOnTabChange = function(tabPanel, activePanel) {
    var title = "Ext Pastebin - ";
    if (activePanel.title) {
        title = title + activePanel.title;
    }
    document.title = title;
    };

    var infoPanel = new InfoPanel();
    var mainPanel = new MainPanel();
    mainPanel.on('tabchange', updateTitleOnTabChange);
/*
    var commentBox = new Ext.Window({
    title: 'Comment Box',
    layout: 'border',
    width: 500,
    height: 300,
    minWidth: 300,
    minHeight: 200,
    closeAction: 'hide',
    plain: true,
    bodyStyle: 'padding:5px',
    buttonAlign: 'center',
    tbar: [new Ext.FormPanel({
            labelWidth: 75, // label settings here cascade unless overridden
            url:'save-form.php',
                    frame:true,
            defaultType: 'textfield',
            baseClas: 'x-plain',

                items: [{
                    fieldLabel: 'Name',
                        name: 'name',
                anchor: '100%',
                        allowBlank:false
                },{
                xtype: 'textarea',
                allowBlank: false,
                anchor: '100% -53',
                    fieldLabel: 'Comment',
                        name: 'comment'
                }],
            
                buttons: [{
                text: 'Save'
                },{
                text: 'Cancel'
                }]
    })],
    
    items: {
        title: 'Template',
        region: 'center',
        html: 'test'
    },
    
    buttons: [{
        text: 'Close',
        handler: function() {
        commentBox.hide();
        }
    }]
    });
*/

    var searchResultTpl = new Ext.XTemplate(
    '<tpl for="."><div class="search-item">',
            '<div><b>{title}</b> by <b>{name}</b> on <em>{timestamp:date("D M j, g:ia")}</em></div>',
            '<i>{excerpt}</i>',
    '</div></tpl>'
    )
    
    var searchStore = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({url: '/search/json/'}),
        reader: new Ext.data.JsonReader({
            root: 'items',
            totalProperty: 'totalCount',
            fields: [
              'uri', 'title', 'name', { id: 'timestamp', name: 'timestamp', type: 'date', dateFormat: 'Y-m-d H:i:s' }, 'excerpt'
            ]
        }),
        remoteSort: false
    })
    
    var toggleLineNumbers;
    var screenPanel = new Ext.Panel({
    border: false,
    layout: 'anchor',
    region: 'north',
    cls: 'docs-header',
    height: 60,
    items: [{
        xtype:'box',
        el:'header',
        border:false,
        anchor:'none -25'
    },
    new Ext.Toolbar({
        cls: 'top-toolbar',
        items:[
        'Search Pastes: ',
                new Ext.form.ComboBox({
                    fieldLabel: 'Search',
                    //name: '',
                    hiddenName: 'search',
                    width: 400,
                    store: searchStore,
                    tpl: searchResultTpl,
                    allowBlank: true,
                    pageSize: 20,
                    queryDelay: 200,
                    minChars: 1,
                    valueField: 'uri',
                    displayField: 'title',
                    typeAhead: true,
                    mode: 'remote',
                    triggerAction: 'all',
                    emptyText: 'Search query...',
                    loadingText: 'Searching...',
                    itemSelector: 'div.search-item',
                    selectOnFocus: true,
                    onSelect: function(record) {
                        openPaste(record.data);
                        this.collapse();
                    }
                }), '->', toggleLineNumbers = new Ext.Button({
                    text: 'Toggle Line Numbers',
                    tooltip: '<b>Show / Hide Line Numbers</b>',
                    iconCls: 'icon-collapse-all',
                    enableToggle: true,
                    pressed: true,
                    toggleHandler: function(b, pressed) {
                        var linenos = Ext.select('td.linenos');
                        var cmntind = Ext.select('span.comment-indicator').sequenceFx();
                        if (pressed) {
                            cmntind.fadeOut({ remove: false, afterStyle: {left:"-20px"} });
                            linenos.fadeIn({ useDisplay: true });
                            cmntind.fadeIn({ remove: false, endOpacity: 0.25 });
                        } else {
                            cmntind.fadeOut({ remove: false, afterStyle: {left:"0px"} });
                            linenos.fadeOut({ useDisplay: true });
                            cmntind.fadeIn({ remove: false, endOpacity: 0.25 });
                        }
                    }
                }), '-', {
        /*
            text: 'Leave a Comment',
            iconCls: 'icon-comment',
            onClick: function(b, pressed) {
            commentBox.show(this);
            }
        }, '-', {
        */
                    text: 'About Mojo Paste',
                    iconCls: 'icon-about',
                    ctCls: 'rpad5',
                    onClick: function(b,pressed) {
                        Ext.Msg.show({
                            title: "About Mojo Paste",
                            msg: aboutMsg,
                            buttons: Ext.Msg.OK,
                            animEl: this.getEl(),
                            width: 300,
                            minWidth: 250,
                            icon: Ext.MessageBox.INFO
                        });
                    }
                }
        ]
    })]
    });
    
    var viewPort = new Ext.Viewport({
    layout: 'border',
    items: [ screenPanel, infoPanel, mainPanel ]
    });
    
    setTimeout(function() {
    Ext.get('loading').remove();
    Ext.get('loading-mask').fadeOut({remove:true});
    }, 100);
    
    var openPaste = function(infoDict) {
        var pasteId = infoDict.uri.split("/").slice(-2,-1)[0];
        if (!pasteId.length) {
            Ext.Msg.alert("Invalid Paste", "Trying to load invalid paste item.");
            return;
        }
        var id = 'paste-tab-'+pasteId;
        var tab = mainPanel.getComponent(id);
        if (tab) {
            mainPanel.setActiveTab(tab);
        } else {
            var p = tab = mainPanel.add({
                id: id,
                title: infoDict.title,
                iconCls: 'icon-cmp',
                cls: 'paste',
                closable: true,
                //autoScroll: true,
                autoLoad: {
                    url: infoDict.uri, scripts: true,
                    callback: function(el, success, response) {
                        var cmntind = el.select('span.comment-indicator');
                        cmntind.setOpacity(0.25);
                        cmntind.on("mouseover", function(e) {
                            cmntind.setOpacity(1, true);
                        })
                        cmntind.on("mouseout", function(e) {
                            cmntind.setOpacity(0.25, true);
                        })
                        if (!toggleLineNumbers.pressed) {
                            el.select('td.linenos').setDisplayed(false);
                            el.select('span.comment-indicator').setLeft(0);
                        }
                        var pastetitle = response.getResponseHeader["Ext-PasteTitle"];
                        if (pastetitle) {
                            p.setTitle(pastetitle);
                        }
                        el.select('span.comment-indicator').on('click', function(){
                            Ext.Msg.alert("Coming soon", "Commenting feature coming soon");
                        })
            if (infoDict.updateTitle) {
                updateTitleOnTabChange(mainPanel, tab);
            }
                    }
                }
            });
            if (infoDict.setActiveTab==undefined || infoDict.setActiveTab==true) {
                mainPanel.setActiveTab(p);
            }
        }
    };
    
    var actions = {
    'new-post': function(t) {
        mainPanel.setActiveTab(0);
    },
    
    'post': function(t) {
            Ext.fly(t).highlight("DFE8F6");
        openPaste({
            title: t.innerHTML,
        uri: t.href
        });
    }
    };
    var onAction = function(e, t) {
    e.stopEvent();
    actions[t.className](t);
    }    
    
    mainPanel.newPost.form.on("actioncomplete", function(cls, action) { 
    mainPanel.newPost.form.reset();
    openPaste(action.result);
    });
    infoPanel.body.on('click', Ext.emptyFn, null, {delegate:'a', preventDefault:true});
    infoPanel.body.on('mousedown', onAction, null, {delegate:'a'});
    var recentPasteMgr = infoPanel.recentPastePanel.getUpdater(); //new Ext.Updater("recent-paste-panel");
    recentPasteMgr.setDefaultUrl("/recent/");
    recentPasteMgr.loadScripts = true;
    recentPasteMgr.startAutoRefresh(900);

    var loc = window.location.hash.lastIndexOf("#");
    if (loc!=-1) {
    pasteUri = window.location.hash.slice(loc+1);
    openPaste({
        title: 'Paste #'+pasteUri,
        uri: "/"+pasteUri+"/",
        updateTitle: true
    })
    }
});
