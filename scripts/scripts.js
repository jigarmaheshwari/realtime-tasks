"use strict";var CONFIG={clientId:"502747173299.apps.googleusercontent.com",apiKey:"AIzaSyA8uaDCmQ1mvhjXQZvF55vW9ygO_fAYKRs",scopes:["https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/drive.install"]},app={};app.module=angular.module("todos",[]),app.Todo=function(){},app.Todo.prototype.initialize=function(e){var t=gapi.drive.realtime.custom.getModel(this);this.title=t.createString(e),this.completed=!1},app.loadFile=function(e,t){var o=e.current.params.fileId,i=e.current.params.user;return t.requireAuth(!0,i).then(function(){return t.getDocument(o)})},app.loadFile.$inject=["$route","storage"],app.module.config(["$routeProvider",function(e){e.when("/todos/:fileId/:filter",{templateUrl:"views/main.html",controller:"MainCtrl",resolve:{realtimeDocument:app.loadFile}}).when("/create",{templateUrl:"views/loading.html",controller:"CreateCtrl"}).when("/install",{templateUrl:"views/install.html",controller:"InstallCtrl"}).otherwise({redirectTo:"/install"})}]),app.module.value("config",CONFIG),app.module.run(["$rootScope","$location","storage",function(e,t,o){e.$on("$routeChangeError",function(){t.url("/install?target="+encodeURIComponent(t.url()))}),e.$on("todos.token_refresh_required",function(){o.requireAuth(!0).then(function(){},function(){t.url("/install?target="+encodeURIComponent(t.url()))})})}]),gapi.load("auth:client:drive-share:drive-realtime",function(){gapi.auth.init(),Object.defineProperty(gapi.drive.realtime.CollaborativeString.prototype,"text",{set:function(e){return this.setText(e)},get:function(){return this.getText()}}),app.Todo.prototype.title=gapi.drive.realtime.custom.collaborativeField("title"),app.Todo.prototype.completed=gapi.drive.realtime.custom.collaborativeField("completed"),gapi.drive.realtime.custom.registerType(app.Todo,"todo"),gapi.drive.realtime.custom.setInitializer(app.Todo,app.Todo.prototype.initialize),$(document).ready(function(){angular.bootstrap(document,["todos"])})}),angular.module("todos").service("storage",["$q","$rootScope","config",function(e,t,o){this.id=null,this.document=null,this.closeDocument=function(){this.document.close(),this.document=null,this.id=null},this.getDocument=function(t){return this.id===t?e.when(this.document):(this.document&&this.closeDocument(),this.load(t))},this.createDocument=function(o){var i=e.defer(),n=function(e){e&&!e.error?i.resolve(e):i.reject(e),t.$digest()};return gapi.client.request({path:"/drive/v2/files",method:"POST",body:JSON.stringify({title:o,mimeType:"application/vnd.google-apps.drive-sdk"})}).execute(n),i.promise},this.requireAuth=function(i,n){var r=gapi.auth.getToken(),a=Date.now()/1e3;if(r&&r.expires_at-a>60)return e.when(r);var l={client_id:o.clientId,scope:o.scopes,immediate:i,user_id:n},s=e.defer();return gapi.auth.authorize(l,function(e){e&&!e.error?s.resolve(e):s.reject(e),t.$digest()}),s.promise},this.load=function(o){var i=e.defer(),n=function(e){e.getRoot().set("todos",e.createList())},r=function(e){this.setDocument(o,e),i.resolve(e),t.$digest()}.bind(this),a=function(e){e.type===gapi.drive.realtime.ErrorType.TOKEN_REFRESH_REQUIRED?t.$emit("todos.token_refresh_required"):e.type===gapi.drive.realtime.ErrorType.CLIENT_ERROR?t.$emit("todos.client_error"):e.type===gapi.drive.realtime.ErrorType.NOT_FOUND&&(i.reject(e),t.$emit("todos.not_found",o)),t.$digest()};return gapi.drive.realtime.load(o,r,n,a),i.promise},this.changeListener=function(e){e.isLocal||t.$digest()},this.setDocument=function(e,t){t.getModel().getRoot().addEventListener(gapi.drive.realtime.EventType.OBJECT_CHANGED,this.changeListener),this.document=t,this.id=e}}]),angular.module("todos").directive("onBlur",function(){return function(e,t,o){t.bind("blur",function(){t.is(":hidden")||e.$apply(o.onBlur)}),t.bind("keypress",function(t){13===t.which&&e.$apply(o.onBlur)})}}),angular.module("todos").directive("collaborative",function(){var e=function(e,t,o,i){this.element=t,this.string=o,this.scope=e,this._insertListener=angular.bind(this,function(e){e.isLocal||this.updateText(e.index,e.text.length)}),this._deleteListener=angular.bind(this,function(e){e.isLocal||this.updateText(e.index,-e.text.length)}),this.updateText=function(t,o){var n=this.element[0],r=n===document.activeElement;if(r){var a=this.string.text,l=n.selectionStart,s=n.selectionEnd;l>=t&&(l+=o),s>t&&(s+=o),l>s&&(s=l),e.$apply(function(){var e=i.$formatters,t=e.length;for(i.$modelValue=a;t--;)a=e[t](a);i.$viewValue!==a&&(i.$viewValue=a,i.$render()),n.setSelectionRange(l,s)})}},this.unbind=function(){console.log("Removing listeners"),this.string.removeEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED,this._insertListener),this.string.removeEventListener(gapi.drive.realtime.EventType.TEXT_DELETED,this._deleteListener)},this.string.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED,this._insertListener),this.string.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED,this._deleteListener)};return{restrict:"A",scope:!1,require:"ngModel",compile:function(t,o){var i=o.ngModel.replace(/\.text$/,"");return i===o.ngModel?(console.log("Model does not appear to be collaborative string. Bind ng-model to .text property"),null):function(t,o,n,r){t.$watch(i,function(i){t.binder&&t.binder.unbind(),i&&(t.binder=new e(t,o,i,r))}),t.$on("$destroy",function(){t.binder&&(t.binder.unbind(),t.binder=null)})}}}}),angular.module("todos").directive("focus",["$timeout",function(e){return function(t,o,i){t.$watch(i.focus,function(t){t&&e(function(){o[0].focus()},0,!1)})}}]),angular.module("todos").controller("InstallCtrl",["$scope","$location","storage",function(e,t,o){e.authorize=function(){o.requireAuth(!1).then(function(){var e=t.search().target;e?t.url(e):t.url("/create")})}}]),angular.module("todos").controller("CreateCtrl",["$scope","$location","storage",function(e,t,o){e.message="Please wait",o.requireAuth().then(function(){o.createDocument("New Project").then(function(e){t.url("/todos/"+e.id+"/")})},function(){t.url("/install?target="+encodeURIComponent(t.url()))})}]),angular.module("todos").controller("MainCtrl",["$scope","$routeParams","realtimeDocument",function(e,t,o){e.fileId=t.fileId,e.filter=t.filter,e.document=o,e.todos=o.getModel().getRoot().get("todos"),e.newTodo="",e.remainingCount=function(){var e=0;return angular.forEach(this.todos.asArray(),function(t){e+=t.completed?0:1}),e},e.addTodo=function(){if(this.newTodo){var e=o.getModel().create(app.Todo,this.newTodo);this.newTodo="",this.todos.push(e)}},e.editTodo=function(t){e.editedTodo=t},e.doneEditing=function(){e.editedTodo=null},e.removeTodo=function(e){this.todos.removeValue(e)},e.clearDoneTodos=function(){var e=this.todos;angular.forEach(this.todos.asArray(),function(t){t.completed&&e.removeValue(t)})},e.markAll=function(e){angular.forEach(this.todos.asArray(),function(t){t.completed=e})},e.$watch("filter",function(t){e.statusFilter="active"===t?{completed:!1}:"completed"===t?{completed:!0}:null})}]),angular.module("todos").controller("CollaboratorsCtrl",["$scope","config",function(e,t){var o=t.clientId.split(".").shift(),i=function(){e.$apply(function(){e.collaborators=e.document.getCollaborators()})};e.collaborators=e.document.getCollaborators(),e.document.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT,i),e.document.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED,i),e.$on("$destroy",function(){var t=e.document;t&&(t.removeEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT,i),t.removeEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED,i))}),e.share=function(){var e=this.fileId,t=new gapi.drive.share.ShareClient(o);t.setItemIds([e]),t.showSettingsDialog()}}]);