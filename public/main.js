"use strict";

var loginButton = document.getElementById("login-button");
var loginButtonLabel = document.getElementById("login-button-label");
var addButton = document.getElementById("add-button");
var snackbar = document.getElementById("snackbar");
var tabBar = document.getElementsByClassName("mdl-layout__tab-bar")[0];
var content = document.getElementsByClassName("mdl-layout__content")[0];
var layout = document.getElementsByClassName("mdl-layout")[0];

var tabList = new Map();
window.lastTabId = 0;

window.onload = function() {
  var editor = ace.edit("editor1");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");
  //editor.resize();
  setTimeout(() => {editor.resize()},500);

  window.addEventListener("keypress", (event) => {
    if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true;
    alert("Ctrl-S pressed");
    event.preventDefault();
    return false;
  });
}

loginButton.onclick = function() {
  var provider = new firebase.auth.GithubAuthProvider();
  provider.addScope('repo');
  firebase.auth().signInWithRedirect(provider);
}

addButton.onclick = function() {
  var editor = addTabWithCode("New File", "");
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    loginButton.innerHTML = '<img class="profile-pic" src="'+ user.photoURL +'"/>';
    loginButton.onclick = () => {};
    loginButtonLabel.innerHTML = "Logged in as <strong>"+ user.displayName +"</strong>";
}
});


firebase.auth().getRedirectResult().then(function(result) {
  var user = result.user;
  if (user) {
    snackbar.MaterialSnackbar.showSnackbar({message: "Signed in as " + user.displayName + "."});
  }
});


function addTabWithCode(title, content) {
  var id = createTab(title);
  setActiveTab(id);
  var tabContent = document.getElementById("content-tab-" + id);
  tabContent.innerHTML = '<div class="page-content editor" id="editor-'+id+'"'+
    'style="position: absolute;top: 0;right: 0;bottom: 0;left: 0;">'+content+'</div>';
  var editor = ace.edit("editor-"+id);
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");
  editor.focus();
  editor.commands.addCommand({
    name: 'myCommand',
    bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
    exec: function(editor) {
        window.alert("Save!");
    },
    readOnly: true // false if this command should not apply in readOnly mode
});
  //setTimeout(() => {editor.resize()},500);
  return editor;
}

function setActiveTab(id) {
  var activeTab = tabBar.getElementsByClassName("is-active")[0];
  var activeTabContent = content.getElementsByClassName("is-active")[0];
  activeTab.classList.remove("is-active");
  activeTabContent.classList.remove("is-active");

  var tab = document.getElementById("tab-" + id);
  var tabContent = document.getElementById("content-tab-" + id);
  tab.classList.add("is-active");
  tabContent.classList.add("is-active");
}

function createTab(title) {
  if (!tabs) {
    tabs = new Map();
  }
  var id = ++window.lastTabId;
  var tabId = "tab-" + id;
  var contentId = "content-tab-" + id;
  var tab = document.createElement('div');
  tab.innerHTML = '<a href="#'+contentId+'" id="'+tabId+'" class="mdl-layout__tab">'+title+
    '<button class="tab-close"><i class="material-icons md-18">close</i></button></a>';
  tab = tab.firstChild;

  tab.getElementsByClassName("tab-close")[0].onclick = function(e) {
    //Finds a tab to switch to.
    var lastTabId = -1;
    for (var key of tabList.keys()) {
      if (lastTabId === id) {
        setActiveTab(key);
        console.log("active tab is " + key);
        break;
      } else if (key === id && lastTabId !== -1) {
        setActiveTab(lastTabId);
        console.log("active tab is " + lastTabId);
        break;
      } else {
        console.log(key + " isn't a valid tab to switch to.");
      }
    }
    //TODO: If code, prompt save.
    document.getElementById(tabId).outerHTML = '';
    document.getElementById(contentId).outerHTML = '';
    return true;
  }

  var tabContent = document.createElement('div');
  tabContent.innerHTML =
  '<section class="mdl-layout__tab-panel" id="content-tab-'+id+'">' +
  '</section>';
  tabContent = tabContent.firstChild;

  tabBar.insertBefore(tab, tabBar.firstChild);
  content.insertBefore(tabContent, content.firstChild);

  var tabs = document.querySelectorAll('.mdl-layout__tab');
  var panels = document.querySelectorAll('.mdl-layout__tab-panel');
  for (var i = 0; i < tabs.length; i++) {
    new MaterialLayoutTab(tabs[i], tabs, panels, layout.MaterialLayout);
  }

  tabList.set(id, {'title': title});

  return id;
}
