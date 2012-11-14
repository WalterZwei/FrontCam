var MainAssistant = Class.create({
	initialize: function() {
		this.launchCam = this.launchCam.bind(this);
		this.onLive = this.onLive.bind(this);
		this.decodingSpinnerModel = { spinning: false };
	},

	setup: function() {



		this.controller.setupWidget(Mojo.Menu.appMenu, StageAssistant.appMenuAttributes, StageAssistant.appMenuModel);

		this.img = $('qrimage');
		this.resulttext = '';
		/* this function is for setup tasks that have to happen when the scene is first created */

		/* use Mojo.View.render to render view templates and add them to the scene, if needed */

		/* setup widgets here */
		this.controller.setupWidget('buttonShoot', { }, { label: $L('Take picture'), disabled: false });
		this.controller.setupWidget('buttonLive', { }, { label: $L('Frontcam'), disabled: false });

		this.controller.setupWidget('result-textfield',
			{ multiline: true, focusMode: Mojo.Widget.focusSelectMode },
			{ value: '', disabled: false });

		this.controller.setupWidget('decodingSpinner', { }, this.decodingSpinnerModel);

		this.useImage(MainAssistant.imgFilename);

		/* add event handlers to listen to events from widgets */

		this.controller.listen('qrimage', Mojo.Event.tap, this.launchCam);
		this.controller.listen('buttonShoot', Mojo.Event.tap, this.launchCam);
		this.controller.listen('buttonLive', Mojo.Event.tap, this.onLive);

		this.scrollto_result = false;
      	this.controller.stageController.pushScene({name: 'live'}, this);
	},

	useImage: function(filename) {
		if (filename != MainAssistant.imgFilename) {
		}
		this.img.src = filename + "?" + (new Date()).getTime(); /* force refresh with ?... */
		this.currentFilename = filename;
	},

	launchCam: function(event) {
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad') {
			Mojo.Controller.errorDialog("Cannot take pictures on this device. Use 'DigiCamera Lite' or a similar camera app on your touchpad to take pictures");
		} else {
			this.controller.stageController.pushScene(
				{ appId: 'com.palm.app.camera', name: 'capture' },
				{ sublaunch: true, mode: 'still', filename: MainAssistant.imgFilename }
			);
		}
	},

	onLive: function() {
		this.controller.stageController.pushScene({name: 'live'}, this);
	},

	scrollTo: function(element) {
		Mojo.View.getScrollerForElement(element).mojo.revealElement(element);
	},

	showResult: function(resulttext, barcodeformat) {
	},

	showError: function(resulttext) {
		this.resulttext = '';
		$('error-text').innerHTML = resulttext;

		$('resultGroup').hide();
		$('resultPlainGroup').hide();
		$('errorGroup').show();
		this.scrollTo($('bottomScroller'));
	},

	clearResult: function() {
		this.resulttext = '';
	},

	activate: function(event) {
		if (this.scrollto_result) {
			this.scrollto_result = false;
			this.scrollTo($('bottomScroller'));
		}
		if (event && event.filename) {
			this.useImage(event.filename);
		}
	},

	deactivate: function(event) {
		this.scrollto_result = false;
		/* remove any event handlers you added in activate and do any other cleanup that should happen before
		   this scene is popped or another scene is pushed on top */
	},

	cleanup: function(event) {
		/* this function should do any cleanup needed before the scene is destroyed as 
		   a result of being popped off the scene stack */
		this.controller.stopListening('qrimage', Mojo.Event.tap, this.launchCam);
		this.controller.stopListening('buttonShoot', Mojo.Event.tap, this.launchCam);
		this.controller.stopListening('buttonLive', Mojo.Event.tap, this.onLive);
	},

	handleCommand: function(event) {
	},
});

MainAssistant.imgFilename = "/media/internal/.de.u32.frontcam/tmp.jpg";
