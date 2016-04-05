import { Meteor } from 'meteor/meteor';
//import 'lib/dataloader.js';
import { Mongo } from 'meteor/mongo';
//import { Nodes } from '../imports/lib/collections.js';
//import { Links } from '../imports/lib/collections.js';
//

//export const Nodes = new Mongo.Collection('nodes');
//export const Links = new Mongo.Collection('links');

const Nodes =new Mongo.Collection('nodes');
const Links =new Mongo.Collection('links');
console.log('nodes count: ', Nodes.find().count());
Meteor.startup(() => {
    var Fiber = Npm.require('fibers');
    // code to run on server at startup
    if(Nodes.find().count()==0 || Links.find().count()==0){
       processData();
    }


function processData() {
    Fiber(function(){
        var fs = Npm.require('fs');
        var nlp = Npm.require('nlp_compromise');
//var TfIdf = natural.TfIdf;
        var lda = Npm.require('lda');
        var file = process.env.PWD + '/public/data2.csv';
        console.log('processData: ', Date.now());
        var iterationNumber = 0;
        var files = fs.readFile(file, function (err, d) {
            console.log('read file: ', Date.now());
            var results = d.toString('ascii');
            var topicsDictionary = {};
            var nodes = [];
            var links = [];
            Papa.parse(results, {
                header: true, encoding: 'ascii', step: function (res) {
                    //var d = res.data;
                    var elem = res.data[0];
                    //console.log("res.data length: ",res.data.length);
                    //var filteredData = res.data.filter(function(elem, index, arr){
                    //    return elem['_ - currentViewers']>100;
                    //});
                    //console.log("filteredData count: ", filteredData.length);
                    var lastTime = Date.now();
                    //if (elem['_ - currentViewers'] > 100) {
                        var d = elem;
                        process();
                        //filteredData.forEach(function(d, dataIndex){
                        //For each line, we grab fields to process
                        //For each data item, we set the above matching fields to the data we gather.
                        //for each noun, verb, and ner, we determine if the respective dictionary already contains a word
                        //console.log('index: ', dataIndex);
                        function process() {
                            Fiber(function(){
                                console.log("going through 'process'");
                            var id = d['_ - _id'];
                            var nlpData = getTaggedWords(d['_ - description'] + " " + d['_ - title'] + ".", id);//nlp.text(d['_ - title']);//.sentences[0];
                            //console.log("ms since last timestamp: ", Date.now() - lastTime);
                            lastTime = Date.now();
                            var dataEntry = {
                                id: d['_ - id'],
                                idID: d['_ - _id'],
                                live: d['_ - live'],
                                title: d['_ - title'],
                                totalViews: d['_ - totalViews'],
                                stream: d['_ - streamSource'],
                                url: d['_ - url'],
                                status: d['_ - status'],
                                embedTag: d['_ - embedTag'],
                                description: d['_ - description'],
                                currentViewers: d['_ - currentViewers'],
                                lat: d['_ -lat'],
                                lon: d['_ - lon'],
                                viewsTotal: d['_ - views_total'],
                                esBroadcaster: d['_ - _es - broadcaster'],
                                creationDateDate: d['_ - creationDate - $date'],
                                imageUrlMedium: d['_ - imageUrl - medium'],
                                lastStreamedAtDate: d['_ - lastStreamedAt - $date'],
                                tagsTag: d['_ - tags - _ - tag'],
                                nlp: nlpData
                            };
                            //var dataEntry = new function(){
                            //        this.id                 =   (d.hasOwnProperty('_ - id')? d['_ - id']:'');
                            //        this.idID               =   (d.hasOwnProperty('_ - _id')? d['_ - _id']:'');
                            //        this.live               =   (d.hasOwnProperty('_ - live')? d['_ - live']:'');
                            //        this.title              =   (d.hasOwnProperty('_ - title')? d['_ - title']:'');
                            //        this.totalViews         =   (d.hasOwnProperty('_ - totalViews')? d['_ - totalViews']:'');
                            //        this.stream             =   (d.hasOwnProperty('_ - streamSource')? d['_ - streamSource']:'');
                            //        this.url                =   (d.hasOwnProperty('_ - url')? d['_ - url']:'');
                            //        this.status             =   (d.hasOwnProperty('_ - status')? d['_ - status']:'');
                            //        this.embedTag           =   (d.hasOwnProperty('_ - embedTag')? d['_ - embedTag']:'');
                            //        this.description        =   (d.hasOwnProperty('_ - descriptoin')? d['_ - description']:'');
                            //        this.currentViewers     =   (d.hasOwnProperty('_ - currentViewers')? d['_ - currentViewers']:'');
                            //        this.lat                =   (d.hasOwnProperty('_ - lat')? d['_ -lat']:'');
                            //        this.lon                =   (d.hasOwnProperty('_ - lon')? d['_ - lon']:'');
                            //        this.viewsTotal         =   (d.hasOwnProperty('_ - views_total')? d['_ - views_total']:'');
                            //        this.esBroadcaster      =   (d.hasOwnProperty('_ - _es - broadcaster')? d['_ - _es - broadcaster']:'');
                            //        this.creationDateDate   =   (d.hasOwnProperty('_ - creationDate - $date')? d['_ - creationDate - $date']:'');
                            //        this.imageUrlMedium     =   (d.hasOwnProperty('_ - imageUrl - medium')? d['_ - imageUrl - medium']:'');
                            //        this.lastStreamedAtDate =   (d.hasOwnProperty('_ - lastStreamedAt - $date')? d['_ - lastStreamedAt - $date']:'');
                            //        this.tagsTag            =   (d.hasOwnProperty('_ - tags - _ - tag')? d['_ - tags - _ - tag']:'');
                            //        this.nlp                =   nlpData;
                            //};

                            nodes.push(dataEntry);
                            Nodes.update(dataEntry, dataEntry, {upsert:true});
                            //});
                            //create links and nodes json for sending to the client:
                            }).run();
                            }
                    //}

                }, complete: function (c) {
                    if (iterationNumber == 0) {
                        iterationNumber++;
                        console.log("COMPLETE!");
                        console.log('topics dictionary: ', topicsDictionary);
                        for (var topicName in topicsDictionary) {

                            var topicIds = topicsDictionary[topicName];

                            var linkList = createLink(topicIds);

                            //console.log('link list:', linkList);

                            function createLink(list) {
                                Fiber(function(){
                                    var oldlinks = [];
                                    var newlist = [];
                                    for (var idIndex = 0; idIndex < list.length - 1; idIndex++) {
                                        if (idIndex + 1 <= list.length - 1) {
                                            var sourceId = list[idIndex],
                                                targetId = list[idIndex + 1];
                                            var link = {source: sourceId, target: targetId, topic:[topicName]};
                                            var singleLink = {source: sourceId, target:targetId};
                                            console.log('adding link: ',link);
                                            oldlinks.push(link);
                                            Links.update(singleLink,{$push:{topic: topicName}}, {upsert: true});
                                            if (idIndex > 0) {
                                                newlist.push(list[idIndex]);
                                            }
                                        }

                                    }
                                    if (list.length > 1) {
                                        return oldlinks.concat(createLink(newlist));
                                    } else {
                                        return oldlinks;
                                    }
                                 }).run();
                            }//end create link

                            links = links.concat(linkList);
                        }
                        //var uniqueLinks = checkForDoubles(links);
                        console.log('links: ', links);
                        console.log('nodes: ', nodes.length);
                        //fut['return']([{"nodes":nodes, "links":links}]);
                    }

                }
            });//end Papa Parse


            function checkForDoubles(arrayToCheck) {
                var finalArray = [];
                var finalArrayAsStrings = [];
                console.log('array to check: ', arrayToCheck);
                arrayToCheck.forEach(function (item, index) {
                    var same = 0;
                    var itemStr = item.toString();
                    if (itemStr !== "[]") {
                        if (finalArrayAsStrings.indexOf(itemStr) > -1) {
                            //no add
                        } else {
                            console.log('adding item: ', item);
                            finalArray.push(item);
                            finalArrayAsStrings.push(itemStr);
                        }
                    }
                });
                return finalArray;
            }

            function getTaggedWords(data, id) {
                var lastTime = Date.now();
                var sentences = nlp.text(data).sentences;
                var nouns = [];
                var verbs = [];
                var persons = [];
                var places = [];
                var organizations = [];

                //var tfidf = new TfIdf();
                var sentenceArray = [];

                //go through each setnence to fill arrays and prep nlp
                sentences.forEach(function (line, index) {
                    line.terms.forEach(function (term, ind) {
                        var word = term.text.toUpperCase();
                        switch (term.tag) {
                            case "Noun":
                                uniqueAddToArray(word, nouns);
                                break;
                            case "Verb":
                                uniqueAddToArray(word, verbs);
                                break;
                            case "Person":
                                uniqueAddToArray(word, persons);
                                break;
                            case "Place":
                                uniqueAddToArray(word, places);
                                break;
                            case "Organization":
                                uniqueAddToArray(word, organizations);
                                break;
                        }
                    });
                    //tfidf.addDocument(line.str);
                    sentenceArray.push(line.str);
                });

                function uniqueAddToArray(addition, arr) {
                    if (arr.indexOf(addition) > -1) {
                        //no add
                    } else {
                        arr.push(addition);
                    }
                }

                //sentences.forEach(function(line,ind){
                //    //console.log(tfidf.listTerms(ind));
                //});
                //console.log('about to process LDA, time since last update:', Date.now() - lastTime);
                lastTime = Date.now();
                var result = lda(sentenceArray, 2, 5);
                //console.log('finished processing LDA, time since last update:', Date.now() - lastTime);
                lastTime = Date.now();
                var finalTopicWords = [];
                result.forEach(function (topicGroup, tIndex) {
                    topicGroup.forEach(function (termSet, tsIndex) {
                        var word = termSet.term.toUpperCase();
                        var shouldAdd = 0;
                        shouldAdd += nouns.indexOf(word) > -1 ? 1 : 0;
                        shouldAdd += verbs.indexOf(word) > -1 ? 1 : 0;
                        shouldAdd += persons.indexOf(word) > -1 ? 1 : 0;
                        shouldAdd += places.indexOf(word) > -1 ? 1 : 0;
                        shouldAdd += organizations.indexOf(word) > -1 ? 1 : 0;

                        if (shouldAdd > 0) {
                            if (finalTopicWords.indexOf(word) < 0) {
                                finalTopicWords.push(word);
                                if (topicsDictionary.hasOwnProperty(word)) {
                                    uniqueAddToArray(id, topicsDictionary[word]);
                                    //topicsDictionary[word].push(id);
                                } else {

                                    topicsDictionary[word] = [id];
                                }
                            }

                        }
                    });


                });
                //console.log('about to return tagged list, time since last update:', Date.now() - lastTime);


                return {
                    nouns: nouns,
                    verbs: verbs,
                    persons: persons,
                    places: places,
                    organizations: organizations
                };
            }

            function dictCheckAndAdd(newList, dictionary, id) {
                newList.forEach(function (word, index) {
                    if (dictionary.hasOwnProperty(word)) {
                        dictionary[word].push(id);
                    } else {
                        dictionary[word] = [id];
                    }
                });
                return dictionary;

            }

            //console.log("timestamp, end = return statement: ", Date.now());

            //return fut.wait();
        });
    }).run();//end of Fiber(function(){....
} // end of processData function
if(Meteor.isServer){
    console.log('is server');
    Meteor.publish('nodeslinks', function(){
        return [Nodes.find({}), Links.find({})];//.fetch();

    });

    //Meteor.publish('links', function(){
    //    return Links.find({},{limit:50});//.fetch();
    //});
}




});

