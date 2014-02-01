[Traceur Compiler](https://github.com/google/traceur-compiler) (Atma Plugin)
-----
[![Build Status](https://travis-ci.org/atmajs/atma-loader-traceur.png?branch=master)](https://travis-ci.org/atmajs/atma-loader-traceur)

The Plugin extends:
- [`IncludeJS`](https://github.com/atmajs/IncludeJS) with a custom loader
- [`atma-io`](https://github.com/atmajs/atma-io) with a custom middleware to read ES6 files
- [`atma-server`](https://github.com/atmajs/atma-server) and [`Atma Toolkit`](https://github.com/atmajs/Atma.Toolkit) with a `HTTPHandler` to serve compiled sources (with **sourceMap** support)



##### How to use

###### Embed into the Project

+ add a `package.json` file to your projects root directory.
+ `npm install atma-loader-traceur -save`
+ Edit `package.json`, so that it contains at least these data:

    ```json
        {
            "dependencies": {
                "atma-loader-traceur"
            },
            "plugins": [
                "atma-loader-traceur"
            ],
            "settings": {
                "traceur-extension": "jsnext"
                // @default: "jsnext"
                // or define any other extension to be handled by the compiler
                // "js" is also possible

                "traceur-options": Object
                // @optional, @default null
                // any options you want to pass to the traceur-compiler
            }
        }
    ```
+ That's all. Now, you are ready to use the 'next javascript' in your project

##### Quick Try

+ add `package.json` as described
+ add `test.html` to the directory

    ```html
    <!DOCTYPE html>
    <script src='test.jsnext'></script>
    ```
+ add `test.jsnext`
    
    ```javascript
    setInterval(() => document.body.textContent += ".. itworks ..", 200);
    ```
+ start the server: `$ atma server` (havent installed atma? Then `$ npm install atma -g`)
+ open the browser: `http://localhost:5777/test.html`



----
The MIT License