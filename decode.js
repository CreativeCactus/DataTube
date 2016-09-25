//When called with an arg we download the video
if(process.argv[2]){
    var video = require('youtube-dl')('http://www.youtube.com/watch?v='+process.argv[2],  ['--format=18'],  { cwd: __dirname });
    video.on('info', function(info) {    console.log('Download size: ' + info.size);    });
    video.pipe(require('fs').createWriteStream('./download.mp4'));
    console.log(`Now use the provided ffmpeg command to split the file. Be sure to overstate the framerate as duplicates are handled.`)
    return
}

var fs = require('fs'), 
    zip = new require('node-zip'),
    Canvas = require('canvas'); 

//number of virtual pixels (bits) in each frame
var bytex = 8
var vidx = bytex*8//must be a factor of 8
var vidy = 64
var imgBytes = vidx*vidy/8 //total data per image

//convenience methods
btoa=(b)=>{return (new Buffer(b).toString('base64'));}
json=(o)=>{return JSON.stringify(o)}

var canvas, ctx;

//Size of virtual pixels in real pixels. Set the total resolution by this to prevent non-int vpix size 
var bitx,bity;

var chunkNum=0, path="",buffer=[], lastChunk="";
while (path=NextFile(chunkNum++)){
    var data=fs.readFileSync(path)
    var img = new Canvas.Image
    img.src = data
    
    if(!canvas){
        canvas = new Canvas(img.width, img.height)
        ctx = canvas.getContext('2d')
        bitx= img.width/vidx
        bity= img.height/vidy
    }
    
    ctx.drawImage(img, 0, 0, img.width , img.height)
    var decoded=(Decode(ctx))
    if( json(decoded)!= lastChunk  ){
        console.log(`New keyframe ${path}`)
        lastChunk=json(decoded)
        buffer.push.apply(buffer,decoded)
    } else {
        console.log(`>>Skipped duplicate frame ${path}`)
    }
}
console.log("finished on file:" + chunkNum)

files=zip(btoa(buffer)+'', {base64: true, checkCRC32: true})
fs.writeFileSync("output.log",decodeURI(files.files['test.log']._data))
console.log("Your data is in output.log     ")
return

//left pad helper
function lpad(s,n,p){
    s=s+''
    var pad=(new Array(n+1)).join(p||'0')
    return pad.substring(0, pad.length - s.length) + s
}

//Get path of next file
function NextFile(n){
    try{
        var path="./dhunk"+lpad(chunkNum,9)+".jpg"
        console.log("Trying "+path)
        fs.accessSync(path, fs.F_OK)
        return path
    } catch (e){
        console.log("failed "+path)
        return false   
    }   
}

//Decode image context to data
function Decode(ctx){
    var Bytes=[]
    RGBXAvg = (imgdata)=>{
        var x = ~~(bitx/2)
        var y = ~~(bity/2)
        var w = imgdata.width
        var o = x*w*4 + y*4        
        R = imgdata.data[ o + 0 ]>128;
        G = imgdata.data[ o + 1 ]>128;
        B = imgdata.data[ o + 2 ]>128;
        //TODO average with the 4 adjacent pixels
        if(R && !G && !B) return undefined //empty byte is red
        return R && G && B
    }
    for(var y=0;y<vidy;y++){
        wholeByte:
        for(var x=0;x<vidx;x+=8){
            var byte=0
            for(var b=0;b<8;b++){   
                bit=RGBXAvg(ctx.getImageData((x+b)*bitx, y*bity, bitx, bity))
                if(bit==undefined){
                     continue wholeByte;
                }
                byte = byte^(bit<<b)
            }
            Bytes.push(byte)
        }
    }
    //TODO verify Rx count and CRC
    return Bytes   
}

//For debugging, enter the 'Expected' plaintext and compare it to the output.
function Check(buf){
    var Expected=``
    var diff="diff>"
    for(var i=0;i<Math.min(Expected.length,buf.length);i++) 
        diff+=buf[i]==Expected[i]?'_':'!';
    console.log(diff)    
}
