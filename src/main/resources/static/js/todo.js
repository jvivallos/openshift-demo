var auth = {};

angular.element(document).ready(function ($http) {
    var keycloakAuth = new Keycloak('keycloak.json');
    auth.loggedIn = false;

    keycloakAuth.init({ onLoad: 'login-required' }).then(function () {
        auth.loggedIn = true;
        auth.authz = keycloakAuth;
        auth.logoutUrl = keycloakAuth.authServerUrl + "/realms/test-realm/protocol/openid-connect/logout?redirect_uri=index.html";
        angular.module('todoApp').factory('Auth', function() {
            return auth;
        });
        angular.bootstrap(document, ["todoApp"]);
    }).catch(function (err) {
        console.log(err);
        //window.location.reload();
    });

});

angular.module('todoApp', [])
    .controller('TodoListController', function(Auth) {
        var todoList = this;
        todoList.todos = [
            {text:'learn AngularJS', done:true},
            {text:'build an AngularJS app', done:false},
            {text: Auth.authz.token, done: false}];

        todoList.addTodo = function() {
            todoList.todos.push({text:todoList.todoText, done:false});
            todoList.todoText = '';
        };

        todoList.remaining = function() {
            var count = 0;
            angular.forEach(todoList.todos, function(todo) {
                count += todo.done ? 0 : 1;
            });
            return count;
        };

        todoList.archive = function() {
            var oldTodos = todoList.todos;
            todoList.todos = [];
            angular.forEach(oldTodos, function(todo) {
                if (!todo.done) todoList.todos.push(todo);
            });
        };
    });