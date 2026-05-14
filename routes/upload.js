var path = require("path");
var fs = require("fs");
var express = require("express");
var multer = require("multer");
var app = express();

var alias = '';
var DIR = '/../opt/doc_temporales';
var DIR2 = '/../opt/doc_almacenados';
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        var v_ext = "file";
        var s = file.originalname.indexOf(v_ext);
        if (s >= 0){
            cb(null, DIR2);
        }else{
            cb(null, DIR);
        }
        console.log(file);
        },
    filename: (req, file, cb) => {
        cb(null,  file.originalname);
    }
});

let upload = multer({storage: storage});


app.get("/", function (req, res) {
    res.end("file received");
});

app.post("/",upload.single("temporales"), function (req, res, next) {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });
    } else {
        console.log("file received");
        return res.send({
            success: true
        });
    }
});


module.exports = app;
