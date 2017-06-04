"use strict";

var loginButton = document.getElementById("login-button");
var loginButtonLabel = document.getElementById("login-button-label");
var snackbar = document.getElementById("snackbar");
var tabBar = document.getElementsByClassName("mdl-layout__tab-bar");
var content = document.getElementsByClassName("mdl-layout__content");

window.onload = function() {
  var editor = ace.edit("editor1");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");
  //editor.resize();
  editor.setValue("Helloooo");
  setTimeout(() => {editor.resize()},500);
  var editor2 = ace.edit("editor2");
  editor2.setTheme("ace/theme/monokai");
  editor2.getSession().setMode("ace/mode/javascript");

  window.addEventListener("keypress", (event) => {
    if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true;
    alert("Ctrl-S pressed");
    event.preventDefault();
    return false;
  });

  snackbar.MaterialSnackbar.showSnackbar({message: "onload complete."});
}

loginButton.onclick = function() {
  var provider = new firebase.auth.GithubAuthProvider();
  provider.addScope('repo');
  firebase.auth().signInWithRedirect(provider);
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

}

function createTab() {

}
