"use strict";

var loginButton = document.getElementById("login-button");
var loginButtonLabel = document.getElementById("login-button-label");
var addButton = document.getElementById("add-button");
var snackbar = document.getElementById("snackbar");
var tabBar = document.getElementsByClassName("mdl-layout__tab-bar")[0];
var content = document.getElementsByClassName("mdl-layout__content")[0];
var layout = document.getElementsByClassName("mdl-layout")[0];

window.onload = function() {
  window.lastTabId = 0;
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
  snackbar.MaterialSnackbar.showSnackbar({message: "Signed in as " + user.displayName + "."});
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
  var id = ++window.lastTabId;
  var tab = document.createElement('div');
  tab.innerHTML = '<a href="#content-tab-'+id+'" id="tab-'+id+'" class="mdl-layout__tab">'+title+'</a>';
  tab = tab.firstChild;
  // if (componentHandler) {
  //   componentHandler.upgradeElement(tab);
  // }

  var tabContent = document.createElement('div');
  tabContent.innerHTML =
  '<section class="mdl-layout__tab-panel" id="content-tab-'+id+'">' +
  '</section>';
  tabContent = tabContent.firstChild;
  // if (componentHandler) {
  //   componentHandler.upgradeElement(tabContent);
  // }
  tabBar.insertBefore(tab, tabBar.firstChild);
  content.insertBefore(tabContent, content.firstChild);

  var tabs = document.querySelectorAll('.mdl-layout__tab');
  var panels = document.querySelectorAll('.mdl-layout__tab-panel');
  for (var i = 0; i < tabs.length; i++) {
    new MaterialLayoutTab(tabs[i], tabs, panels, layout.MaterialLayout);
  }
  // if (componentHandler) {
  //   // componentHandler.upgradeElement(tabContent);
  //   componentHandler.downgradeElements(layout);
  //   componentHandler.upgradeElements(layout);
  // }



  return id;
}
