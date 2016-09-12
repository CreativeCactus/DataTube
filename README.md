# DataTube
Host your data in videos!

<video width="320" height="240" controls>
  <source src="https://raw.githubusercontent.com/CreativeCactus/DataTube/master/record.webm" type="video/webm">
Your browser does not support the video tag.
</video>

Generate image sequence, convert to video.
``` 
    node generate.js /full/path/to/file.txt
    ffmpeg -r 2 -i 'chunk%04d.jpg' -vcodec libvpx output.webm; rm chunk*.jpg
```
Upload the resulting output.webm to youtube, and call decode.js with an arg for a youtube->mp4 feature
Then split to images and decode them.

```
node decode.js yzNNLpfX7zw
rm dhunk0000*.jpg; ffmpeg -i download.mp4 'dhunk%09d.jpg'
node decode.js
```
