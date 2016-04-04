import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

// if (Meteor.isClient) {
    // counter starts at 0
    // Session.setDefault('counter', 0);

     Template.bubbleGraph.onRendered(function(){
			 console.log('bubble graph start timestamp : '+Date.now());
        var svgHeight = 1200;
        var svgWidth = 2000;
        var svg = d3.select("#bubbleGraph").attr('width',svgWidth).attr('height',svgHeight);
        var defs = svg.append('defs');
        // Deps.autorun(function(){
            var data = d3.csv("data.csv", function(d){
                return {
                    id: d['_ - id'],
                    idID: d['_ - _id'],
                    live: d['_ - live'],
                    title: d['_ - title'],
                    //username: d._-username,
                    totalViews: d['_ - totalViews'],
                    //stream: d._-streamSource,
                    //url: d._-url,
                    status: d['_ - status'],
                    //rating: d._-rating,
                    //embedTag: d._-embedTag,
                    //viewersNow: d._-viewersNow,
                    description: d['_ - description'],
                    //isProtected: d._-isProtected,
                    //urlTitleName: d._-urlTitleName,
                    currentViewers: d['_ - currentViewers'],
                    //createdAtInUStreamTime: d._-createdAtInUStreamTime,
                    //oneIfCurrent: d._-oneIfCurrent,
                    //vid: d._-vid,
                    //lat: d._-lat,
                    //lon: d._-lon,
                    //type: d._-type,
                    //page: d._-page,
                    //width: d._-width,
                    //author: d._-author,
                    //height: d._-height,
                    //mirrors: d._-mirrors,
                    //upvotes: d._-upvotes,
                    //created: d['_ - created']
                    //country: d._-country,
                    //visibility: d._-visibility,
                    //lengthSecs: d._-lengthSecs,
                    //viewsLive: d._-views_live,
                    viewsTotal: d['_ - views_total'],
                    //deviceName: d._-device_name,
                    //deviceClass: d._-device_class,
                    //commentCount: d._-comment_count,
                    //positionType: d._-position_type,
                    //positionAccuracy: d._-position_accuracy,
                    //preview: d._-preview,
                    //framerate: d._-framerate,
                    //trail: d._-trail,
                    //esTitle: d._ - _es - title,
                    //esDescription: d._ - _es - description,
                    esBroadcaster: d['_ - _es - broadcaster'],
                    //esTagsTags: d._ - _es - tags - tags,
                    creationDateDate: d['_ - creationDate - $date'],
                    //userId: d._ - user - id,
                    //userUrl: d._ - user - url,
                    //userUserName: d._ - user - userName,
                    //imageUrlSmall: d._ - imageUrl - small,
                    imageUrlMedium: d['_ - imageUrl - medium'],
                    lastStreamedAtDate: d['_ - lastStreamedAt - $date']
                    //ownerUID: d._ - owner - uid,
                    //owenerName: d._ - owner - name,
                    //ownerHidden: d._ - owner - hidden,
                    //ownerTimezone: d._ - owner - timezone,
                    //ownerUnlisted: d._ - owner - unlisted,
                    //ownerMostRecent: d._ - owner - mostRecent,
                    //ownerProfileUrl: d._ - owner - profile_url,
                    //ownerTimezoneNameShort: d._ - owner - timezone_name_short,
                    //ownerAvatarSmallSize: d._ - owner - avatar - small - size,
                    //ownerAvatarSmallFilename: d._ - owner - avatar - small - filename,
                    //ownerAvatarLargeSize: d._ - owner - avatar - large - size,
                    //ownerAvatarLargeFilename: d._ - owner - avatar - large - filename,
                    //tagsTag: d._ - tags - _ - tag

                };
            }, function(error, dRows){
                if(error){
                	console.log("ERROR: ",error);
                }else{

                    var rows = dRows.sort(function(a,b){
                        return b.currentViewers - a.currentViewers;
                    });

                    //style settings for bubble graph :

                    var leftMargin = 80;
                    var topMargin = 100;
                    var bottomMargin = 20;
                    var bubbleGraphHeight = svgHeight-topMargin-bottomMargin;
                    var bubbleGraphWidth = svgWidth-200;
                    //getting stuff for date scales ready:
                    //  var initialDate = d3.extent(rows, function(d){ return d.lastStreamedAtDate=="" ? "2003-01-01": d.lastStreamedAtDate;});
                    //var endDate = d3.extent(rows, function(d){ return d.creationDateDate; });
                    //var endDate = new Date('2016-04-06T12:00:29.000Z');
                    //var startD = initialDate.getFullYear() + "-"+ parseInt(initialDate.getMonth()+1)+"-"+initialDate.getDate();
                    //var endD = endDate.getFullYear() + "-"+ parseInt(endDate.getMonth()+1)+"-"+endDate.getDate();

                    //SCALES
                    var timeBoundStart = new Date(2016,02,5);
                    var timeBoundEnd = new Date(2016,02,13);
                    var midtime = new Date(2016,02,07);
                    var midtime2 = new Date(2016,02,10);

                    //timescale is x axis right now
                    var timeScale = d3.time.scale().domain([timeBoundStart,midtime,midtime2, timeBoundEnd]).range([parseInt(bubbleGraphWidth+leftMargin), 2*parseInt(bubbleGraphWidth+leftMargin)/3+10,2*parseInt(bubbleGraphWidth+leftMargin)/3 ,leftMargin]);
                    var maxTotalViews = d3.max(d3.extent(rows, function(d){return d.totalViews;}));
                    var minTotalViews = d3.min(rows, function(d){return d.totalViews;});
                    //linearsacle is y axis
                    var linearScale = d3.scale.linear().domain([0,8000,12000]).range([bubbleGraphHeight,topMargin+(bubbleGraphHeight/3), topMargin]);
                    var max = d3.max(rows, function(d){return d.currentViewers;});
                    var min = d3.min(rows, function(d){return d.currentViewers;});

                    var radiusScale = d3.scale.linear().domain([0, 500, 6000 ]).range([70,180,230]);

                    //var radiusScale2 = d3.scale.linear().domain([100,999999]).range([5,29]);


                    ////popularity slider
                    //var sliderLine = svg.append('line');
                    //var sliderHandle = svg.append('rect');
                    //
                    //var sliderStartX = 150;
                    //var sliderEndX = 500;
                    //
                    //
                    //sliderLine.attr('x1',150)
                    //    .attr('y1',5)
                    //    .attr('x2',500)
                    //    .attr('y2',5)
                    //    .attr('stroke','orange')
                    //    .attr('stroke-width',3)
                    //    .attr('id','sliderLine');
                    //
                    //sliderHandle.attr('x',150)
                    //    .attr('y',5)
                    //    .attr('width',30)
                    //    .attr('height',10)
                    //    .attr('fill','red')
                    //    .attr('id','sliderHandle');
                    //
                    //sliderHandle.on('dragstart', function(event){
                    //    //pikcup
                    //});
                    //sliderHandle.on('dragmove', function(event){
                    //    sliderHandle.attr('x', event.clientX);
                    //});


                    var dataV = rows.filter(function(d,i){
                        //if(d.currentViewers!=='' && d.currentViewers!==null && d.currentViewers!==undefined){
                        //    if(i<=300){
                        //        return true;
                        //    }else{
                        //        return false;
                        //    }
                        //}else{
                        //    return false;
                        //}
                        if(d.creationDateDate!=='' && d.creationDateDate!==null && d.creationDateDate!==undefined){
                            var givenDate = new Date(d.creationDateDate);
                            if(givenDate>timeBoundStart && givenDate<=timeBoundEnd && i<=200){
                                return true;
                            }else{
                                return false;
                            }
                        }else{
                            return false;
                        }

                    });
                    //
                    //var dataS = dataV.sort(function(a,b){
                    //    if(a.currentViewers > b.currentViewers){
                    //        return 1;
                    //    }
                    //    if(a.currentViewers < b.currentViewers){
                    //        return -1;
                    //    }
                    //    return 0;
                    //});
                    ////
                    //dataV = dataS.filter(function(d,i){
                    //    console.log('i, currentViews: ',i+" --- "+ d.currentViewers);
                    //    return i<=20;
                    //});
                    //console.log(dataV);

                    var bubbles = svg.selectAll('g').data(dataV).enter();
                    var yAxis = d3.svg.axis()
                        .scale(linearScale)
                        .orient('left')
                        .ticks(10);
                    //.tickValues([0,100,200,300,400,500,1000,2000,3000,4000,5000]);

                    var xAxis = d3.svg.axis()
                        .scale(timeScale)
                        .orient('bottom')
                        .ticks(d3.time.days,1)
                        .tickFormat(d3.time.format('%d'));

                    var bubGroup = bubbles.append('g').attr('class',function(d){
                        defs.append('pattern')
                            .attr('id',function(){
                                return d.idID+"-image";
                            })
                            .attr('height',"1")
                            .attr('width',"1")
                            .attr("viewBox", "0 0 320 180")
                            .attr('preserveAspectRatio','none')
                            .append('image')
                            //.attr('transform','translate(-45,10)')
                            .attr('preserveAspectRatio','none')
                            //.attr('x',function(){
                            //    //console.log('d.lastStreamedDate determine cy', d.lastStreamedAtDate);
                            //    if(d.creationDateDate!=='' && d.creationDateDate!==null && d.creationDateDate!==undefined){
                            //        var date = new Date(d.creationDateDate);
                            //        //if(d.lastStreamedAtDate!=='' && d.lastStreamedAtDate!==null && d.lastStreamedAtDate!==undefined){
                            //        //  var date = new Date(d.lastStreamedAtDate);
                            //        //var fixedDate = new Date(date.getFullYear()+"-"+parseInt(date.getMonth()+1)+"-"+date.getDate());
                            //        return parseInt(parseInt(timeScale(date))-45);
                            //    }else{
                            //        return parseInt(topMargin)-45;
                            //    }
                            //})
                            //.attr('y', function(){
                            //    if(d.totalViews!==null && d.totalViews!==undefined && d.totalViews!=='') {
                            //        var viewCount = parseInt(d.totalViews);
                            //        if (viewCount==0){
                            //            return parseInt(parseInt(linearScale(d.currentViewers))-80);
                            //        }else{
                            //            return parseInt(linearScale(viewCount))-80;
                            //        }
                            //    }else{
                            //        return d.currentViewers!==''? parseInt(linearScale(d.currentViewers))-80: 0;
                            //    }
                            //})
                            .attr('width','320')
                            .attr('height','180')
                            .attr('xlink:href',function(){
                                return d.imageUrlMedium;
                            });

                        return 'bubble'
                    });

                    var bubbleCircle = bubGroup.append('circle').attr('r',function(d,i){
                        var views = parseInt(d.currentViewers);

                        if(views!=='' && views!==undefined && views!==null){
                            //if(views<500000){
                            //  return radiusScale2(views);
                            //}else if(views >=500000){
                            //  console.log('r over 500000');

                            return radiusScale(views);
                            //}

                        }else{
                            return 5;
                        }
                    }).attr('cx',function(d,i){
                        //console.log('d.lastStreamedDate determine cy', d.lastStreamedAtDate);
                        if(d.creationDateDate!=='' && d.creationDateDate!==null && d.creationDateDate!==undefined){
                            var date = new Date(d.creationDateDate);
                            //if(d.lastStreamedAtDate!=='' && d.lastStreamedAtDate!==null && d.lastStreamedAtDate!==undefined){
                            //  var date = new Date(d.lastStreamedAtDate);
                            //var fixedDate = new Date(date.getFullYear()+"-"+parseInt(date.getMonth()+1)+"-"+date.getDate());
                            return timeScale(date);
                        }else{
                            return topMargin;
                        }

                    }).attr('cy',function(d){
                        if(d.totalViews!==null && d.totalViews!==undefined && d.totalViews!=='') {
                            var viewCount = parseInt(d.totalViews);
                            if (viewCount==0){
                                return linearScale(d.currentViewers);
                            }else{
                                return linearScale(viewCount);
                            }
                        }else{
                            return d.currentViewers!==''? linearScale(d.currentViewers): 0;
                        }
                    }).attr('fill',function(d){return 'url(#'+ d.idID+'-image)';}).attr('stroke','black').attr('stroke-width',1);//.a('fill','blue');

                    var textRect = bubGroup.append('rect')
                        .attr('x', function(d){
                            return getX(d)-getR(d)-10;
                        })
                        .attr('y',function(d){
                            return getY(d)-35;
                        })
                        .attr('height',50)
                        .attr('width',function(d){
                            return 2*getR(d)+20;
                        })
                        .attr('fill','rgba(0,0,0,0.8)');

                    var titleText = bubGroup.append('text')
                        .attr('class','title')
                        .attr('x', function(d){
                            return getX(d);
                        })
                        .attr('y', function(d){
                            return getY(d);
                        })
                        .append('tspan')
                        .text(function(d, i){
                            return d.title.toUpperCase();
                        })
                        .style('text-anchor','middle');

                    bubGroup.append('text')
                        .attr('class','hover')
                        .attr('display','none')
                        .text(function(d, i){
                            return d.description.toUpperCase();
                        })
                        .attr('x', function(d){
                            if(d.creationDateDate!=='' && d.creationDateDate!==null && d.creationDateDate!==undefined){
                                var date = new Date(d.creationDateDate);
                                //var fixedDate = new Date(date.getFullYear()+"-"+parseInt(date.getMonth()+1)+"-"+date.getDate());
                                return timeScale(date);
                            }else{
                                return topMargin;
                            }

                        })
                        .attr('y', function(d){
                            if(d.totalViews!==null && d.totalViews!==undefined && d.totalViews!=='') {
                                var viewCount = parseInt(d.totalViews);
                                if (viewCount==0){
                                    return linearScale(d.currentViewers);
                                }else{
                                    return linearScale(viewCount);
                                }
                            }else{
                                return d.currentViewers!==''? linearScale(d.currentViewers): 0;
                            }
                        });

                    //bubGroup.append('audio').attr('src', function(d,i){
                    //    if(i%3 == 1){
                    //        return audioArray[0];
                    //    }else{
                    //        if(i%2){
                    //            return audioArray[1];
                    //        }else{
                    //            return audioArray[2];
                    //        }
                    //    }
                    //}).attr('class','audio');


                    //$(".bubble").on('mouseover', function(e){
                    //    console.log('this hover: ',$(this));
                    //   $(this).find('.hover').show();
                    //});




                    function getR(d){
                        var views = parseInt(d.currentViewers);

                        if(views!=='' && views!==undefined && views!==null){
                            //if(views<500000){
                            //  return radiusScale2(views);
                            //}else if(views >=500000){
                            //  console.log('r over 500000');

                            return radiusScale(views);
                            //}

                        }else{
                            return 5;
                        }
                    }

                    function getY(d){
                        if(d.totalViews!==null && d.totalViews!==undefined && d.totalViews!=='') {
                            var viewCount = parseInt(d.totalViews);
                            if (viewCount==0){
                                return linearScale(d.currentViewers);
                            }else{
                                return linearScale(viewCount);
                            }
                        }else{
                            return d.currentViewers!==''? linearScale(d.currentViewers): 0;
                        }
                    }
                    function getX(d){
                        if(d.creationDateDate!=='' && d.creationDateDate!==null && d.creationDateDate!==undefined){
                            var date = new Date(d.creationDateDate);
                            //var fixedDate = new Date(date.getFullYear()+"-"+parseInt(date.getMonth()+1)+"-"+date.getDate());
                            return timeScale(date);
                        }else{
                            return topMargin;
                        }
                    }
                    function wrap(text, width) {
                        text.each(function() {
                            var text = d3.select(this),
                                words = text.text().split(/\s+/).reverse(),
                                word,
                                line = [],
                                lineNumber = 0,
                                lineHeight = 1.1, // ems
                                y = text.attr("y"),
                                dy = parseFloat(text.attr("dy")),
                                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                            while (word = words.pop()) {
                                line.push(word);
                                tspan.text(line.join(" "));
                                if (tspan.node().getComputedTextLength() > width) {
                                    line.pop();
                                    tspan.text(line.join(" "));
                                    line = [word];
                                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                                }
                            }
                        });
                    }
                    var drag = d3.behavior.drag();
                    //drag.on('dragstart', function(d){
                    //    d.x = d3.event.x || 10;
                    //    d.y = d3.event.y || 10;
                    //    d.originalX = d3.event.x;
                    //    d.originalY = d3.event.y;
                    //});
                    drag.origin(function(d,i){return d.x?{x: d.x,y: d.y}:{x:0,y:0};});
                    drag.on('drag', function(d){
                        d.x = d3.event.x;
                        d.y = d3.event.y;
                        console.log('dx dy', "("+[d.x, d.y]+")");
                        if(d.x==''){
                            d.x=0;
                        }
                        if(d.y==''){
                            d.y=0;
                        }
                        d3.selectAll('.bubble').attr('transform', function(d){
                            return 'translate('+[d.x, d.y]+')';
                        });

                    });

                    bubGroup.call(drag);
                    bubGroup.on('click',function(d,i){
                        var items = [d.title, d.esBroadcaster, d.currentViewers, d.description];
                        var itemLabels = ["TITLE", "BROADCASTER", "CURRENT VIEWERS", "DESCRIPTION"];
                        var str = [];
                        items.forEach(function(item, index){
                            if(item!=='' && item!==undefined && item!==null){
                                str.push(itemLabels[index]+": "+item);
                            }
                        });
                        var title = "TITLE: "+ d.title+";";
                        var broadcaster = "BROADCASTER: "+ d.esBroadcaster;
                        var currentViewerCount = "CURRENT VIEWERS: "+ d.currentViewers;
                        var description = "DESCRIPTION"+ d.description;

                        $("#textLabel").text(str.join("  |  "));
                        var audioArray = ['airtraffic.mp3','male_snoring.mp3','yelling.mp3'];
                        var rr = Math.random();
                        console.log('rr', rr);
                        if(rr<0.3){
                            console.log('0');
                            $("#sound").attr('src',audioArray[0]);
                        }else if(rr<=0.6 && rr>=0.3){
                            console.log('1');
                            $("#sound").attr('src', audioArray[1]);
                        }else{
                            console.log('2');
                            $("#sound").attr('src', audioArray[2]);
                        }
                        document.getElementById('sound').play();
                    });
                    //svg.append('g')
                    //    .attr('class','x-axis')
                    //    .attr('transform','translate(0, '+bubbleGraphHeight+')')
                    //    .call(xAxis);
                    //
                    ////X AXIS is creationDate
                    // //Y AXIS is totalViews

                    //svg.append('g')
                    //    .attr('class','y-axis')
                    //    .attr('transform', 'translate('+leftMargin+',0)')
                    //    .call(yAxis);
                }});//end csv callback



        // }); //end Deps.autorun
			 console.log('bubble graph end timestamp : '+Date.now());

    });
		
     Template.networkGraph.onRendered(function(){
         Meteor.call('processData', function(err,d){
             console.log(err);
             if(err){
                 console.log("ERROR!! :(");
             }else{
                 console.log('process data call results :', d);

                 var height = 600;
                 var width = 900;

                 var data = d;

                 var svg = d3.select("#networkGraph");

                 svg.attr('height', height)
                     .attr('width', width);

                 svg.append('rect')
                     .attr('x',0)
                     .attr('y',0)
                     .attr('width',width)
                     .attr('height', height)
                     .style('stroke','pink')
                     .style('fill','none')
                     .style('stroke-width',2);



                 var links = data.links;
                 var nodes = data.nodes;
                 var edges = []; //new 'links' data set
                 links.forEach(function(e){
                    var sourcenode = nodes.filter(function(n){
                        return n.idID === e.source;
                    })[0];
                    var targetnode = nodes.filter(function(n){
                        return n.idID === e.target;
                    })[0];
                     edges.push({
                         source:sourcenode,
                         target:targetnode,
                         value: 5
                     });
                 });

                 var force = d3.layout.force();
                 force.charge(-180)
                     .gravity(0.1)
                     .size([width,height]);

                 force.nodes(data.nodes)
                     .links(edges).linkDistance(function(d){
                         return 130;
                     }).start();

                 var viewerScale = d3.scale.linear().domain([0,10000]).range([10,100]);

                 var nodes = svg.selectAll('.nodeGroup')
                     .data(data.nodes)
                     .enter()
                     .append('g')
                     .attr('class','nodeGroup')
                     .call(force.drag);

                 var circles = nodes.append('circle')
                     .attr('r', function(d){
                         return viewerScale(d.currentViewers);
                     })
                     .style('stroke','red')
                     .style('stroke-width',2)
                     .style('fill', 'white')
                     .attr('class','node');

                 nodes.append('text')
                     .style('fill','black')
                     .text(function(d){return d.currentViewers;});

                 var links = svg.selectAll('.link').data(edges).enter()
                     .append('line')
                     .attr('class','link')
                     .style('stroke', 'pink')
                     .style('stroke-width', 3);



                 force.on('tick', function() {
                    // coorindates for link is source and target x/y coordinates
                     links.attr('x1', function(d){ return d.source.x; })
                          .attr('y1', function(d){ return d.source.y; })
                          .attr('x2', function(d){ return d.target.x; })
                          .attr('y2', function(d){ return d.target.y; });

                     //coordinates for ndoes are set by the calculated position (d3 layout provided)
                    nodes.attr('transform', function(d){
                               return "translate("+ d.x+","+ d.y+")";
                        });
                     //circles
                     //    .attr('cx', function(d){
                     //     return d.x;
                     //   })
                     //    .attr('cy', function(d){
                     //        return d.y;
                     //    });
                 });


             }

         });
     });
		Template.dataCheck.onRendered(function(){

			});

// }
//
//if (Meteor.isServer) {
//    Meteor.startup(function () {
//        // code to run on server at startup
//    });
//}
