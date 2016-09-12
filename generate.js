var zip = new require('node-zip');
var gd = require('node-gd');
var fs = require('fs');

//parameters
var DBG=1
//number of virtual pixels (bits) 
var bytex = 8
var vidx = bytex*8//must be a factor of 8
var vidy = 64
var imgBytes = vidx*vidy/8
//size of virtual pixels. set the total resolution by this to prevent non-int vpix size 
var bitx = 8
var bity = 8
//video resolution
var resx = bitx*vidx
var resy = bity*vidy

var inputstring=""
try{
    inputstring=fs.readFileSync(process.argv[2])
} catch (e){
    console.log(`Could not open ${process.argv[2]}: ${e}`)
}

//zip up
var archive = zip()
archive.file('test.log', encodeURI(inputstring));
var data = archive.generate({base64:true,compression:'DEFLATE'});
buffer = Buffer.from(data,"base64");

//reverse
// files=zip(data+'', {base64: true, checkCRC32: true});
// fs.writeFileSync("output",decodeURI(files.files['test.log']._data))

//render frames
var offset=0, ChunkN=0
var padLabel = new Array((buffer.length+'').length).join('0')
while (offset<buffer.length){
    ChunkN++
    var chunk = buffer.slice(offset,Math.min(offset+=imgBytes,buffer.length))
    var img = gd.createTrueColorSync(resx, resy);//black background
    
    var c0 = img.colorAllocate(0,0,0);
    var c1 = img.colorAllocate(255,255,255);
    var cX = img.colorAllocate(255,0,0);
    var cdbg1 = img.colorAllocate(0,255,0);
    var cdbg2 = img.colorAllocate(0,0,255);

    for(var byte=0;byte<imgBytes;byte+=1){
            
            var B=chunk.length>byte?chunk[byte]:-1;
            var BXOff=(byte%bytex)*8*bitx
            var BYOff=(~~(byte/bytex))*bity
            
            
            if(DBG)img.filledRectangle(
                BXOff - 2, 
                BYOff - 2, 
                BXOff + 2, 
                BYOff + 2, 
                (byte+1)<imgBytes?cdbg1:cdbg2);
            
            for(var b=0;b<8;b++){
            
                if( !isNaN(B) && B>=0 ){
                    //get bit b of B
                    var bit=(B>>b)%2
                    img.filledRectangle(
                        BXOff + b*bitx, 
                        BYOff, 
                        BXOff + (b+1)*bitx, 
                        BYOff + bity, 
                        bit?c1:c0);
                } else {
                    img.filledRectangle(
                        BXOff, 
                        BYOff, 
                        BXOff + bitx*8, 
                        BYOff + bity, 
                        cX);
                }
                
            }       
    }
    var ChunkLabel = ChunkN+''
    ChunkLabel=padLabel.substring(0,padLabel.length-ChunkLabel.length)+ChunkLabel
    console.log(`Chunk ${ChunkLabel}: ${chunk.length}/${imgBytes}`)
    img.saveJpeg(`./chunk${ChunkLabel}.jpg`, 100, function(error) {
        if (error) throw error;
        img.destroy();
    })
}
console.log(`Generated image sequence from data. Run the following:
#Note youtube will minimum fps at 6, but occasionally drops frames
#Note ensure the name format is long enough for the number of frames.
# at 512 bytes per frame, 4 digits should be enough for 5MB.

TODO: 
    Generate an initial frame with some metadata about video length, checksum, etc.
    Make use of colors for repeated frames or other anomalies.`)