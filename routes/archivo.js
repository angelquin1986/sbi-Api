var express = require('express');
var path = require("path");
var fs = require("fs");
var File = require('../models/file');

var app = express();

const dir = '/../opt/';
//===================================
// Obtiene el archivo
//===================================
app.get('/file/:carpeta/:archivo', ( req, res, next ) => {

    var archivo = req.params.archivo;
    var carpeta = req.params.carpeta;
    var nombreArchivo = archivo.split('.');
    var extArchivo = nombreArchivo [ nombreArchivo.length -1];
    var pathArchivo = path.resolve( dir, `${carpeta}/${archivo}`);

    if ( 'jpg' === extArchivo || 'png' === extArchivo || 'jpeg' === extArchivo || 'JPG' === extArchivo || 'PNG' === extArchivo) {
        res.sendFile(pathArchivo);
    } else {
        if ('doc' === extArchivo || 'docx' === extArchivo){
            var pathWord = path.resolve(__dirname, '../opciones/word.ico');
            res.sendFile(pathWord);
        } else if ('pdf' === extArchivo ){
            var pathPdf = path.resolve(__dirname, '../opciones/pdf.png');
            res.sendFile(pathPdf);
        } else {
            var pathFile = path.resolve(__dirname, '../opciones/file.png');
            res.sendFile(pathFile);
        }
    }
});


//===================================
// Obtener Archivos
//===================================
app.get('/:idorder', ( req, res)=> {
    var idorder = req.params.idorder;

File.find({$and: [{ file_id_order: idorder }, {file_status: '1'}]}, 'file_name file_name_user file_size file_status file_status id') //
    .exec(
        (err, files)=>{
        if ( err ) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error cargar seller',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            files: files
        });
    })
});


//===================================
// Actualizar archivo
//===================================
app.put('/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;
    File.findById( id, ( err, file )=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el archivo',
                errors: err
            });
        }

        if ( !file ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El archivo con id ' + id + ' no existe',
            errors: { message: 'No existe archivo con ese ID' }
        });
    }

file.file_name = body.file_name;
file.file_name_user = body.file_name_user;
file.file_size = body.file_size;
file.file_status = body.file_status;
file.file_encode = body.file_encode;


    file.save((err, fileGuardado)=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar el archivo',
                errors: err
            });
        }
        res.status(200).json({
        ok: true,
        file: fileGuardado
    });
    });

    });
});

//===================================
// Crear un nuevo archivo
//===================================
app.post('/', (req, res)=> {
    var body = req.body;
var file = new File({
    file_name: body.file_name,
    file_name_user: body.file_name_user,
    file_size: body.file_size,
    file_encode: body.file_encode,
    file_id_order: body.file_id_order
});
file.save(( err, fileGuardado ) => {
    if ( err ){
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al guardar el Archivo',
            errors: err
        });
    }
    res.status(201).json({
        ok: true,
        file: fileGuardado
    });
});
});

//===================================
// Elimina archivo fisico
//===================================

app.get('/delete/:archivo', ( req, res, next ) => {

    var archivo = req.params.archivo;
    var nombreArchivo = archivo.split('.');
    var extArchivo = nombreArchivo [ nombreArchivo.length -1];
    var pathArchivo = path.resolve( dir, `doc_temporales/${archivo}`);

    if (fs.existsSync(pathArchivo)) {
        fs.unlinkSync(pathArchivo);
    }

    res.status(200).json({
        ok: true,
        file: pathArchivo
    });
});


//===================================
// Eliminar Archivo de Mongo
//===================================
app.delete('/:idArchivo', ( req, res) => {
    var idArchivo = req.params.idArchivo;

File.findByIdAndRemove( idArchivo, (err, archivoBorrado ) => {
    if ( err ){
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al borrar el Archivo',
            errors: err
        });
    }
    res.status(200).json({
        ok: true,
        file: archivoBorrado
    });
});

});


module.exports = app;
