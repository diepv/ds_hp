////import { Mongo } from 'meteor/mongo';
////export const Nodes = new Mongo.Collection('nodes');
////export const Links = new Mongo.Collection('links');
//
//export const Nodes = new Meteor.Collection("nodes");
//export const Links = new Meteor.Collection("links");
////optional you can place this subscribe inside the appName/client/main.js
//if(Meteor.isClient){
//    Meteor.subscribe("nodes", function(){
//        console.log("NODES! ", Nodes.find().count());
//        //console.log(states, states.find(), states.find().fetch());
//    });
//    Meteor.subscribe("links", function(){
//        console.log("LINKS! ", Links.find().count());
//        //console.log(states, states.find(), states.find().fetch());
//    });
//}