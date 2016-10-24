# manifest-glob-loader
A webpack loader to generate dynamic asset manifests for static assets (images, sounds, videos) for passing into a preloading system

# Differences from `manifest-loader`
This loader uses `glob` instead of `recursive-readdir` because I wanted to tap into the options such as `cwd` which lets you return relative paths more configurable.

#installation
``` npm install manifest-loader ```

#config

Define a block in your webpack config that specifies the following options, give it a meaningful key

```JavaScript
    var webpackConfig = {
        entry: {
            client: [jsSrc + "client.js"]
        },
        images: {
            globPattern: 'images/**/*',
            globOptions: {
              cwd: __dirname + '/../../app/assets/
            }
        },
     }
```

## globPattern
The pattern to match your static assets

## globOptions (optional)
Options to send to `glob`

#usage

First define a json file that you want to serve as your dynamic manifest- e.g. asset_manifest.json

```JavaScript
[]
```

then require that file wherever you need to dynamically load assets (this examples is using preloadJS)-

```JavaScript
import assetManifest from "bundle?lazy!json!manifest-loader?config=images/!../meta/asset_manifest.json"

export default class AssetLoader {
    static load( progress ) {
        return new Promise(( resolve, reject )=> {
            assetManifest(( files )=> {
                const preload = new createjs.LoadQueue();
                preload.addEventListener("complete", ()=> {
                    resolve();
                });
                preload.addEventListener("progress", ( event )=> {
                    progress(event);
                });
                //load each file into the manifest
                preload.loadManifest(files.map(f=> {
                    return {id: f, src: f}
                }));
            });
        })
    }
}
```

#output

The resulting module is an array of relative file paths-

```JavaScript

	module.exports = [
		"images/android-icon-144x144.png",
		"images/android-icon-192x192.png",
		"images/android-icon-36x36.png",
		"images/android-icon-48x48.png",
		"images/android-icon-72x72.png",
		"images/android-icon-96x96.png",
		"images/apple-icon-114x114.png",
		"images/apple-icon-120x120.png",
		"images/apple-icon-144x144.png",
		"images/apple-icon-152x152.png"];
```
