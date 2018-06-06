# tcgen
A unit test case generator. It will intercept the methods of class and save the input and output to file.
> `tcgen` is a tool that will primarily capture (and generate) the unit test cases for your methods of a class. It acts like interceptor on the method calls of instance created of the the class.

# Why tcgen ?
* It generates the real time data, the input and output of the method calls
* Supports object oriented design
* Supports async method calls
* Also supports error first callbacks which is passed at the rear of the parameters in method call
* Test casees are export as json that can be consumed seamlessly or converted into any other format very easily.

# How to use ?
#### install it
```
npm install --save-dev tcgen
```
#### create a json configuation, and save it to a file
```json
{
   "srcPath": "/the/path/where/your/application/code/exists",
   "noClassFiles" : [
     "index.js", "section.js", "fileNotToTest.js"
   ],
   "outpath" : "/output/path/where/the/test/cases/will/be/generated"
}
```
Default values of this json goes as below
```json
{
   "srcPath": process.cwd(),
   "noClassFiles" : [],
   "outpath" : path.join(tmpdir, 'tcgen')
}
```
### export the file path of config as env variable
```
export TCGEN_CONFIG_PATH=/my/config/path
```
#### or run the appliation as below
```
TCGEN_CONFIG_PATH=/my/config/path node my-node-app.js
```

### use it
Somewhere in your application, but before initializing any class.
```javascript
if (process.env.ENV !== 'production') { // on production we should not load this
  require('tcgen')
}
```

Or if you don't want to use env variable
```javascript
if (process.env.ENV !== 'production') { //
  new (require('tcgen'))(theConfigDefinedAbove)
}
```
