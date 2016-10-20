var CommonServices = angular.module('Com.Services', []);

var apiUrl = "/api/"

CommonServices.factory('APIService', ['$http', 'localStorageService',
    function($http, localStorageService) {
        var baseUrl = apiUrl;
        return {
            baseUrl: baseUrl,
            url: "",
            method: "GET", // Default Method
            mockdataUrl: "",
            requestHeader: {}, //    'Content-type' : 'application/json',    'Accept-Encoding' : 'gzip, deflate'    }, // Default header
            payload: {},
            doApiCall: function(callback, subpath, method, payload, customHeader) {
                var self = this;
                self.url = (subpath) ? self.baseUrl + subpath : self.baseUrl;
                if (method) {
                    self.method = method;
                }
                if (payload) {
                    self.payload = payload;
                }
                var sessionData = localStorageService.get('token');
                var token = (sessionData) ? sessionData : undefined;
                if (subpath === 'user/login') {
                    token = '';
                } else if (!token) {
                    console.log("No Authentication Token");
                } else {
                    token = token;
                }
                self.requestHeader = {};
                self.requestHeader['x-access-token'] = token;
                console.log("Calling API: " + self.url + " with Method:\"" + self.method + "\"");
                $http({
                        method: self.method,
                        url: self.url,
                        cache: false,
                        data: self.payload,
                        headers: self.requestHeader
                    })
                    .success(function(data, status, header, config) {
                        callback(data, false);
                    })
            }
        }
    }
]);
