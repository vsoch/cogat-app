// This script will connect to neo4j and add Cognitive Atlas data to new database

var baby = require("babyparse");
var neo4j = require('neo4j');
var fs = require('fs');
var async = require('async');
var encoding = 'utf8'

// Connect to neo4j - this is the most widely use driver
var db = new neo4j.GraphDatabase('http://graphdb:7474');

// Here are the different Cognitive Atlas objects
var data_inputs = {"concepts":"../data/Dump_concept_2015-12-25_567dd9b28fabb.csv",
                   "task":"../data/Dump_task_2015-12-25_567dd9bb7ff74.csv",
                   "contrast":"../data/Dump_contrast_2015-12-25_567dd9c4b46c4.csv",
                   "battery": "../data/Dump_battery_2015-12-25_567dd9d2866fd.csv",
                   "condition":"../data/Dump_condition_2015-12-25_567dd9bf079bb.csv",
                   "disorder":"../data/Dump_disorder_2015-12-26_567f21649c2cb.csv",
                   //"theory":"../data/Dump_theory_2015-12-25_567dd9d52f53b.csv",
                   //"assertion":"../data/Dump_assertion_2015-12-25_567dd9cd411c5.csv"
                   }

// Function to read in file, and pass on to parsing function depending on label
read_file = function(data, label, encoding) {
    fs.readFile(data, encoding, function (err,data) {
        if (err) {
            return console.log(err);
        }

        // Babyparse is PapaParse for nodejs
        parsed = baby.parse(data);

        switch(label) {
        case "concepts":
        case "task":
            cypher(parsed);    
            break;
        case "contrast":
            cypherContrast(parsed);    
            break;
        case "battery":
            cypherBattery(parsed);    
            break;
        case "condition":
            cypherCondition(parsed);    
            break;
        case "disorder":
            cypherDisorder(parsed);    
            break;
        case "assertion":
            cypherAssertion(parsed);    
            break;
        default:
            console.log(label + " not recognized.");
        };
    });
};


// Callback function
function callback(err, results) {
    if (err) throw err;
    var result = results[0];
    if (!result) {
        console.log('Not found.');
    } else {
        var node = result['node'];
        console.log(node);
    }
};

 
// PARSE CONCEPTS or TASKS
function cypher(parsed) {
     parsed.data.forEach (function (e){
        var name = e[0];
        var nodetype = e[1]
        var uid = e[2];
        if (uid!=undefined){

            uid = uid.split("/"); 
            uid = uid[uid.length-1]; 
            var properties = {"name":name};
    
            var query = [
                'CREATE (node:' + nodetype + ' {id: {id}})',
                'SET node += {props}',
                'RETURN node',
                ].join('\n');

            var params = {
                id: uid,
                props: properties,
            };

            db.cypher({
                query: query,
                params: params,
            }, callback);
        }
    })
};

// PARSE BATTERY
function cypherBattery(parsed) {
     parsed.data.forEach (function (e){
 
        var name = e[0];
        var abbrev = e[1];
        var uid = e[2];
        if (uid!=undefined){

            uid = uid.split("/"); 
            uid = uid[uid.length-1]; 
            var properties = {"name":name,"abbrev":abbrev};
    
            var query = [
                'CREATE (node:battery {id: {id}})',
                'SET node += {props}',
                'RETURN node',
                ].join('\n');

            var params = {
                id: uid,
                props: properties,
            };

            db.cypher({
                query: query,
                params: params,
            }, callback);

        }
    })
};

// PARSE ASSERTIONS
function cypherAssertion(parsed) {
     parsed.data.forEach (function (e){

        var uid = e[0];
        var user = e[1];
        var source = e[2]
        var target = e[3]
        var type = e[4];
        var description = e[6]
        var timestamp = e[7]
        var contrast = e[8];
       

        if (uid!=undefined){
            var properties = {"type":type,
                              "user":user,
                              "description":description,
                              "timestamp":timestamp};
            switch(type) {

            case "concept-task":
                var query = [
                  "MATCH (a:task),(b:concept)",
                  "WHERE a.id = '" + target + "' AND b.id = '" + uid + "'",
                  "CREATE (b)-[r:MEASUREDBY]->(a)",
                  'SET r += {props}',
                  "RETURN r",
                 ].join('\n');
                break;
            case "concept-concept":
                var query = [
                  "MATCH (a:concept),(b:concept)",
                  "WHERE a.id = '" + source + "' AND b.id = '" + target + "'",
                  "CREATE (b)-[r:RELATEDTO]->(a)",
                  'SET r += {props}',
                  "RETURN r",
                 ].join('\n');
                break;
                default:
                    console.log(type + " not recognized.");
             };

            var params = {
                id: uid,
                props: properties,
            };

            db.cypher({
                query: query,
                params: params,
            }, callback);

        }
    })
};


function cypherDisorder(parsed) {
     parsed.data.forEach (function (e){

        var name = e[1];
        var classification = e[2];
        var uid = e[0];
        if (uid!=undefined){

            uid = uid.split("/"); 
            uid = uid[uid.length-1]; 
            var properties = {"name":name,"classification":classification};
    
            var query = [
                'CREATE (node:disorder {id: {id}})',
                'SET node += {props}',
                'RETURN node',
                ].join('\n');

            var params = {
                id: uid,
                props: properties,
            };

            db.cypher({
                query: query,
                params: params,
            }, callback);

        }

    })
};

// PARSE CONDITIONS
function cypherCondition(parsed) {
     parsed.data.forEach (function (e){

        var uid = e[0];
        var user = e[1];
        var task = e[2];
        var name = e[3];
        var description = e[4]
        if (uid!=undefined){

            uid = uid.split("/"); 
            uid = uid[uid.length-1]; 
            var properties = {"name":name,"user":user,"description":description};
    
            var query = [
                'CREATE (node:condition {id: {id}})',
                'SET node += {props}',
                'RETURN node',
                ].join('\n');

            var params = {
                id: uid,
                props: properties,
            };

            db.cypher({
                query: query,
                params: params,
            }, callback);

            // Now create the relationship
            var query = [
              "MATCH (a:task),(b:condition)",
              "WHERE a.id = '" + task + "' AND b.id = '" + uid + "'",
              "CREATE (a)-[r:HASCONDITION]->(b)",
              "RETURN r",
             ].join('\n');

            db.cypher({
                query: query,
            }, callback);

        }
 
    })
};

// PARSE CONTRASTS
cypherContrast = function(parsed) {
     parsed.data.forEach (function (e){
        var name = e[3];
        var username = e[1];
        var timestamp = e[4];
        var uid = e[0];
        var task = e[2]
        if (uid!=undefined){

            uid = uid.split("/"); 
            uid = uid[uid.length-1]; 
            var properties = {"name":name};
    
            var query = [
                'CREATE (node:contrast {id: {id}})',
                'SET node += {props}',
                'RETURN node',
                ].join('\n');

            var params = {
                id: uid,
                props: properties,
            };

            db.cypher({
                query: query,
                params: params,
            }, callback);

            // Now create the relationship
            var query = [
              "MATCH (a:task),(b:contrast)",
              "WHERE a.id = '" + task + "' AND b.id = '" + uid + "'",
              "CREATE (a)-[r:MEASUREDBY]->(b)",
              "RETURN r",
             ].join('\n');

            db.cypher({
                query: query,
            }, callback);

        }
    });
};

// Read in files, parse, do it!
Object.keys(data_inputs).forEach(function(key, i) {
    read_file(data_inputs[key],key,encoding)
});
