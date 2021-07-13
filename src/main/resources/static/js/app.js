/*var keycloak = new Keycloak('keycloak.json');
keycloak.init({
    onLoad: 'login-required'
})
    .then(function() {
        console.log(keycloak.token);
    })
*/
var module = angular.module('product', []);

var auth = {};
var logout = function(){
    console.log('*** LOGOUT');
    auth.loggedIn = false;
    auth.authz = null;
    window.location = auth.logoutUrl;
};


angular.element(document).ready(function ($http) {
    var keycloakAuth = new Keycloak('keycloak.json');
    auth.loggedIn = false;

    keycloakAuth.init({ onLoad: 'login-required' }).then(function () {
        auth.loggedIn = true;
        auth.authz = keycloakAuth;
        auth.logoutUrl = keycloakAuth.authServerUrl + "/realms/test-realm/protocol/openid-connect/logout?redirect_uri=index.html";
        module.factory('Auth', function() {
            return auth;
        });
        angular.bootstrap(document.getElementById("aplicacion"), ["product"]);
    }).catch(function (err) {
        console.log(err);
        //window.location.reload();
    });

});
module.controller('GlobalCtrl', function($scope, $http) {
    $scope.products = [];
    $scope.reloadData = function() {
        $http.get("/database/products").success(function(data) {
            $scope.products = angular.fromJson(data);

        });

    };
    $scope.logout = logout;
});








module.factory('authInterceptor', function($q, Auth) {
    return {
        request: function (config) {
            var deferred = $q.defer();
            if (Auth.authz.token) {
                Auth.authz.updateToken(5).then(function() {
                    config.headers = config.headers || {};
                    config.headers.Authorization = 'Bearer ' + Auth.authz.token;

                    deferred.resolve(config);
                }).catch(function() {
                    deferred.reject('Failed to refresh token');
                });
            }
            return deferred.promise;
        }
    };
});




module.config(function($httpProvider) {
    $httpProvider.responseInterceptors.push('errorInterceptor');
    $httpProvider.interceptors.push('authInterceptor');

});

module.factory('errorInterceptor', function($q) {
    return function(promise) {
        return promise.then(function(response) {
            return response;
        }, function(response) {
            if (response.status == 401) {
                console.log('session timeout?');
                logout();
            } else if (response.status == 403) {
                alert("Forbidden");
            } else if (response.status == 404) {
                alert("Not found");
            } else if (response.status) {
                if (response.data && response.data.errorMessage) {
                    alert(response.data.errorMessage);
                } else {
                    alert("An unexpected server error has occurred");
                }
            }
            return $q.reject(response);
        });
    };
});