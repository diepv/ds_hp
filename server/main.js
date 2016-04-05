import { Meteor } from 'meteor/meteor';
//import 'lib/dataloader.js';
import { Mongo } from 'meteor/mongo';
//import { Nodes } from '../imports/lib/collections.js';
//import { Links } from '../imports/lib/collections.js';
//

//export const Nodes = new Mongo.Collection('nodes');
//export const Links = new Mongo.Collection('links');

//TO DO
/*
* 1. separate link generation from code so that nodes are made but not links (in links database)
* 2. create topics (generated when nodes are added) database where:
*   (-topic-):
*   {
*       nodeIds:[id1,id2,...,idn]
*   }
* 3. Process for creating links 'on the fly'
*  a. filter to retrieve max 300 nodes from node database & empty links database (prepping for new links)
*  b. for each node, create dictionaryObject:
*   (-topic-): [id1, id4, idx]
*  c. create (and upsert) link for each topic following structure:
*   {source: id3, target: id8, value: (-# of topics they have in common-), topic: [(-list of topics they share-)]}
*   a. if topic array does not contain (-current topic-) then $push to topic and $inc value, else do nothing
* */

const Nodes =new Mongo.Collection('nodes');
const RelevantNodes =new Mongo.Collection('nodesWithLinks');
const Links =new Mongo.Collection('links');
const Topics = new Mongo.Collection('topics');
//console.log('nodes count: ', Nodes.find().count());
Meteor.startup(() => {
    var Fiber = Npm.require('fibers');
    // code to run on server at startup (need to eventually change this conditional)
    if(Nodes.find().count()==0){
       processData();
    }
    //if(Links.find().count()==0){
        setLinks();
    //}

Meteor.methods({
    getLinksFor: function(nodeSet){

    }
});

 function setLinks(){
     //1. get node array
     console.log('setting nodelinks');
     //var nodeArray = Nodes.find({totalViews:{$gt: 1000}},{limit:300, sort:{totalViews:-1}});
     var nodeArray = Nodes.find({totalViews:{$gt:'5000'}},{limit:300, sort:{totalViews:-1}});
     RelevantNodes.remove({});
     nodeArray.fetch().forEach(function(nodeEntry, index){
         RelevantNodes.insert(nodeEntry);
     });
     //2. get links :)
     var rNodes = RelevantNodes.find();
     getLinks(rNodes, function(done){
         console.log('finished getting links');
     });
    }



function getLinks(nodeCursor, callback){

    var nodeTopicDictionary = {};
    //1. Empty Links Database
    Links.remove({});
    var nodeArray = nodeCursor.fetch();
    console.log('nodeArray length: ', nodeArray.length);
    nodeArray.forEach(function(node, nodeIndex){

        var nodeTopics = node.nlp.topics;
        var nodeId = node.idID;
        nodeTopics.forEach(function(topicWord, twIndex){
            if(nodeTopicDictionary.hasOwnProperty(topicWord)){
                if(nodeTopicDictionary[topicWord].indexOf(nodeId)<0){
                    //prior to adding this id, we want to set up the links between it and all previous ids and add it to the links database
                    linkIds(nodeTopicDictionary[topicWord],nodeId, topicWord);
                    nodeTopicDictionary[topicWord].push(nodeId);
                }else{
                    //it already exists!
                }

            }else{
                //do not create link yet becuase it doesn't hvae something to link to!
                nodeTopicDictionary[topicWord] = [nodeId];
            }
        });


    });
    callback(true);

    function linkIds(idList, idToLinkTo, topic){
        //for each id in the idList, create a link to the idToLinkTo
        idList.forEach(function(existingId, index){
            var sourceId = existingId,
                targetId = idToLinkTo;
            var upsertCheck = {source: sourceId, target: targetId};//, topic:[topicName], value:1};
            var existingLink = Links.findOne(upsertCheck);//.topics;
            if(existingLink){
                var existingTopics = existingLink.topics;
                if(existingTopics.indexOf(topic)<0){
                    Links.upsert(upsertCheck,{$push:{topics:topic}, $inc:{value:1}});
                }else{
                    //topic exists, 909 nevermind!
                }
            }else{
                //link needs to be inserted into db
                var singleLink = {source: sourceId, target:targetId, topics:[topic], value:1, dateAdded:Date.now()};
                Links.insert(singleLink);
            }

        });

    }

}
function processData() {
    Fiber(function(){
        var fs = Npm.require('fs');
        var nlp = Npm.require('nlp_compromise');
        var lda = Npm.require('lda');
        var file = process.env.PWD + '/public/data2.csv';
        console.log('processData: ', Date.now());
        var iterationNumber = 0;
        var files = fs.readFile(file, function (err, d) {
            console.log('read file: ', Date.now());
            var results = d.toString('ascii');
            var topicsDictionary = {};
            //var nodes = [];
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
                                //getTaggedWords processes the given string for LDA stuff and basic POS tagging. In addition, each topic is added to the Topics database with id
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

                            //nodes.push(dataEntry);
                            Nodes.update(dataEntry, dataEntry, {upsert:true});
                            //});
                            //create links and nodes json for sending to the client:
                            }).run();
                            }
                    //}

                }, complete: function (c) {

                    console.log('finished processing and adding nodes / topics to database');

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
                var topics = [];

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

                                Topics.upsert({topic:word},{$push:{nodeIdList:id}});

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
                    organizations: organizations,
                    topics: finalTopicWords
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
        });
    }).run();//end of Fiber(function(){....
} // end of processData function
if(Meteor.isServer){
    console.log('is server');
    Meteor.publish('nodeslinks', function(){
        return [RelevantNodes.find(), Links.find()];

    });

    //Meteor.publish('links', function(){
    //    return Links.find({},{limit:50});//.fetch();
    //});
}



/*
* for (var topicName in topicsDictionary) {

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
* */
});

