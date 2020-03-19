const express = require('express')
const router = express.Router()
const cors = require('cors');
//onst video =require('../models/video')
const multer = require('multer')
const ffmpeg = require('fluent-ffmpeg');

router.use(cors());
ffmpeg.setFfmpegPath("C:/ffmpeg/ffmpeg-4.2.2-win64-static/bin/ffmpeg.exe")
let storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/');
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}_${file.originalname}`);
    },
    fileFilter:(req,file,cb)=>{
        const ext = path.extname(file.originalname)
        if(ext!=='.mp4'){
            return cb(res.status(400).end('mp4만 올리세여'),false);
        }
        cb(null,true)
    }
})

const upload = multer({storage:storage}).single("file");

router.post('/uploadfile',(req,res)=>{
    upload(req,res,err=>{
        if(err){
            return res.json({success:false,err})
            }
        return res.json({success:true, filePath: res.req.file.path, fileName: res.req.file.filename})
    })
})

router.post("/thumbnail", (req, res) => {

    let thumbsFilePath ="";
    let fileDuration ="";
    console.log(req.body)

    ffmpeg.ffprobe(req.body.filePath, function(err, metadata){
        console.dir(metadata);
        console.log(metadata.format.duration);

        fileDuration = metadata.format.duration;
    })


    ffmpeg(req.body.filePath)
        .on('filenames', function (filenames) {
            console.log('Will generate ' + filenames.join(', '))
            thumbsFilePath = "uploads/thumbnails/" + filenames[0];
        })
        .on('end', function () {
            console.log('Screenshots taken');
            return res.json({ success: true, thumbsFilePath: thumbsFilePath, fileDuration: fileDuration})
        })
        .screenshots({
            count: 3,
            folder: 'uploads/thumbnails',
            size:'320x240',
            filename:'thumbnail-%b.png'
        });

});

module.exports = router;