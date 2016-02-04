# template-producer 

This module requires Node version > 4.0

#Install

NPM: npm install -g template-producer

#Usage

```
/* File declaring parameters' values */
/* params.txt */
{
	"fi": {
		"page-title":"Hymy",
		"title":"Hymy",
		"image":"http://static4.fjcdn.com/comments/Welcome+to+the+finnish+language+we+hope+you+wont+enjoy+_430d35ecaaedd0521e553557ca0be1c9.png",
		"caption":"Olet kaunis kun hymyilet."
	},
	"vi":{
		"page-title":"Cười lên nào",
		"title":"Cười lên nào",
		"image":"http://www.samoppenheim.com/photos/Vietnam-HoiAn-Boatman.jpg",
		"caption":"Bạn xinh nhất khi cười."
	}
}
```
**Note**: the file extension doesn't matter, but the content must be of json type
```

/* File template */
/* smile.temp.html */


<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title data-dh-parameter="page-title">Smile</title>

</head>
<body style="text-align:center">
	<h1 data-dh-parameter="title">Smile more</h1>
	<img data-dh-parameter="image" src="https://smilesolution.files.wordpress.com/2010/07/austin_danger_powers_mike_myers.jpg?w=300&h=259" alt="smile_img">
	<h3 data-dh-parameter="caption">You're beautiful when you smile.</h3>
</body>
</html>
```

Run command: `template-producer smile.temp.html params.txt`

You will see 2 files: smile.fi.html and smile.vi.html where elements' with data-dh-parameter attribute are replaced regarding parameters in params.txt.

On version 1.2.0: Pass `--watch` to watch for changes and rerun the task
