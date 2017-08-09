var readline = require('readline');
var stream = require('stream');
var fs = require('fs');

var useBiopax = true;

module.exports.start = function(io, model){
    var modelManagerList = [];
    var menuList = [];

    var roomList = [];
    var humanList = [];
    var pnnlArr  = [];




    var request = require('request'); //REST call over http/https

    var responseHeaders = {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
        "access-control-allow-headers": "content-type, accept",
        "access-control-max-age": 10,
        "Content-Type": "application/json"
    };

    var askHuman = function (userId, room, requestStr, data, callback){

        var roomMate = humanList.find(function(human){
            return(human.userId != userId && human.room == room);
        }); //returns the first match


        if(roomMate!= null) {
            var clientSocket = io.sockets.connected[roomMate.socketId];
            clientSocket.emit(requestStr, data, function(val){

                if(callback) callback(val);
            });

        }
        else
            if(callback) callback("fail");
    };



    io.sockets.on('connection', function (socket) {



        var socketRoom;
        socket.on('error', function (error) {
            console.log(error);
            //  socket.destroy()
        });


        socket.on('getDate', function(callback){
            callback(+(new Date));
        });


        socket.on('subscribeHuman', function (data,  callback) {
            socket.userId = data.userId;
            socket.room = data.room;
            socket.userName = data.userName;
            socket.subscribed = true;
            socketRoom = socket.room;

            socket.join(data.room);

            data.socketId = socket.id;

            roomList.push(data.room);
            humanList.push({room:data.room, userId: data.userId, socketId: data.socketId});



            console.log("human subscribed");


            model.subscribe('documents', function () {


                var pageDoc = model.at('documents.' + data.room);
                var docPath = 'documents.' + data.room;
                var cy = model.at((docPath + '.cy'));
                var pysb = model.at((docPath + '.pysb'));
                var history = model.at((docPath + '.history'));
                var undoIndex = model.at((docPath + '.undoIndex'));
                var context = model.at((docPath + '.context'));
                var images = model.at((docPath + '.images'));

                var users = model.at((docPath + '.users'));//user lists with names and color codes
                var userIds = model.at((docPath + '.userIds')); //used for keeping a list of subscribed users
                var messages = model.at((docPath + '.messages'));



                pageDoc.subscribe(function () {
                    pysb.subscribe(function () {
                    });
                    cy.subscribe(function () {
                    });
                    history.subscribe(function () {
                    });
                    undoIndex.subscribe(function () {
                    });
                    context.subscribe(function () {
                    });
                    images.subscribe(function () {
                    });
                    messages.subscribe(function () {
                    });
                    userIds.subscribe(function () {



                    });
                    users.subscribe(function () {

                        modelManagerList[data.room] = require("../public/collaborative-app/modelManager.js")(model, data.room);
                        modelManagerList[data.room].setName(data.userId, data.userName);
                       //
                       //  //Add the user explicitly here
                         modelManagerList[data.room].addUser(data.userId);

                    });
                });


            });


        });





        socket.on('disconnect', function() {

            try {




                if(socket.room) {
                    modelManagerList[socket.room].deleteUser(socket.userId);

                    //remove from humanlist
                    var isHumanDisconnected = false;
                    for (var i = humanList.length - 1; i >= 0; i--) {
                        if (humanList[i].userId == socket.userId) {
                            console.log(humanList[i].userId);
                            //human is disconnected, so disconnect all users
                            isHumanDisconnected = true;
                            humanList.splice(i, 1);
                            break;
                        }
                    }
                    if(isHumanDisconnected) {
                        modelManagerList[socketRoom].deleteAllUsers();
                    }
                }
                //else //delete all users
                 //   modelManagerList[socketRoom].deleteAllUsers();

                // //remove from modelManagerList
                // for(var i = modelManagerList.length - 1; i >=0 ; i--){
                //     if(modelManagerList[i].userId == socket.userId){
                //         modelManagerList.splice(i,1);
                //         break;
                //     }
                // }


            }
            catch(e){
                console.log("Disconnect error " + e);
            }

            socket.subscribed = false; //why isn't the socket removed

        });


        socket.on('REACHQuery',  function(outputType, msg, callback){
            var queryParams = "text=" + msg + "&output=" + outputType; //fries";


            request({
                url: 'http://agathon.sista.arizona.edu:8080/odinweb/api/text', //URL to hit
                // qs: {from: 'blog example', time: +new Date()}, //Query string data
                method: 'POST',
                headers: responseHeaders,
                form: queryParams

            }, function (error, response, body) {

                if (error) {

                    console.log(error);
                } else {


                    if(response.statusCode == 200) {
                        if(callback) callback(body);
                        io.in(socket.room).emit("REACHResult", body);

                    }


                }
            });
        });

        socket.on('BioGeneQuery', function (queryParams, callback) {


            request({
                url: 'http://cbio.mskcc.org/biogene/retrieve.do', //URL to hit
                // qs: {from: 'blog example', time: +new Date()}, //Query string data
                method: 'POST',
                headers: responseHeaders,
                form: queryParams

            }, function (error, response, body) {

                if (error) {

                    console.log(error);
                } else {

                    callback(body);
                    //socket.emit("BioGeneResult",body);



                }
            });


        });


        socket.on('PCQuery', function(queryData, callback){


            var req = request(queryData.url , function (error, response, body) {
                console.log(queryData.url);

                if (error) {
                    console.log(error);
                } else  { //only open the window if a proper response is returned

                    //     console.log(body);
                    console.log(response.statusCode);
                    if(response.statusCode == 200) {
                        if(callback)
                            callback(body);
                        else
                            socket.emit("PCQueryResult", {graph:body, type:queryData.type});
                    }
                    else{
                        if(callback)
                            callback();
                        socket.emit("PCQueryResult", "error");
                    }

                }
                //    req.end();
            });

            // req.end();
        });

        socket.on('MergePCQuery', function(queryData, callback){


            var req = request(queryData.url , function (error, response, body) {


                if (error) {
                    console.log(error);
                } else  { //only open the window if a proper response is returned

                    if(response.statusCode == 200) {
                        askHuman(socket.userId, socket.room,  "mergeSbgn", body, function(val){
                            if (callback) callback(val);
                        });

                    }
                    else{
                        if(callback)
                            callback("fail");

                    }

                }
                //    req.end();
            });

            // req.end();
        });



        socket.on('BioPAXRequest', function(fileContent, reqType, callback){


            if(useBiopax) {


                //  request('http://localhost:8080/SBGNConverterServlet' , function (error, response, body) {

                request.post({
                    url: "http://localhost:8080/PaxtoolsServlet",
                    headers: responseHeaders,
                    form: {reqType: reqType, content: fileContent}
                }, function (error, response, body) {


                    if (error) {
                        console.log(error);
                    } else { //only open the window if a proper response is returned

                        if (response.statusCode == 200) {

                            if(reqType == "partialBiopax"){
                                io.in(socket.room).emit("processToIntegrate", body);

                            }
                            if(callback)
                                callback({graph:body});



                        }
                        else
                            socket.emit("Paxtools Server Error", "error");


                    }
                });

            }
        });

    });

}