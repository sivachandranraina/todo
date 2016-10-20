app.controller('mainCtrl', ['$scope', 'APIService', 'localStorageService', function($scope, APIService, localStorageService) {
    $scope.instance = {};
    $scope.todos = {};
    $scope.alltodos = []

    $scope.getTodos = function() {
        $scope.todos.all = [];
        if ($scope.user === 'admin') {
            $scope.adminView = true;
            APIService.doApiCall(function(data) {
                $scope.users = data;
            }, 'users', 'GET', null, null);
            APIService.doApiCall(function(data) {
                $scope.todos.all = data;
                $scope.reset($scope.todos.all);
                $scope.alltodos = data;
            }, 'stories', 'GET', null, null)
        } else {
            $scope.adminView = false;
            APIService.doApiCall(function(data) {
                $scope.todos.all = data;
                $scope.reset($scope.todos.all);
            }, '', 'GET', null, null);
        }
    }

    $scope.proceed = false;
    if (localStorageService.get('user')) {
        $scope.proceed = true;
        $scope.user = localStorageService.get('user').name;
        $scope.getTodos();
    };

    $scope.addToDo = function(data, $event) {
        if (data.content.length >= 20) {
            $('.large-text').css('font-size', '150%');
        } else {
            $('.large-text').css('font-size', '300%');
        }
        var keyCode = $event.keyCode;
        if (data != "" && keyCode === 13) {
            var todo = data;
            if ($scope.addon == true) {
                $scope.update(data);
                $scope.addon = false;
            } else {
                if ($scope.proceed === true) {
                    APIService.doApiCall(function(data) {
                        $scope.getTodos();
                        $scope.instance = "";
                        $('.large-text').css('font-size', '300%');
                    }, '', 'POST', todo, null);
                } else {
                    console.log('coming')
                    $('#warning').modal('show');
                }
            }

        }
    }

    $scope.editable = function(data) {
        $scope.instance = angular.copy(data);
        $scope.addToDo($scope.instance, event);
        $scope.addon = true;
        $('.large-text').focus();
    }

    $scope.update = function(data, updater) {
        if (updater != undefined) {
            data.completed = updater;
        }
        APIService.doApiCall(function(data) {
            $scope.getTodos();
            $scope.cancel(data);
        }, 'update', 'POST', data, null);
    }

    $scope.cancel = function(data) {
        $scope.instance.content = null;
        $scope.addon = false;
    }

    $scope.delete = function(data) {
        APIService.doApiCall(function(data) {
            $scope.getTodos();
        }, 'delete', 'POST', data, null);
        $scope.cancel(data);
    }

    $scope.login = function(data) {
        APIService.doApiCall(function(data) {
            if (data.success === true) {
                $scope.proceed = true;
                $('#login').modal('hide');
                $scope.user = data.Data.name;
                localStorageService.add('token', data.token);
                localStorageService.add('user', data.Data);
                $scope.getTodos();
            } else {
                $scope.loginerr = data.message;
            }
        }, 'login', 'POST', data, null)
    }

    $scope.logout = function() {
        localStorageService.remove('token');
        localStorageService.remove('user');
        window.location.reload();
    }

    $scope.signup = function(cred) {
        APIService.doApiCall(function(data) {
            if (data.success === true) {
                $('#signup').modal('hide');
                $('#login').modal('show');
            }
        }, 'signup', 'POST', cred, null)
    }

    $scope.filter = function(data) {
        $scope.todos.active = [];
        $scope.todos.completed = [];
        for (var i = 0; i < $scope.todos.all.length; i++) {
            if ($scope.todos.all[i].completed == true) {
                $scope.todos.completed.push($scope.todos.all[i]);
            } else {
                $scope.todos.active.push($scope.todos.all[i]);
            }
        };
        if (data === 'active') {
            $scope.showtodos = $scope.todos.active;
        } else if (data === 'completed') {
            $scope.showtodos = $scope.todos.completed;
        }
    }

    $scope.reset = function(data) {
        $scope.todos.active = [];
        $scope.todos.completed = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].completed == true) {
                $scope.todos.completed.push(data[i]);
            } else {
                $scope.todos.active.push(data[i]);
            }
        };
        $scope.showtodos = $scope.todos.active;
    }

    $scope.userChange = function(data) {
        console.log(data)
        if (data === 'all') {
            $scope.reset($scope.alltodos);
        } else {
            var temp = angular.copy($scope.alltodos);
            $scope.todos.all = [];
            for (var i = 0; i < temp.length; i++) {
                if (temp[i].creator._id === data) {
                    $scope.todos.all.push(temp[i]);
                }
            };
            $scope.reset($scope.todos.all);
        }
    }
}]);
