# DataTube
Host your data in videos!

<img src="http://raw.githubusercontent.com/CreativeCactus/DataTube/master/record.gif"></img>

Generate image sequence, convert to video. The specified file will be added to a zip file in memory, converted into a string, and represented as a list of jpg files.
The following ffmpeg command will compose them into a webm file. ENSURE THAT THE FORMATTER INDICATES THE CORRECT NUMBER OF DIGITS FOR YOUR FILE LIST. (chunk%02d.jpg for chunk01.jpg and so on.) 
``` 
    node generate.js /full/path/to/file.txt
    ffmpeg -r 2 -i 'chunk%04d.jpg' -vcodec libvpx output.webm; rm chunk*.jpg
```
Upload the resulting output.webm to youtube, and call decode.js with an argument for a youtube->mp4 feature (make sure the video is published :P )
Then split to images and decode them with node decodse.js.

```
node decode.js yzNNLpfX7zw
rm dhunk0000*.jpg; ffmpeg -i download.mp4 'dhunk%09d.jpg'
node decode.js
```
