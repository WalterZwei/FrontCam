var LiveAssistant = Class.create({
	initialize: function(mainscene) {
		this.mainscene = mainscene;
		this.pictureTaken = this.pictureTaken.bind(this);
		this.takePicture = this.takePicture.bind(this);

	},

	setup: function() {
		this.controller.setupWidget(Mojo.Menu.appMenu, StageAssistant.appMenuAttributes, StageAssistant.appMenuModel);

		this.cmdMenuModel = {items: [{}]};
		this.cmdMenuModel.items[0]= {label: "switch", command: "switch-cmd"};
		this.controller.setupWidget(Mojo.Menu.commandMenu, this.handleCommand, this.cmdMenuModel);
		//this.controller.modelChanged(this.cmdMenuModel);
        this.startCamera("Front Camera");
    },

    handleCommand: function(event) {
        if (event.type == Mojo.Event.command) {
            switch(event.command) {
                case "switch-cmd":
                    if( this.currentCam == 'Front Camera' ) {
                       this.startCamera("Camera/Camcorder");
                    } else { 
                       this.startCamera("Front Camera");
                    }
                    break;
            }
        } else if (event.type === Mojo.Event.back) {
            this.poppingScene = true;
        }

    },


    startCamera: function(sName) {
	  //this.controller.enableFullScreenMode(true);

		var deviceinfo = JSON.parse(PalmSystem.deviceInfo);

		this.video = document.createElement("video");
		this.video.setAttribute("width", deviceinfo.screenWidth);
		this.video.setAttribute("height", deviceinfo.screenHeight );
		this.video.setAttribute("showControls", true);

		$('live-content').appendChild(this.video);

		this.mediaCaptureObj = libraries.mediacapture.MediaCapture({video: this.video});

		Mojo.Log.info("available capture devices: %s", JSON.stringify(this.mediaCaptureObj.captureDevices));
//available capture devices: [
//  {"inputtype":[1]," deviceUri":"audio:","description":"Front Microphone"},
//  {"inputtype":[2,3],"deviceUri":"video:","description":"Camera/Camcorder"},
//  {"inputtype":[2],"deviceUri":"video:1","description":"Front Camera"}]

		var sources = this.getVideoSources(this.mediaCaptureObj);
		this.captureDevice = this.selectCamera(sources,sName);

		this.mediaCaptureObj.load(this.captureDevice.deviceUri, {imageCaptureFormat: this.captureDevice.format});
		this.mediaCaptureObj.addEventListener("imagecapturecomplete", this.pictureTaken, false);

		/* setup widgets here */
		this.controller.listen('live-content', Mojo.Event.tap, this.takePicture);
        this.currentCam = sName;
		this.live_running = false;

		/* add event handlers to listen to events from widgets */
	},

	getVideoSources: function(mediaCaptureObj) {
		var list = [], i, d, f = false, f1;

		for (i = 0; i < mediaCaptureObj.supportedImageFormats.length; i++) {
			f1 = mediaCaptureObj.supportedImageFormats[i];
			if (f1.mimetype == "image/jpeg" && (!f || f1.samplerate > f.samplerate)) f = f1;
		}

		for (i = 0; i < mediaCaptureObj.captureDevices.length; i++) {
			d = mediaCaptureObj.captureDevices[i];
			for (typeIdx = 0; typeIdx != d.inputtype.length; ++typeIdx) {
				if (d.inputtype[typeIdx] == this.mediaCaptureObj.INPUT_TYPE_IMAGE) {
					/* found image/video device */
					list.push({ deviceUri: d.deviceUri, format: f, description: d.description, device: d });
					break;
				}
			}
		}
		return list;
	},

	selectCamera: function(sources,sName) {
		/* prefer the <sName> camera */
		var sel = 0, i;
		for (i = 0; i < sources.length; i++) {
			if (sources[i].description == sName) {
				sel = i;
			}
		}
		return sources[sel];
	},

	pictureTaken: function(event) {
		Mojo.Log.info("picture taken");
		//Mojo.Log.info("picture taken %s", JSON.stringify(event));
	},

	takePicture: function(event) {
        var date = new Date();
        var YYYY = date.getFullYear();
        var MM = (1+date.getMonth()); if (MM<10)   { MM = "0"+MM; }
        var DD = (0+date.getDate());  if (DD<10)   { DD = "0"+DD; }
        var hh = date.getHours();     if (hh < 10) { hh = "0"+hh; }
        var mm = date.getMinutes();   if (mm < 10) { mm = "0"+mm; }
        var ss = date.getSeconds();   if (ss < 10) { ss = "0"+ss; }
        var imgFilename = "/media/internal/DCIM/100PALM/pre_" 
                          + YYYY + "-" +  MM + "-" + DD + "-" + hh + mm + ss
                          + "-f.jpg";
		Mojo.Log.info("picture taking ... %s", imgFilename);
		this.mediaCaptureObj.startImageCapture(imgFilename,
			{ quality: 100, flash: 0, reviewDuration: 5, exifData: { } });
	},

	activate: function(event) {
		this.controller.stageController.setWindowProperties({blockScreenTimeout: true});

		if (!this.live_running) {
			this.live_running = true;
		   // this.takePicture();
		}
	},

	deactivate: function(event) {
		this.controller.stageController.setWindowProperties({blockScreenTimeout: false});
		this.live_running = false;

		/* remove any event handlers you added in activate and do any other cleanup that should happen before
		   this scene is popped or another scene is pushed on top */
	},

	cleanup: function(event) {
		/* this function should do any cleanup needed before the scene is destroyed as 
		   a result of being popped off the scene stack */
		if (this.mediaCaptureObj) {
			this.mediaCaptureObj.removeEventListener("imagecapturecomplete", this.pictureTaken , false);
			this.mediaCaptureObj.unload();
			this.mediaCaptureObj = false;
		}
		this.controller.stopListening('live-content', Mojo.Event.tap, this.takePicture);
	},
});



