var express = require('express');
var path = require("path");
const fs = require("fs");
var Document = require('../models/document');

var app = express();

const dir = '/../opt/';
//===================================
// Obtiene el Documento
//===================================
app.get('/document/:carpeta/:documento', ( req, res, next ) => {

    var documento = req.params.documento;
    var carpeta = req.params.carpeta;
    var nombreArchivo = documento.split('.');
    var extArchivo = nombreArchivo [ nombreArchivo.length -1];
    var pathArchivo = path.resolve( dir, `${carpeta}/${documento}`);

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
// Obtiene el Documento con pdf
//===================================
app.get('/allDocument/:carpeta/:documento', ( req, res, next ) => {

    var documento = req.params.documento;
    var carpeta = req.params.carpeta;
    var nombreArchivo = documento.split('.');
    var extArchivo = nombreArchivo [ nombreArchivo.length -1];
    var pathArchivo = path.resolve( dir, `${carpeta}/${documento}`);

    res.sendFile(pathArchivo);

});


//===================================
// Obtener Archivos
//===================================
app.get('/:idorder', ( req, res)=> {
    var idorder = req.params.idorder;

    Document.find({$and: [{ document_id_order: idorder }, {document_status: '1'}]}) //, 'file_name file_name_user file_size file_status file_status id'
    .exec(

        (err, documents)=>{
            try {
                if ( err ) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'El codigo ingresado no es válido'
                    });
                } else {
                    if (documents.length > 0) {
                        res.status(200).json({
                            ok: true,
                            documents: documents
                        });
                    }else {
                        res.status(200).json({
                            ok: true,
                            mensaje: 'No hay información disponible con el código ingresado',
                            documents: documents
                        });

                    }
                }
            }catch (e) {

            }
    })
});


//===================================
// Actualizar Documento
//===================================
app.put('/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Document.findById( id, ( err, document )=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el documento',
                errors: err
            });
        }

        if ( !document ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El documento con id ' + id + ' no existe',
            errors: { message: 'No existe documento con ese ID' }
        });
    }

        document.document_date = body.document_date;
        document.document_name = body.document_name;
        document.document_name_user = body.document_name_user;
        document.document_size = body.document_size;
        document.document_status = body.document_status;


        document.save((err, documentGuardado)=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar el documento',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            document: documentGuardado
    });
    });

    });
});

//===================================
// Crear un nuevo documento
//===================================
app.post('/', (req, res)=> {
    var body = req.body;
var document = new Document({
    document_date: body.document_date,
    document_name: body.document_name,
    document_name_user: body.document_name_user,
    document_size: body.document_size,
    document_id_order: body.document_id_order

});
    document.save(( err, fileGuardado ) => {
    if ( err ){
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al guardar el documento',
            errors: err
        });
    }
    res.status(201).json({
        ok: true,
        document: fileGuardado
    });
});
});

//===================================
// Elimina documento fisico
//===================================

app.get('/delete/:documento', ( req, res, next ) => {

    var documento = req.params.documento;
    var nombreArchivo = documento.split('.');
    var extArchivo = nombreArchivo [ nombreArchivo.length -1];
    var pathArchivo = path.resolve(dir, `documentos_vendedor_temporales/${documento}`);

    if (fs.existsSync(pathArchivo)) {
        fs.unlinkSync(pathArchivo);
    }

    res.status(200).json({
        ok: true,
        document: pathArchivo
    });
});


//===================================
// Eliminar Documento de Mongo
//===================================
app.delete('/:idDocumento', ( req, res) => {
    var idDocumento = req.params.idDocumento;

    Document.findByIdAndRemove( idDocumento, (err, documentoBorrado ) => {
    if ( err ){
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al borrar el Documento',
            errors: err
        });
    }
    res.status(200).json({
        ok: true,
        document: documentoBorrado
    });
});

});


module.exports = app;
