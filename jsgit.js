
function jsgit (params) {
	var contexts =  {
		AdobeAir : function (params) {
			var params   = params;
			var obj		 = this;
			console.log(params.gitCommand);
			obj.gitCommand       = params.gitCommand;
			obj.workingDirectory = params.workingDirectory; 
			obj.callGit				 = function (args, listener) {
		    	var nativeProcessStartupInfo = new air.NativeProcessStartupInfo(); 
				var gitExecutable = new air.File();
				var listener = listener;
				gitExecutable.nativePath = obj.gitCommand;
				nativeProcessStartupInfo.executable = gitExecutable;
				var processArgs = new air.Vector["<String>"](); 
				for (var i in args) {
					processArgs.push(args[i]);
				}
				nativeProcessStartupInfo.arguments = processArgs;
				//Set our initial directory to our repository for the command
				if (typeof(obj.workingDirectory) == 'string') {
					nativeProcessStartupInfo.workingDirectory = air.File.getRootDirectories()[0].resolvePath(obj.workingDirectory)
				}
				else {
					nativeProcessStartupInfo.workingDirectory = obj.workingDirectory;
				}
				//Call the init method of the listener that we were passed
				var process = new air.NativeProcess();
				
				//Hook up our intermediate event listener to the native air events
				process.addEventListener(air.ProgressEvent.STANDARD_OUTPUT_DATA, function (event) {
					listener.onData(process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable));
				});
				
		        process.addEventListener(air.ProgressEvent.STANDARD_ERROR_DATA, function (event) {
					listener.onErrorData(process.standardError.readUTFBytes(process.standardError.bytesAvailable));
				});
				
		        process.addEventListener(air.NativeProcessExitEvent.EXIT, function(event) {
		        	listener.onExit(event.exitCode);	
		        });
		        var onIOError = function (event) {
		        	listener.onErrorData(event.toString());
		        	listener.onExit(-1);
		        }
		        process.addEventListener(air.IOErrorEvent.STANDARD_OUTPUT_IO_ERROR, onIOError);
		        process.addEventListener(air.IOErrorEvent.STANDARD_ERROR_IO_ERROR, onIOError);
				
				process.start(nativeProcessStartupInfo);   
				listener.commandCalled = gitExecutable.nativePath  + ' ' + args.join(' ');
		    }	
		    
		    return obj;
		}
	}
	
	//If we are not passed an object context, then we try on of the included contexts ("AdobeAir")
	if (typeof(params.context) != 'object') {
		var context = new contexts[params.context](params);
	} else {
		var context = new params.context(params);
	}
	
	var jsgitInstance = {
		context    : context,
		setDirectory :function setDirectory(directory) {
			context.workingDirectory = directory;
		},
		workingDir   : params.workingDir,
		Listener   : function () {
			var obj           = this;
		    obj.data          = '';
		    obj.errorData 	  = '';
		    obj.exitCode  	  = null;
		    obj.commandCalled = null;
		  
		    obj.onData = function (data) {
		    	obj.data += data;
		    }
		    
		    obj.onErrorData = function (errorData) {
		    	obj.onErrorData += errorData;
		    }
		    
		    obj.onExit = function (exitCode) {
		    	obj.exitCode = exitCode;
		    	if(exitCode == 0) {
		    		obj.onComplete(obj.data)
		    	}
		    	else {
		    		obj.onError(obj.exitCode, obj.errorData)
		    	} 
		    }
		    
		    obj.onComplete = function(data) {
		    	//Do custom stuff with data here
		    	console.log(data)
		    }
		    
		    obj.onError = function (exitCode, errorData) {
		    	//Do custom stuff with error data here
		    	console.log(exitCode + '  ' + errorData);	
		    }
		    
		    return obj;
		},
		callGit : function (args, listener) {
			context.callGit(args, listener) 
		}
	}; 
	return jsgitInstance;
}

 
